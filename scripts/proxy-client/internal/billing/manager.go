package billing

import (
	"errors"
	"sync"
	"time"

	"github.com/google/uuid"
)

type Store interface {
	GetSubscription() (*PersistedSubscription, error)
	SetSubscription(id, planID, status, start, end string, autoRenew bool) error
	GetLatestUsage() (int64, int64, int64, int64, error)
	UpdateUsage(dataTransferred, requests, ads, threats int64) error
}

type PersistedSubscription struct {
	ID        string
	PlanID    string
	Status    string
	StartDate string
	EndDate   string
	AutoRenew bool
}

// Manager handles subscription state and logic
type Manager struct {
	mu               sync.RWMutex
	subscription     *Subscription
	Usage            *UsageTracker
	store            Store
	paystackProvider *PaystackProvider
	cryptoProvider   *CryptoProvider
}

func NewManager(store Store) *Manager {
	m := &Manager{
		Usage: NewUsageTracker(),
		store: store,
	}

	if store != nil {
		if s, err := store.GetSubscription(); err == nil && s != nil {
			start, _ := time.Parse(time.RFC3339, s.StartDate)
			end, _ := time.Parse(time.RFC3339, s.EndDate)
			m.subscription = &Subscription{
				ID:        s.ID,
				PlanID:    PlanType(s.PlanID),
				Status:    s.Status,
				StartDate: start,
				EndDate:   end,
				AutoRenew: s.AutoRenew,
			}
		}
		if data, reqs, ads, _, err := store.GetLatestUsage(); err == nil {
			m.Usage.mu.Lock()
			m.Usage.currentUsage.DataTransferred = data
			m.Usage.currentUsage.RequestsMade = reqs
			m.Usage.currentUsage.AdsBlocked = ads
			m.Usage.mu.Unlock()
		}
	}

	if m.subscription == nil {
		// Default to Starter
		m.subscription = &Subscription{
			ID:        uuid.New().String(),
			PlanID:    PlanStarter,
			Status:    "active",
			StartDate: time.Now(),
			EndDate:   time.Now().AddDate(0, 1, 0),
			AutoRenew: true,
		}
	}

	return m
}

func (m *Manager) SetPaystack(p *PaystackProvider) { m.paystackProvider = p }
func (m *Manager) SetCrypto(p *CryptoProvider)     { m.cryptoProvider = p }

func (m *Manager) ProcessCheckout(req CheckoutRequest) (*CheckoutResponse, error) {
	switch req.Method {
	case MethodPaystack:
		if m.paystackProvider == nil {
			return nil, errors.New("paystack not configured")
		}
		return m.paystackProvider.CreateCheckout(req)
	case MethodCrypto:
		if m.cryptoProvider == nil {
			return nil, errors.New("crypto not configured")
		}
		return m.cryptoProvider.CreateCheckout(req)
	}
	return nil, errors.New("unsupported payment method")
}

// GetSubscription returns the current active subscription
func (m *Manager) GetSubscription() *Subscription {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.subscription
}

// Subscribe updates the current subscription
func (m *Manager) Subscribe(planID PlanType) (*Subscription, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	_, err := GetPlan(planID)
	if err != nil {
		return nil, err
	}

	m.subscription = &Subscription{
		ID:        uuid.New().String(),
		PlanID:    planID,
		Status:    "active",
		StartDate: time.Now(),
		EndDate:   time.Now().AddDate(0, 1, 0),
		AutoRenew: true,
	}

	if m.store != nil {
		m.store.SetSubscription(
			m.subscription.ID,
			string(m.subscription.PlanID),
			m.subscription.Status,
			m.subscription.StartDate.Format(time.RFC3339),
			m.subscription.EndDate.Format(time.RFC3339),
			m.subscription.AutoRenew,
		)
	}

	return m.subscription, nil
}

// CancelSubscription marks the subscription as canceled (no auto-renew)
func (m *Manager) CancelSubscription() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.subscription == nil {
		return nil
	}

	m.subscription.AutoRenew = false
	m.subscription.Status = "canceled"

	if m.store != nil {
		m.store.SetSubscription(
			m.subscription.ID,
			string(m.subscription.PlanID),
			m.subscription.Status,
			m.subscription.StartDate.Format(time.RFC3339),
			m.subscription.EndDate.Format(time.RFC3339),
			m.subscription.AutoRenew,
		)
	}
	return nil
}

// SyncUsage persists current usage to storage
func (m *Manager) SyncUsage() error {
	if m.store == nil {
		return nil
	}
	stats := m.Usage.GetStats()
	return m.store.UpdateUsage(stats.DataTransferred, stats.RequestsMade, stats.AdsBlocked, stats.ThreatsBlocked)
}

// CheckQuota checks if the current usage is within the plan's limits
func (m *Manager) CheckQuota() error {
	m.mu.RLock()
	sub := m.subscription
	m.mu.RUnlock()

	if sub == nil {
		return errors.New("no active subscription")
	}

	if sub.Status != "active" && sub.Status != "canceled" {
		if time.Now().After(sub.EndDate) {
			return errors.New("subscription expired")
		}
	}

	plan, err := GetPlan(sub.PlanID)
	if err != nil {
		return err
	}

	stats := m.Usage.GetStats()

	// Check Data Limit
	if plan.DataLimitMB != -1 {
		limitBytes := plan.DataLimitMB * 1024 * 1024
		if stats.DataTransferred >= limitBytes {
			return errors.New("data limit exceeded")
		}
	}

	// Check Request Limit
	if plan.RequestLimit != -1 {
		if stats.RequestsMade >= plan.RequestLimit {
			return errors.New("request limit exceeded")
		}
	}

	return nil
}

// CanAcceptConnection checks if the user can open a new connection
func (m *Manager) CanAcceptConnection() error {
	if err := m.CheckQuota(); err != nil {
		return err
	}

	m.mu.RLock()
	sub := m.subscription
	m.mu.RUnlock()

	plan, _ := GetPlan(sub.PlanID)

	stats := m.Usage.GetStats()
	if plan.ConcurrentConns != -1 && stats.ActiveConnections >= plan.ConcurrentConns {
		return errors.New("concurrent connection limit exceeded")
	}

	return nil
}
