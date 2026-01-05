package adblock

import (
	"bufio"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"
)

type Store interface {
	GetWhitelist() ([]string, error)
	AddToWhitelist(domain string) error
	RemoveFromWhitelist(domain string) error
	GetCustomRules() ([]string, error)
	SetCustomRules(rules []string) error
}

type BlocklistManager struct {
	blockedDomains     map[string]string // domain -> category
	whitelist          map[string]bool
	customRules        map[string]bool
	disabledCategories map[string]bool
	lastUpdated        time.Time
	stats              map[string]int64
	store              Store
	mu                 sync.RWMutex
}

func NewBlocklistManager(store Store) *BlocklistManager {
	m := &BlocklistManager{
		blockedDomains:     make(map[string]string),
		whitelist:          make(map[string]bool),
		customRules:        make(map[string]bool),
		disabledCategories: make(map[string]bool),
		stats:              make(map[string]int64),
		store:              store,
	}

	if store != nil {
		// Load persisted data
		if w, err := store.GetWhitelist(); err == nil {
			for _, d := range w {
				m.whitelist[d] = true
			}
		}
		if c, err := store.GetCustomRules(); err == nil {
			for _, r := range c {
				m.customRules[r] = true
				m.blockedDomains[r] = "custom"
			}
		}
	}

	return m
}

func (m *BlocklistManager) AddToWhitelist(domain string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	domain = strings.ToLower(domain)
	m.whitelist[domain] = true
	if m.store != nil {
		m.store.AddToWhitelist(domain)
	}
}

func (m *BlocklistManager) RemoveFromWhitelist(domain string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	domain = strings.ToLower(domain)
	delete(m.whitelist, domain)
	if m.store != nil {
		m.store.RemoveFromWhitelist(domain)
	}
}

func (m *BlocklistManager) IsWhitelisted(domain string) bool {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.whitelist[strings.ToLower(domain)]
}

func (m *BlocklistManager) GetWhitelist() []string {
	m.mu.RLock()
	defer m.mu.RUnlock()
	domains := make([]string, 0, len(m.whitelist))
	for d := range m.whitelist {
		domains = append(domains, d)
	}
	return domains
}

func (m *BlocklistManager) AddCustomRule(domain string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	domain = strings.ToLower(domain)
	m.customRules[domain] = true
	m.blockedDomains[domain] = "custom"
}

func (m *BlocklistManager) GetCustomRules() []string {
	m.mu.RLock()
	defer m.mu.RUnlock()
	rules := make([]string, 0, len(m.customRules))
	for r := range m.customRules {
		rules = append(rules, r)
	}
	return rules
}

func (m *BlocklistManager) SetCustomRules(rules []string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	// Clear existing custom rules from blockedDomains
	for r := range m.customRules {
		if m.blockedDomains[r] == "custom" {
			delete(m.blockedDomains, r)
		}
	}

	m.customRules = make(map[string]bool)
	var persistedRules []string
	for _, r := range rules {
		domain := strings.ToLower(r)
		m.customRules[domain] = true
		m.blockedDomains[domain] = "custom"
		persistedRules = append(persistedRules, domain)
	}

	if m.store != nil {
		m.store.SetCustomRules(persistedRules)
	}
}

func (m *BlocklistManager) ToggleCategory(category string, enabled bool) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if enabled {
		delete(m.disabledCategories, category)
	} else {
		m.disabledCategories[category] = true
	}
}

func (m *BlocklistManager) IsCategoryEnabled(category string) bool {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return !m.disabledCategories[category]
}

func (m *BlocklistManager) GetDisabledCategories() []string {
	m.mu.RLock()
	defer m.mu.RUnlock()
	cats := make([]string, 0, len(m.disabledCategories))
	for c := range m.disabledCategories {
		cats = append(cats, c)
	}
	return cats
}

func (m *BlocklistManager) LoadBlocklist(r io.Reader, category string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") || strings.HasPrefix(line, "!") {
			continue
		}
		// Basic EasyList parsing: remove || and ^ if present
		domain := line
		domain = strings.TrimPrefix(domain, "||")
		if idx := strings.Index(domain, "^"); idx != -1 {
			domain = domain[:idx]
		}

		domain = strings.ToLower(domain)
		if domain != "" {
			m.blockedDomains[domain] = category
		}
	}
	return scanner.Err()
}

func (m *BlocklistManager) UpdateFromURL(url string, category string) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to download blocklist: status %d", resp.StatusCode)
	}

	return m.LoadBlocklist(resp.Body, category)
}

func (m *BlocklistManager) SetLastUpdated(t time.Time) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.lastUpdated = t
}

func (m *BlocklistManager) GetLastUpdated() time.Time {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.lastUpdated
}

func (m *BlocklistManager) Contains(domain string) bool {
	lowerDomain := strings.ToLower(domain)
	if m.IsWhitelisted(lowerDomain) {
		return false
	}

	m.mu.RLock()
	category, exists := m.blockedDomains[lowerDomain]
	disabled := m.disabledCategories[category]
	m.mu.RUnlock()

	if exists && !disabled {
		m.mu.Lock()
		m.stats[category]++
		m.stats["total"]++
		m.mu.Unlock()
		return true
	}

	return false
}

func (m *BlocklistManager) GetStats() map[string]interface{} {
	m.mu.RLock()
	defer m.mu.RUnlock()

	statsCopy := make(map[string]interface{})
	for k, v := range m.stats {
		statsCopy[k] = v
	}
	statsCopy["rules_count"] = len(m.blockedDomains)
	statsCopy["last_updated"] = m.lastUpdated.Format(time.RFC3339)
	return statsCopy
}

func (m *BlocklistManager) Count() int {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return len(m.blockedDomains)
}
