package service

import (
	"context"
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/atlanticproxy/proxy-client/internal/adblock"
	"github.com/atlanticproxy/proxy-client/internal/api"
	"github.com/atlanticproxy/proxy-client/internal/billing"
	"github.com/atlanticproxy/proxy-client/internal/interceptor"
	"github.com/atlanticproxy/proxy-client/internal/killswitch"
	"github.com/atlanticproxy/proxy-client/internal/monitor"
	"github.com/atlanticproxy/proxy-client/internal/proxy"
	"github.com/atlanticproxy/proxy-client/internal/rotation"
	"github.com/atlanticproxy/proxy-client/internal/storage"
	"github.com/atlanticproxy/proxy-client/pkg/cert"
	"github.com/atlanticproxy/proxy-client/pkg/config"
	"github.com/sirupsen/logrus"
)

type Service struct {
	config           *config.Config
	interceptor      *interceptor.TunInterceptor
	proxy            *proxy.Engine
	adblock          *adblock.Engine
	rotationManager  *rotation.Manager
	analyticsManager *rotation.AnalyticsManager
	billingManager   *billing.Manager
	monitor          *monitor.NetworkMonitor
	killswitch       *killswitch.Guardian
	apiServer        *api.Server
	storage          *storage.Store
	logger           *logrus.Logger
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
		s.logger.Warnf("Failed to initialize TUN interceptor: %v. System-wide interception will be disabled.", err)
	}

	// Initialize storage
	s.storage, err = storage.NewStore()
	if err != nil {
		s.logger.Warnf("Failed to initialize persistent storage: %v. Running in-memory mode.", err)
	}

	// Trust Root CA for HTTPS interception
	if err := cert.TrustCA(); err != nil {
		s.logger.Warnf("Failed to trust Root CA: %v. HTTPS sites may show certificate warnings.", err)
	}

	// Detect region for adblock and formatting
	region := s.detectRegion()
	s.logger.Infof("Detected region: %s", region)

	// Initialize adblock engine
	s.adblock = adblock.NewEngine(region, s.storage)

	// Initialize rotation components
	s.rotationManager = rotation.NewManager()
	s.analyticsManager = rotation.NewAnalyticsManager()

	// Initialize billing manager
	s.billingManager = billing.NewManager(s.storage)

	// Initialize Payment Providers
	if s.config.Billing != nil && s.config.Billing.PaystackSecretKey != "" {
		s.billingManager.SetPaystack(billing.NewPaystackProvider(s.config.Billing.PaystackSecretKey))
	} else {
		s.logger.Warn("Paystack secret key not found, using placeholder")
		s.billingManager.SetPaystack(billing.NewPaystackProvider("sk_test_paystack_placeholder"))
	}
	s.billingManager.SetCrypto(billing.NewCryptoProvider("now_key_placeholder"))

	// Initialize proxy engine
	s.proxy = proxy.NewEngine(s.config.Proxy, s.adblock, s.rotationManager, s.analyticsManager, s.billingManager)

	// Initialize network monitor
	s.monitor = monitor.New(s.config.Monitor)

	// Initialize API server
	s.apiServer = api.NewServer(s.adblock, s.killswitch, s.interceptor, s.proxy, s.rotationManager, s.analyticsManager, s.billingManager, s.storage)

	// Start all components
	var wg sync.WaitGroup
	errChan := make(chan error, 6)

	// Start adblock engine
	wg.Add(1)
	go func() {
		defer wg.Done()
		// Port 5353 is often taken by mDNS, using 5053 instead
		if err := s.adblock.Start(ctx, "127.0.0.1:5053"); err != nil {
			errChan <- err
		}
	}()

	// Start interceptor
	if s.interceptor != nil {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if err := s.interceptor.Start(ctx); err != nil {
				errChan <- err
			}
		}()
	}

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
		if err := s.apiServer.Start(ctx, s.config.API.Port); err != nil {
			errChan <- err
		}
	}()

	// Periodic usage sync
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				if s.billingManager != nil {
					s.billingManager.SyncUsage()
				}
			}
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

	if s.storage != nil {
		// Sync usage to storage on shutdown
		if s.billingManager != nil {
			stats := s.billingManager.Usage.GetStats()
			s.storage.UpdateUsage(stats.DataTransferred, stats.RequestsMade, stats.AdsBlocked, stats.ThreatsBlocked)
		}
		s.storage.Close()
	}
}

func (s *Service) detectRegion() string {
	// Simple structure for IP-API response
	type ipResp struct {
		CountryCode string `json:"countryCode"`
	}

	client := http.Client{
		Timeout: 2 * time.Second,
	}

	resp, err := client.Get("http://ip-api.com/json/?fields=countryCode")
	if err != nil {
		s.logger.Warnf("Failed to detect region (network error): %v. Defaulting to US.", err)
		return "US"
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		s.logger.Warnf("Failed to detect region (status %d). Defaulting to US.", resp.StatusCode)
		return "US"
	}

	var data ipResp
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		s.logger.Warnf("Failed to parse region response: %v. Defaulting to US.", err)
		return "US"
	}

	if data.CountryCode == "" {
		return "US"
	}

	return data.CountryCode
}
