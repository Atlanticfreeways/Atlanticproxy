package proxy

import (
	"context"
	"fmt"
	"net"

	"github.com/armon/go-socks5"
	"github.com/atlanticproxy/proxy-client/internal/billing"
	"github.com/atlanticproxy/proxy-client/pkg/oxylabs"
	"github.com/sirupsen/logrus"
	"golang.org/x/net/proxy"
)

type Socks5Server struct {
	server         *socks5.Server
	listenAddr     string
	oxylabs        *oxylabs.Client
	billingManager *billing.Manager
	logger         *logrus.Logger
}

func NewSocks5Server(listenAddr string, ox *oxylabs.Client, bm *billing.Manager) (*Socks5Server, error) {
	s := &Socks5Server{
		listenAddr:     listenAddr,
		oxylabs:        ox,
		billingManager: bm,
		logger:         logrus.StandardLogger(),
	}

	conf := &socks5.Config{
		Dial: s.Dial,
	}

	server, err := socks5.New(conf)
	if err != nil {
		return nil, err
	}
	s.server = server

	return s, nil
}

func (s *Socks5Server) Dial(ctx context.Context, network, addr string) (net.Conn, error) {
	// Billing check
	if s.billingManager != nil {
		if err := s.billingManager.CanAcceptConnection(); err != nil {
			return nil, err
		}
		s.billingManager.Usage.AddRequest()
	}

	// Dial via Oxylabs upstream SOCKS5
	proxyURL, err := s.oxylabs.GetProxy(ctx)
	if err != nil {
		return nil, err
	}

	// Create a socks5 dialer for the upstream
	auth := &proxy.Auth{
		User:     proxyURL.User.Username(),
		Password: "",
	}
	if p, ok := proxyURL.User.Password(); ok {
		auth.Password = p
	}

	dialer, err := proxy.SOCKS5("tcp", proxyURL.Host, auth, proxy.Direct)
	if err != nil {
		return nil, fmt.Errorf("failed to create upstream socks5 dialer: %w", err)
	}

	return dialer.Dial(network, addr)
}

func (s *Socks5Server) Start(ctx context.Context) error {
	fmt.Printf("Starting SOCKS5 server on %s...\n", s.listenAddr)
	return s.server.ListenAndServe("tcp", s.listenAddr)
}
