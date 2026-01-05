package adblock

import (
	"context"
	"fmt"
	"net"
	"strings"
	"sync"
	"time"

	"github.com/miekg/dns"
)

type DNSFilter struct {
	blocklist  *BlocklistManager
	compliance *ComplianceManager
	server     *dns.Server
	upstream   string
	cache      sync.Map
}

type cacheEntry struct {
	msg     *dns.Msg
	expires time.Time
}

func NewDNSFilter(blocklist *BlocklistManager, compliance *ComplianceManager) *DNSFilter {
	return &DNSFilter{
		blocklist:  blocklist,
		compliance: compliance,
		upstream:   "8.8.8.8:53", // Default upstream DNS
	}
}

func (f *DNSFilter) Start(ctx context.Context, addr string) error {
	pc, err := net.ListenPacket("udp", addr)
	if err != nil {
		return fmt.Errorf("failed to listen on %s: %w", addr, err)
	}

	f.server = &dns.Server{
		PacketConn: pc,
		Net:        "udp",
		Handler:    dns.HandlerFunc(f.handleDNSRequest),
	}

	fmt.Printf("Atlantic: DNS Filter starting on %s\n", addr)
	go func() {
		if err := f.server.ActivateAndServe(); err != nil {
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

		// Check Cache
		if val, ok := f.cache.Load(q.Name); ok {
			entry := val.(*cacheEntry)
			if time.Now().Before(entry.expires) {
				reply := entry.msg.Copy()
				reply.Id = r.Id // Use current request ID
				w.WriteMsg(reply)
				return
			}
			f.cache.Delete(q.Name)
		}

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

	// Cache result if it has answers
	if len(in.Answer) > 0 && len(r.Question) > 0 {
		ttl := uint32(300) // Default 5 mins
		for _, ans := range in.Answer {
			if ans.Header().Ttl < ttl {
				ttl = ans.Header().Ttl
			}
		}
		if ttl > 0 {
			f.cache.Store(r.Question[0].Name, &cacheEntry{
				msg:     in.Copy(),
				expires: time.Now().Add(time.Duration(ttl) * time.Second),
			})
		}
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
