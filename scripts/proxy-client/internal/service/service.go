package service

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
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
	otaManager       *OTAManager
	logger           *logrus.Logger
}

func New() *Service {
	logger := logrus.New()

	// Default to JSON for V1.5 stability (Observability Phase 2.3)
	if os.Getenv("LOG_FORMAT") != "text" {
		logger.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat: time.RFC3339,
		})
	}

	cfg := config.Load()

	return &Service{
		config: cfg,
		logger: logger,
	}
}

func (s *Service) Run(ctx context.Context) error {
	s.logger.Info("Initializing AtlanticProxy components...")
	s.logger.Infof("Oxylabs Username: %s", mask(s.config.Proxy.OxylabsUsername))

	// Initialize kill switch first - safety first (skip in dev mode)
	if os.Getuid() == 0 {
		s.killswitch = killswitch.New(s.config.KillSwitch)
		if err := s.killswitch.Enable(); err != nil {
			s.logger.Warnf("Failed to enable kill switch: %v", err)
		}
	} else {
		s.logger.Warn("Kill switch disabled (requires root privileges)")
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
		// Leave storage as nil - components must handle nil storage gracefully
		s.storage = nil
	}

	// Trust Root CA for HTTPS interception
	if err := cert.TrustCA(); err != nil {
		s.logger.Warnf("Failed to trust Root CA: %v. HTTPS sites may show certificate warnings.", err)
	}

	// Detect region for adblock and formatting
	region := s.detectRegion()
	s.logger.Infof("Detected region: %s", region)

	// Initialize adblock engine
	// Important: Pass explicit nil to avoid Go's nil interface gotcha
	var storeInterface adblock.Store
	if s.storage != nil {
		storeInterface = s.storage
	}
	s.adblock = adblock.NewEngine(region, storeInterface)

	// Initialize rotation components
	// Initialize rotation components
	s.analyticsManager = rotation.NewAnalyticsManager()
	s.rotationManager = rotation.NewManager(s.analyticsManager)

	// Initialize billing manager
	s.billingManager = billing.NewManager(s.storage)
	currency := billing.MapRegionToCurrency(region)
	s.billingManager.SetCurrency(currency)
	s.logger.Infof("Detected currency: %s", currency)

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

	// Initialize OTA Manager (Phase 5.2)
	s.otaManager = NewOTAManager("1.5.0", s.logger)

	// Start update check routine
	go func() {
		ticker := time.NewTicker(24 * time.Hour)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				info, err := s.otaManager.CheckForUpdates(ctx)
				if err != nil {
					s.logger.Errorf("Update check failed: %v", err)
				} else if info != nil {
					s.logger.Infof("New version available: %s. Download from %s", info.Version, info.URL)
				}
			}
		}
	}()

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

	// Periodic usage sync and quota reset check
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

					// Check if it's the first day of the month to reset quotas
					// NOTE: In production, this needs a more robust state to avoid multiple resets
					// For Validation: We assume this runs efficiently
					if time.Now().Day() == 1 && s.billingManager.Usage.GetStats().DataTransferred > 0 {
						// Only reset if we haven't already (simple heuristic: data > 0 on day 1 means we need to reset)
						// A better approach is storing "LastResetDate" in DB
						// For now, this suffices for V1 validation
						s.logger.Info("First day of month detected. Resetting quotas...")
						s.billingManager.ResetQuotas()
					}
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
			s.billingManager.SyncUsage()
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

func mask(s string) string {
	if len(s) < 4 {
		return "****"
	}
	return s[:2] + "****" + s[len(s)-2:]
}
