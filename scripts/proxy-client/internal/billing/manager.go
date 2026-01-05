package billing

import (
	"errors"
	"sync"
	"time"

	"github.com/google/uuid"
)

type Store interface {
	GetSubscription(userID string) (*PersistedSubscription, error)
	SetSubscription(userID, id, planID, status, start, end string, autoRenew bool) error
	GetLatestUsage(userID string) (int64, int64, int64, int64, error)
	UpdateUsage(userID string, dataTransferred, requests, ads, threats int64) error
}

type PersistedSubscription struct {
	ID        string
	PlanID    string
	Status    string
	StartDate string
	EndDate   string
	AutoRenew bool
}

// Manager handles all billing, subscription, and quota logic.
// It is responsible for plan enforcement, usage tracking, and invoice generation.
type Manager struct {
	store        Store // Changed from *storage.Store to Store interface to match existing usage
	subscription *Subscription
	mu           sync.RWMutex
	quotaReset   *time.Timer
	// Retaining other fields from original Manager struct that were not explicitly removed in the instruction's new struct definition
	activeUserID     string
	activeCurrency   CurrencyCode
	Usage            *UsageTracker
	paystackProvider *PaystackProvider
	cryptoProvider   *CryptoProvider
}

// NewManager creates a new instance of the Billing Manager.
// It initializes the manager with the provided store and loads the current subscription if any.
func NewManager(store Store) *Manager {
	m := &Manager{
		Usage:          NewUsageTracker(),
		store:          store,
		activeUserID:   "default", // Default to "default" until login
		activeCurrency: CurrencyUSD,
	}

	// Try to load default user provided they exist or just start fresh
	m.loadUser("default")

	return m
}

func (m *Manager) SetActiveUser(userID string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	// Sync current user before switching
	if m.subscription != nil {
		m.syncUsageLocked()
	}

	m.activeUserID = userID
	return m.loadUserLocked(userID)
}

func (m *Manager) loadUser(userID string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.loadUserLocked(userID)
}

func (m *Manager) loadUserLocked(userID string) error {
	// Reset usage tracker for new user
	m.Usage = NewUsageTracker()

	if m.store != nil {
		if s, err := m.store.GetSubscription(userID); err == nil && s != nil {
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
		} else {
			m.subscription = nil
		}

		if data, reqs, ads, _, err := m.store.GetLatestUsage(userID); err == nil {
			m.Usage.mu.Lock()
			m.Usage.currentUsage.DataTransferred = data
			m.Usage.currentUsage.RequestsMade = reqs
			m.Usage.currentUsage.AdsBlocked = ads
			m.Usage.mu.Unlock()
		}
	}

	// Auto-subscribe to Starter if no sub
	if m.subscription == nil {
		m.subscription = &Subscription{
			ID:        uuid.New().String(),
			PlanID:    PlanStarter,
			Status:    "active",
			StartDate: time.Now(),
			EndDate:   time.Now().AddDate(0, 1, 0),
			AutoRenew: true,
		}
		// Persist this auto-created sub
		if m.store != nil {
			m.store.SetSubscription(
				userID,
				m.subscription.ID,
				string(m.subscription.PlanID),
				m.subscription.Status,
				m.subscription.StartDate.Format(time.RFC3339),
				m.subscription.EndDate.Format(time.RFC3339),
				m.subscription.AutoRenew,
			)
		}
	}
	return nil
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

// SetCurrency updates the active currency for pricing
func (m *Manager) SetCurrency(c CurrencyCode) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.activeCurrency = c
}

// GetAvailablePlans returns plans in the active currency
func (m *Manager) GetAvailablePlans() []Plan {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return AvailablePlansInCurrency(m.activeCurrency)
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
			m.activeUserID,
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

// SubscribeUser creates a subscription for a specific user (for webhook/admin use)
func (m *Manager) SubscribeUser(userID string, planID PlanType, subscriptionID string) error {
	_, err := GetPlan(planID)
	if err != nil {
		return err
	}

	if m.store != nil {
		return m.store.SetSubscription(
			userID,
			subscriptionID,
			string(planID),
			"active",
			time.Now().Format(time.RFC3339),
			time.Now().AddDate(0, 1, 0).Format(time.RFC3339),
			true,
		)
	}

	return nil
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
			m.activeUserID,
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
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.syncUsageLocked()
}

func (m *Manager) syncUsageLocked() error {
	if m.store == nil {
		return nil
	}
	stats := m.Usage.GetStats()
	return m.store.UpdateUsage(m.activeUserID, stats.DataTransferred, stats.RequestsMade, stats.AdsBlocked, stats.ThreatsBlocked)
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

// ResetQuotas resets the usage tracking for the new billing cycle
func (m *Manager) ResetQuotas() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.Usage.mu.Lock()
	m.Usage.currentUsage = &UsageStats{} // Reset to zero
	m.Usage.mu.Unlock()

	if m.store != nil {
		// Update store with zero values
		return m.store.UpdateUsage(m.activeUserID, 0, 0, 0, 0)
	}

	return nil
}
