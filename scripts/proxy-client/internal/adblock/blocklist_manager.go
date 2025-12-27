package adblock

import (
	"bufio"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
)

type BlocklistManager struct {
	blockedDomains map[string]string // domain -> category
	whitelist      map[string]bool
	stats          map[string]int64
	mu             sync.RWMutex
}

func NewBlocklistManager() *BlocklistManager {
	return &BlocklistManager{
		blockedDomains: make(map[string]string),
		whitelist:      make(map[string]bool),
		stats:          make(map[string]int64),
	}
}

func (m *BlocklistManager) AddToWhitelist(domain string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.whitelist[strings.ToLower(domain)] = true
}

func (m *BlocklistManager) RemoveFromWhitelist(domain string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.whitelist, strings.ToLower(domain))
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

func (m *BlocklistManager) Contains(domain string) bool {
	lowerDomain := strings.ToLower(domain)
	if m.IsWhitelisted(lowerDomain) {
		return false
	}

	m.mu.RLock()
	category, exists := m.blockedDomains[lowerDomain]
	m.mu.RUnlock()

	if exists {
		m.mu.Lock()
		m.stats[category]++
		m.stats["total"]++
		m.mu.Unlock()
	}

	return exists
}

func (m *BlocklistManager) GetStats() map[string]int64 {
	m.mu.RLock()
	defer m.mu.RUnlock()
	
	statsCopy := make(map[string]int64)
	for k, v := range m.stats {
		statsCopy[k] = v
	}
	return statsCopy
}

func (m *BlocklistManager) Count() int {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return len(m.blockedDomains)
}

