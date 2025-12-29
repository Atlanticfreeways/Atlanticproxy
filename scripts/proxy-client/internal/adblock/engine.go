package adblock

import (
	"context"
	"fmt"
	"time"
)

type Engine struct {
	Blocklist  *BlocklistManager
	Compliance *ComplianceManager
	DNSFilter  *DNSFilter
	HTTPFilter *RequestFilter
	sources    []Source
}

type Source struct {
	URL      string
	Category string
}

func NewEngine(region string, store Store) *Engine {
	bm := NewBlocklistManager(store)
	cm := NewComplianceManager(region)
	df := NewDNSFilter(bm, cm)
	hf := NewRequestFilter(bm, cm)

	return &Engine{
		Blocklist:  bm,
		Compliance: cm,
		DNSFilter:  df,
		HTTPFilter: hf,
		sources: []Source{
			{URL: "https://easylist.to/easylist/easylist.txt", Category: "ads"},
			{URL: "https://easylist.to/easylist/easyprivacy.txt", Category: "trackers"},
			{URL: "https://adguardteam.github.io/AdGuardSDNSFilter/Filters/filter.txt", Category: "ads"},
		},
	}
}

func (e *Engine) Start(ctx context.Context, dnsAddr string) error {
	// Start DNS filter
	if err := e.DNSFilter.Start(ctx, dnsAddr); err != nil {
		return err
	}

	// Initial blocklist update
	go e.UpdateBlocklists()

	// Periodic updates
	ticker := time.NewTicker(24 * time.Hour)
	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				e.UpdateBlocklists()
			}
		}
	}()

	return nil
}

func (e *Engine) UpdateBlocklists() {
	fmt.Println("Atlantic: Updating ad-block lists...")
	for _, source := range e.sources {
		if err := e.Blocklist.UpdateFromURL(source.URL, source.Category); err != nil {
			fmt.Printf("Atlantic: Failed to update %s: %v\n", source.URL, err)
		}
	}
	e.Blocklist.SetLastUpdated(time.Now())
	fmt.Printf("Atlantic: Ad-block lists updated. Total rules: %d\n", e.Blocklist.Count())
}

func (e *Engine) Stop() {
	e.DNSFilter.Stop()
}
