package service

import (
	"context"
	"sync"

	"github.com/atlanticproxy/proxy-client/internal/adblock"
	"github.com/atlanticproxy/proxy-client/internal/api"
	"github.com/atlanticproxy/proxy-client/internal/interceptor"
	"github.com/atlanticproxy/proxy-client/internal/killswitch"
	"github.com/atlanticproxy/proxy-client/internal/monitor"
	"github.com/atlanticproxy/proxy-client/internal/proxy"
	"github.com/atlanticproxy/proxy-client/pkg/config"
	"github.com/sirupsen/logrus"
)

type Service struct {
	config      *config.Config
	interceptor *interceptor.TunInterceptor
	proxy       *proxy.Engine
	adblock     *adblock.Engine
	monitor     *monitor.NetworkMonitor
	killswitch  *killswitch.Guardian
	apiServer   *api.Server
	logger      *logrus.Logger
}


func New() *Service {
	logger := logrus.New()
	cfg := config.Load()

	return &Service{
		config: cfg,
		logger: logger,
	}
}

func (s *Service) Run(ctx context.Context) error {
	s.logger.Info("Initializing AtlanticProxy components...")

	// Initialize kill switch first - safety first
	s.killswitch = killswitch.New(s.config.KillSwitch)
	if err := s.killswitch.Enable(); err != nil {
		return err
	}

	// Initialize TUN interface
	var err error
	s.interceptor, err = interceptor.NewTunInterceptor(s.config.Interceptor)
	if err != nil {
		return err
	}

	// Initialize adblock engine
	s.adblock = adblock.NewEngine("US") // TODO: Detect region

	// Initialize proxy engine
	s.proxy = proxy.NewEngine(s.config.Proxy, s.adblock)

	// Initialize network monitor
	s.monitor = monitor.New(s.config.Monitor)

	// Initialize API server
	s.apiServer = api.NewServer(s.adblock, s.killswitch)


	// Start all components
	var wg sync.WaitGroup
	errChan := make(chan error, 6)

	// Start adblock engine
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := s.adblock.Start(ctx, "127.0.0.1:5353"); err != nil {
			errChan <- err
		}
	}()

	// Start interceptor
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := s.interceptor.Start(ctx); err != nil {
			errChan <- err
		}
	}()


	// Start proxy engine
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := s.proxy.Start(ctx); err != nil {
			errChan <- err
		}
	}()

	// Start network monitor
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := s.monitor.Start(ctx); err != nil {
			errChan <- err
		}
	}()

	// Start API server
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := s.apiServer.Start(ctx); err != nil {
			errChan <- err
		}
	}()

	s.logger.Info("AtlanticProxy service started successfully")

	// Wait for context cancellation or error
	select {
	case <-ctx.Done():
		s.logger.Info("Shutting down AtlanticProxy service...")
	case err := <-errChan:
		s.logger.Error("Component error:", err)
		return err
	}

	// Graceful shutdown
	s.shutdown()
	wg.Wait()

	return nil
}

func (s *Service) shutdown() {
	s.logger.Info("Performing graceful shutdown...")

	if s.killswitch != nil {
		s.killswitch.Disable()
	}

	if s.interceptor != nil {
		s.interceptor.Stop()
	}

	if s.proxy != nil {
		s.proxy.Stop()
	}

	if s.adblock != nil {
		s.adblock.Stop()
	}

	if s.monitor != nil {
		s.monitor.Stop()
	}
}

