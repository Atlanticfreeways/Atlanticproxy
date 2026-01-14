package storage

// InMemoryStore is a no-op implementation of the Store interface
// Used as a fallback when SQLite initialization fails
type InMemoryStore struct{}

// NewInMemoryStore creates a new in-memory store that does nothing
func NewInMemoryStore() *InMemoryStore {
	return &InMemoryStore{}
}

// No-op implementations for all Store interface methods
func (s *InMemoryStore) GetWhitelist() ([]string, error)                  { return []string{}, nil }
func (s *InMemoryStore) AddToWhitelist(domain string) error               { return nil }
func (s *InMemoryStore) RemoveFromWhitelist(domain string) error          { return nil }
func (s *InMemoryStore) GetCustomRules() ([]string, error)                { return []string{}, nil }
func (s *InMemoryStore) AddCustomRule(rule string) error                  { return nil }
func (s *InMemoryStore) RemoveCustomRule(rule string) error               { return nil }
func (s *InMemoryStore) UpdateUsage(userID string, bytesUsed int64) error { return nil }
func (s *InMemoryStore) Close() error                                     { return nil }
