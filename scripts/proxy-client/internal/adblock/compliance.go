package adblock

import (
	"sync"
)

type RestrictionLevel int

const (
	Allowed RestrictionLevel = iota
	OptInOnly
	Prohibited
)

type ComplianceManager struct {
	region       string
	restrictions map[string]RestrictionLevel
	consentGiven bool
	mu           sync.RWMutex
}

func NewComplianceManager(region string) *ComplianceManager {
	cm := &ComplianceManager{
		region: region,
		restrictions: map[string]RestrictionLevel{
			"CN": Prohibited,
			"DE": OptInOnly,
			"FR": OptInOnly,
			"IT": OptInOnly,
			"ES": OptInOnly,
			"RU": Prohibited,
			"US": Allowed,
			"GB": Allowed,
			"CA": Allowed,
			"AU": Allowed,
		},
	}
	return cm
}

func (c *ComplianceManager) IsAdBlockingAllowed() bool {
	c.mu.RLock()
	defer c.mu.RUnlock()

	level, exists := c.restrictions[c.region]
	if !exists {
		// Default to OptIn for unknown regions to be safe (privacy first)
		level = OptInOnly
	}

	switch level {
	case Allowed:
		return true
	case OptInOnly:
		return c.consentGiven
	case Prohibited:
		return false
	default:
		return false
	}
}

func (c *ComplianceManager) SetConsent(given bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.consentGiven = given
}

func (c *ComplianceManager) SetRegion(region string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.region = region
}

func (c *ComplianceManager) GetRestrictionLevel() RestrictionLevel {
	c.mu.RLock()
	defer c.mu.RUnlock()

	level, exists := c.restrictions[c.region]
	if !exists {
		return OptInOnly
	}
	return level
}

