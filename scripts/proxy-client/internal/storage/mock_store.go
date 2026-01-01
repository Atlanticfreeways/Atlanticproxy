package storage

import (
	"github.com/atlanticproxy/proxy-client/internal/billing"
)

type MockStore struct {
	Whitelist    []string
	CustomRules  []string
	Subscription *billing.PersistedSubscription
	UsageData    int64
	UsageReqs    int64
	UsageAds     int64
	UsageThreats int64
	UsageErr     error
}

func NewMockStore() *MockStore {
	return &MockStore{
		Whitelist:   []string{},
		CustomRules: []string{},
	}
}

func (m *MockStore) GetWhitelist() ([]string, error) {
	return m.Whitelist, nil
}

func (m *MockStore) AddToWhitelist(domain string) error {
	m.Whitelist = append(m.Whitelist, domain)
	return nil
}

func (m *MockStore) RemoveFromWhitelist(domain string) error {
	for i, d := range m.Whitelist {
		if d == domain {
			m.Whitelist = append(m.Whitelist[:i], m.Whitelist[i+1:]...)
			return nil
		}
	}
	return nil
}

func (m *MockStore) GetCustomRules() ([]string, error) {
	return m.CustomRules, nil
}

func (m *MockStore) SetCustomRules(rules []string) error {
	m.CustomRules = rules
	return nil
}

func (m *MockStore) GetSubscription() (*billing.PersistedSubscription, error) {
	return m.Subscription, nil
}

func (m *MockStore) SetSubscription(userID, id, planID, status, start, end string, autoRenew bool) error {
	m.Subscription = &billing.PersistedSubscription{
		ID:        id,
		PlanID:    planID,
		Status:    status,
		StartDate: start,
		EndDate:   end,
		AutoRenew: autoRenew,
	}
	return nil
}

func (m *MockStore) GetLatestUsage() (int64, int64, int64, int64, error) {
	if m.UsageErr != nil {
		return 0, 0, 0, 0, m.UsageErr
	}
	return m.UsageData, m.UsageReqs, m.UsageAds, m.UsageThreats, nil
}

func (m *MockStore) UpdateUsage(dataTransferred, requests, ads, threats int64) error {
	m.UsageData += dataTransferred
	m.UsageReqs += requests
	m.UsageAds += ads
	m.UsageThreats += threats
	return nil
}
