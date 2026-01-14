package adblock

import (
	"strings"
	"testing"
)

func TestBlocklistManager(t *testing.T) {
	manager := NewBlocklistManager(nil)

	data := `
# Comment
bad-site.com
tracker.io
`
	err := manager.LoadBlocklist(strings.NewReader(data), "ads")
	if err != nil {
		t.Fatalf("Failed to load blocklist: %v", err)
	}

	if count := manager.Count(); count != 2 {
		t.Errorf("Expected 2 domains, got %d", count)
	}

	if !manager.Contains("bad-site.com") {
		t.Error("Should contain bad-site.com")
	}

	if manager.Contains("good-site.com") {
		t.Error("Should not contain good-site.com")
	}

	stats := manager.GetStats()
	if val, ok := stats["ads"].(int64); !ok || val != 1 {
		t.Errorf("Expected 1 ad block stat, got %v", stats["ads"])
	}
}

func TestDNSFilter(t *testing.T) {
	bm := NewBlocklistManager(nil)
	_ = bm.LoadBlocklist(strings.NewReader("doubleclick.net"), "ads")
	cm := NewComplianceManager("US")

	filter := NewDNSFilter(bm, cm)

	if !filter.ShouldBlock("doubleclick.net") {
		t.Error("Should block doubleclick.net")
	}

	if filter.ShouldBlock("google.com") {
		t.Error("Should not block google.com")
	}
}

func TestComplianceManager(t *testing.T) {
	cm := NewComplianceManager("US")
	if !cm.IsAdBlockingAllowed() {
		t.Error("Ad blocking should be allowed in US")
	}

	cm.SetRegion("CN")
	if cm.IsAdBlockingAllowed() {
		t.Error("Ad blocking should NOT be allowed in China")
	}

	cm.SetRegion("DE")
	cm.SetConsent(false)
	if cm.IsAdBlockingAllowed() {
		t.Error("Ad blocking should NOT be allowed in Germany without consent")
	}

	cm.SetConsent(true)
	if !cm.IsAdBlockingAllowed() {
		t.Error("Ad blocking should be allowed in Germany with consent")
	}
}
