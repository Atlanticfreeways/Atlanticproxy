package billing

import (
	"errors"
	"testing"
	"time"
)

// MockStore implements Store interface for testing
type MockStore struct {
	subs  map[string]*PersistedSubscription
	usage map[string]*mockUsage
}

type mockUsage struct {
	data, reqs, ads, threats int64
}

func NewMockStore() *MockStore {
	return &MockStore{
		subs:  make(map[string]*PersistedSubscription),
		usage: make(map[string]*mockUsage),
	}
}

func (m *MockStore) GetSubscription(userID string) (*PersistedSubscription, error) {
	if sub, ok := m.subs[userID]; ok {
		return sub, nil
	}
	return nil, nil
}

func (m *MockStore) SetSubscription(userID, id, planID, status, start, end string, autoRenew bool) error {
	m.subs[userID] = &PersistedSubscription{
		ID:        id,
		PlanID:    planID,
		Status:    status,
		StartDate: start,
		EndDate:   end,
		AutoRenew: autoRenew,
	}
	return nil
}

func (m *MockStore) GetLatestUsage(userID string) (int64, int64, int64, int64, error) {
	if u, ok := m.usage[userID]; ok {
		return u.data, u.reqs, u.ads, u.threats, nil
	}
	return 0, 0, 0, 0, nil
}

func (m *MockStore) UpdateUsage(userID string, dataTransferred, requests, ads, threats int64) error {
	if _, ok := m.usage[userID]; !ok {
		m.usage[userID] = &mockUsage{}
	}
	u := m.usage[userID]
	u.data += dataTransferred
	u.reqs += requests
	u.ads += ads
	u.threats += threats
	return nil
}

func (m *MockStore) CreateTransaction(id, userID, planID string, amount float64, currency, status, method string, createdAt time.Time) error {
	return nil
}
func (m *MockStore) GetTransaction(id string) (string, string, string, float64, string, string, string, time.Time, error) {
	return "", "", "", 0, "", "", "", time.Time{}, errors.New("not found")
}
func (m *MockStore) DeleteSession(token string) error { return nil }

func TestBillingPlanUpgrade(t *testing.T) {
	store := NewMockStore()
	manager := NewManager(store)

	userID := "test-user"
	manager.activeUserID = userID // Force active user

	// 1. Subscribe to Starter
	// Manager uses activeUserID implicitly
	_, err := manager.Subscribe(PlanStarter)
	if err != nil {
		t.Fatalf("Failed to subscribe: %v", err)
	}

	sub := manager.GetSubscription()
	if sub.PlanID != PlanStarter {
		t.Errorf("Expected plan %s, got %s", PlanStarter, sub.PlanID)
	}

	// 2. Upgrade to Team
	_, err = manager.Subscribe(PlanTeam)
	if err != nil {
		t.Fatalf("Failed to upgrade: %v", err)
	}

	sub = manager.GetSubscription()
	if sub.PlanID != PlanTeam {
		t.Errorf("Expected plan %s, got %s", PlanTeam, sub.PlanID)
	}
}

func TestQuotaEnforcementMock(t *testing.T) {
	store := NewMockStore()
	manager := NewManager(store)
	userID := "quota-user"
	manager.activeUserID = userID

	// Subscribe to Free tier (Starter)
	manager.Subscribe(PlanStarter)

	// Simulate Usage
	// 1GB = 1024*1024*1024 bytes
	usage := int64(1024 * 1024 * 1024)

	// Check quota before update
	if err := manager.CheckQuota(); err != nil {
		t.Errorf("Expected quota check to pass initially, got error: %v", err)
	}

	// Track usage manually via UsageTracker since manager wrapper doesn't exist
	manager.Usage.AddData(usage)
	manager.Usage.AddRequest()

	// Retrieve usage
	stats := manager.Usage.GetStats()
	if stats.DataTransferred < usage {
		t.Errorf("Expected usage >= %d, got %d", usage, stats.DataTransferred)
	}
}

func TestCurrencySwitchingMock(t *testing.T) {
	manager := NewManager(NewMockStore())

	// Default USD
	if manager.activeCurrency != CurrencyUSD {
		t.Errorf("Expected default currency USD")
	}

	// Switch
	manager.SetCurrency(CurrencyEUR)
	// Check internal state since GetCurrency getter might not exist
	if manager.activeCurrency != CurrencyEUR {
		t.Errorf("Expected currency EUR")
	}

	// Get Plan Price
	plans := manager.GetAvailablePlans()
	found := false
	for _, p := range plans {
		if p.ID == PlanStarter {
			if p.Currency != string(CurrencyEUR) {
				t.Errorf("Expected plan currency EUR, got %s", p.Currency)
			}
			found = true
		}
	}
	if !found {
		t.Error("Starter plan not found")
	}
}
