package proxy

import (
	"context"
	"fmt"
	"io"
	"net"
	"time"

	"github.com/atlanticproxy/proxy-client/internal/billing"
	"github.com/atlanticproxy/proxy-client/pkg/oxylabs"
	"github.com/shadowsocks/go-shadowsocks2/core"
	"golang.org/x/net/proxy"
)

type ShadowsocksServer struct {
	listenAddr     string
	cipher         core.Cipher
	oxylabs        *oxylabs.Client
	billingManager *billing.Manager
}

func NewShadowsocksServer(listenAddr, method, password string, ox *oxylabs.Client, bm *billing.Manager) (*ShadowsocksServer, error) {
	cipher, err := core.PickCipher(method, nil, password)
	if err != nil {
		return nil, fmt.Errorf("failed to pick cipher: %w", err)
	}

	return &ShadowsocksServer{
		listenAddr:     listenAddr,
		cipher:         cipher,
		oxylabs:        ox,
		billingManager: bm,
	}, nil
}

func (s *ShadowsocksServer) Start(ctx context.Context) error {
	l, err := net.Listen("tcp", s.listenAddr)
	if err != nil {
		return fmt.Errorf("failed to listen on %s: %w", s.listenAddr, err)
	}
	defer l.Close()

	fmt.Printf("Starting Shadowsocks server on %s (Premium Only)...\n", s.listenAddr)

	go func() {
		<-ctx.Done()
		l.Close()
	}()

	for {
		conn, err := l.Accept()
		if err != nil {
			select {
			case <-ctx.Done():
				return nil
			default:
				fmt.Printf("Shadowsocks accept error: %v\n", err)
				continue
			}
		}

		go s.handleConnection(conn)
	}
}

func (s *ShadowsocksServer) handleConnection(conn net.Conn) {
	defer conn.Close()

	// Wrap in Shadowsocks cipher
	ssConn := s.cipher.StreamConn(conn)

	// Read destination address
	// Shadowsocks protocol: [1-byte type][variable length addr][2-byte port]
	// Shadowsocks2 handles this via Dial logic usually, but here we are a server.
	// We need to act as a target for SS clients.

	// Check Billing Premium Tier
	if s.billingManager != nil {
		sub := s.billingManager.GetSubscription()
		plan, _ := billing.GetPlan(sub.PlanID)

		// Logic: Shadowsocks is only for Pro and above
		if plan.ID != billing.PlanPersonal && plan.ID != billing.PlanTeam && plan.ID != billing.PlanEnterprise {
			fmt.Println("Shadowsocks access denied: Premium plan required")
			return
		}

		if err := s.billingManager.CanAcceptConnection(); err != nil {
			fmt.Printf("Shadowsocks quota check failed: %v\n", err)
			return
		}
		s.billingManager.Usage.AddRequest()
	}

	// We'll use the shadowsocks2 core logic for handling the upstream dial.
	// However, shadowsocks2 doesn't have a built-in "proxy chaining" server handler out of the box that's easy to plug Oxylabs into as a wrapper without custom dialer.

	// For simplicity and robustness, we'll manually handle the target read and dial.
	// But let's use a simpler approach: Chaining.

	// Realistically, we catch the target address from ssConn.
	// ssConn.Read will start after the address is parsed if we use a helper,
	// but shadowsocks2.StreamConn is low level.

	// Let's use the shadowsocks2 logic for server:
	/*
		ss.TCPRelay(c, func(network, addr string) (net.Conn, error) {
			return s.dialUpstream(network, addr)
		})
	*/
	// Shadowsocks2 TCPRelay is exactly what we need.
	// Since shadowsocks2 version we imported might not have TCPRelay easily exposed as a method on cipher, we'll do the standard proxying.

	target, err := s.readTarget(ssConn)
	if err != nil {
		return
	}

	upstream, err := s.dialUpstream(target)
	if err != nil {
		fmt.Printf("Failed to dial upstream for %s: %v\n", target, err)
		return
	}
	defer upstream.Close()

	// Relay
	errChan := make(chan error, 2)
	go func() {
		_, err := io.Copy(upstream, ssConn)
		errChan <- err
	}()
	go func() {
		_, err := io.Copy(ssConn, upstream)
		errChan <- err
	}()

	<-errChan
}

func (s *ShadowsocksServer) readTarget(c net.Conn) (string, error) {
	// Standard Shadowsocks target address parsing
	buf := make([]byte, 1)
	if _, err := io.ReadFull(c, buf); err != nil {
		return "", err
	}

	var host string
	switch buf[0] {
	case 1: // IPv4
		addr := make([]byte, 4)
		if _, err := io.ReadFull(c, addr); err != nil {
			return "", err
		}
		host = net.IP(addr).String()
	case 3: // Domain
		lenBuf := make([]byte, 1)
		if _, err := io.ReadFull(c, lenBuf); err != nil {
			return "", err
		}
		hostBuf := make([]byte, int(lenBuf[0]))
		if _, err := io.ReadFull(c, hostBuf); err != nil {
			return "", err
		}
		host = string(hostBuf)
	case 4: // IPv6
		addr := make([]byte, 16)
		if _, err := io.ReadFull(c, addr); err != nil {
			return "", err
		}
		host = net.IP(addr).String()
	default:
		return "", fmt.Errorf("unknown address type %d", buf[0])
	}

	portBuf := make([]byte, 2)
	if _, err := io.ReadFull(c, portBuf); err != nil {
		return "", err
	}
	port := (int(portBuf[0]) << 8) | int(portBuf[1])

	return fmt.Sprintf("%s:%d", host, port), nil
}

func (s *ShadowsocksServer) dialUpstream(target string) (net.Conn, error) {
	// Reusing the SOCKS5 logic for Shadowsocks upstream
	// Wait, this is in a different struct. I'll move dialUpstream to a shared helper if needed or duplicate it for now.
	// Actually, I'll just implement it here correctly.

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	proxyURL, err := s.oxylabs.GetProxy(ctx)
	if err != nil {
		return nil, err
	}

	auth := &proxy.Auth{
		User:     proxyURL.User.Username(),
		Password: "",
	}
	if p, ok := proxyURL.User.Password(); ok {
		auth.Password = p
	}

	dialer, err := proxy.SOCKS5("tcp", proxyURL.Host, auth, proxy.Direct)
	if err != nil {
		return nil, err
	}

	return dialer.Dial("tcp", target)
}
