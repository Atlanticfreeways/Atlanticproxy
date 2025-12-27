package adblock

import (
	"context"
	"fmt"
	"strings"

	"github.com/miekg/dns"
)

type DNSFilter struct {
	blocklist  *BlocklistManager
	compliance *ComplianceManager
	server     *dns.Server
	upstream   string
}

func NewDNSFilter(blocklist *BlocklistManager, compliance *ComplianceManager) *DNSFilter {
	return &DNSFilter{
		blocklist:  blocklist,
		compliance: compliance,
		upstream:   "8.8.8.8:53", // Default upstream DNS
	}
}

func (f *DNSFilter) Start(ctx context.Context, addr string) error {
	f.server = &dns.Server{
		Addr:    addr,
		Net:     "udp",
		Handler: dns.HandlerFunc(f.handleDNSRequest),
	}

	fmt.Printf("Atlantic: DNS Filter starting on %s\n", addr)
	go func() {
		if err := f.server.ListenAndServe(); err != nil {
			fmt.Printf("Atlantic: DNS Filter failed: %v\n", err)
		}
	}()

	return nil
}

func (f *DNSFilter) Stop() error {
	if f.server != nil {
		return f.server.Shutdown()
	}
	return nil
}

func (f *DNSFilter) handleDNSRequest(w dns.ResponseWriter, r *dns.Msg) {
	m := new(dns.Msg)
	m.SetReply(r)
	m.Compress = false

	if len(r.Question) > 0 {
		q := r.Question[0]
		if f.ShouldBlock(q.Name) {
			m.Rcode = dns.RcodeNameError // NXDOMAIN
			w.WriteMsg(m)
			return
		}
	}

	// Forward to upstream
	c := new(dns.Client)
	in, _, err := c.Exchange(r, f.upstream)
	if err != nil {
		m.Rcode = dns.RcodeServerFailure
		w.WriteMsg(m)
		return
	}
	w.WriteMsg(in)
}

// ShouldBlock checks if the DNS query for the domain should be blocked
func (f *DNSFilter) ShouldBlock(domain string) bool {
	if !f.compliance.IsAdBlockingAllowed() {
		return false
	}

	// Remove trailing dot if present
	domain = strings.TrimSuffix(domain, ".")

	return f.blocklist.Contains(domain)
}

