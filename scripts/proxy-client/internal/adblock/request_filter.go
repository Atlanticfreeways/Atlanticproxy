package adblock

import (
	"net/http"
	"regexp"
	"sync"
)

type RequestFilter struct {
	blocklist    *BlocklistManager
	compliance   *ComplianceManager
	patterns     []*regexp.Regexp
	mu           sync.RWMutex
}

func NewRequestFilter(blocklist *BlocklistManager, compliance *ComplianceManager) *RequestFilter {
	return &RequestFilter{
		blocklist:  blocklist,
		compliance: compliance,
		patterns:   make([]*regexp.Regexp, 0),
	}
}

func (f *RequestFilter) AddPattern(pattern string) error {
	re, err := regexp.Compile(pattern)
	if err != nil {
		return err
	}
	f.mu.Lock()
	defer f.mu.Unlock()
	f.patterns = append(f.patterns, re)
	return nil
}

func (f *RequestFilter) ShouldBlockRequest(req *http.Request) bool {
	if !f.compliance.IsAdBlockingAllowed() {
		return false
	}

	hostname := req.URL.Hostname()
	if f.blocklist.Contains(hostname) {
		return true
	}

	// Check regex patterns
	urlStr := req.URL.String()
	f.mu.RLock()
	defer f.mu.RUnlock()
	
	for _, re := range f.patterns {
		if re.MatchString(urlStr) {
			return true
		}
	}

	return false
}

