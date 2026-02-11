package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/atlanticproxy/proxy-client/internal/adblock"
	"github.com/atlanticproxy/proxy-client/internal/billing"
	"github.com/atlanticproxy/proxy-client/internal/interceptor"
	"github.com/atlanticproxy/proxy-client/internal/killswitch"
	"github.com/atlanticproxy/proxy-client/internal/middleware"
	"github.com/atlanticproxy/proxy-client/internal/proxy"
	"github.com/atlanticproxy/proxy-client/internal/rotation"
	"github.com/atlanticproxy/proxy-client/internal/storage"
	"github.com/atlanticproxy/proxy-client/pkg/geo"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	promhttp "github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/sirupsen/logrus"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for local development
	},
}

type Server struct {
	router           *gin.Engine
	logger           *logrus.Logger
	status           *ProxyStatus
	adblock          *adblock.Engine
	killswitch       *killswitch.Guardian
	interceptor      *interceptor.TunInterceptor
	proxy            *proxy.Engine
	rotationManager  *rotation.Manager
	analyticsManager *rotation.AnalyticsManager
	billingManager   *billing.Manager
	store            *storage.Store
	geoResolver      *geo.MultiResolver
	clients          map[*websocket.Conn]bool
	mu               sync.RWMutex
}

type ProxyStatus struct {
	Connected       bool    `json:"connected"`
	IPAddress       string  `json:"ip_address,omitempty"`
	Location        string  `json:"location,omitempty"`
	ISP             string  `json:"isp,omitempty"`
	ASN             string  `json:"asn,omitempty"`
	Lat             float64 `json:"lat,omitempty"`
	Lon             float64 `json:"lon,omitempty"`
	Latency         int64   `json:"latency,omitempty"` // in ms
	ProtectionLevel string  `json:"protection_level"`  // High, Medium, Low, None
	LastCheck       string  `json:"last_check,omitempty"`
	Error           string  `json:"error,omitempty"`
}

type ConnectRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Endpoint string `json:"endpoint"`
}

func NewServer(ab *adblock.Engine, ks *killswitch.Guardian, it *interceptor.TunInterceptor, pr *proxy.Engine, rm *rotation.Manager, am *rotation.AnalyticsManager, bm *billing.Manager, store *storage.Store) *Server {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()

	// Request size limit (10MB)
	router.MaxMultipartMemory = 10 << 20

	// Custom middleware stack (order matters)
	router.Use(middleware.PanicRecovery(logrus.StandardLogger()))
	router.Use(RecoveryMiddleware(logrus.StandardLogger()))
	router.Use(RequestIDMiddleware())
	router.Use(LoggingMiddleware(logrus.StandardLogger()))
	router.Use(EnhancedSecurityHeadersMiddleware())

	// CORS
	router.Use(func(c *gin.Context) {
		allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
		if allowedOrigins == "" {
			allowedOrigins = "http://localhost:3000" // Dev fallback
		}
		c.Writer.Header().Set("Access-Control-Allow-Origin", allowedOrigins)
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	// Global rate limiting
	router.Use(middleware.APIRateLimit())

	s := &Server{
		router:           router,
		logger:           logrus.New(),
		status:           &ProxyStatus{Connected: false, ProtectionLevel: "None"},
		adblock:          ab,
		killswitch:       ks,
		interceptor:      it,
		proxy:            pr,
		rotationManager:  rm,
		analyticsManager: am,
		billingManager:   bm,
		store:            store,
		geoResolver:      geo.NewMultiResolver(),
		clients:          make(map[*websocket.Conn]bool),
	}

	s.setupRoutes()
	go s.startStatusUpdater()
	return s
}

func (s *Server) startStatusUpdater() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		<-ticker.C
		s.mu.RLock()
		connected := s.status.Connected
		s.mu.RUnlock()

		if connected {
			s.fetchGeoAndBroadcast()
		}
	}
}

func (s *Server) fetchGeoAndBroadcast() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	start := time.Now()
	info, err := s.geoResolver.GetCurrentLocation(ctx)
	latency := time.Since(start).Milliseconds()

	s.mu.Lock()
	defer s.mu.Unlock()

	// Double check we are still connected
	if !s.status.Connected {
		return
	}

	if err != nil {
		s.logger.Warnf("Failed to update status: %v", err)
		s.status.Error = "Geo lookup failed" // Non-critical
		s.status.Latency = latency
		s.status.LastCheck = time.Now().Format(time.RFC3339)
		// Keep previous protection level or set to Low?
		// s.status.ProtectionLevel = "Low"
		// Don't downgrade heavily just on geo fail if we are still proxied
	} else {
		s.status.IPAddress = info.IP
		s.status.Location = fmt.Sprintf("%s, %s", info.City, info.Country)
		s.status.ISP = info.ISP
		s.status.ASN = info.ASN
		s.status.Lat = info.Lat
		s.status.Lon = info.Lon
		s.status.Latency = latency
		s.status.LastCheck = time.Now().Format(time.RFC3339)
		s.status.Error = ""
		s.status.ProtectionLevel = "High"
	}

	// Calculate specific protection level logic here if needed
	// e.g., if Killswitch true -> "Max"

	// Broadcast outside lock
	statusCopy := *s.status
	s.mu.Unlock()
	s.broadcast(statusCopy)
}

func (s *Server) updateStatusLocked() {
	// Deprecated / kept for lightweight updates if needed
	// Currently replaced by async fetch
}

func (s *Server) setupRoutes() {
	s.router.POST("/connect", s.handleConnect)
	s.router.GET("/status", s.handleStatus)
	s.router.POST("/disconnect", s.handleDisconnect)
	s.router.POST("/killswitch", s.handleKillSwitch)
	s.router.GET("/killswitch", s.handleGetKillSwitch)
	s.router.GET("/health", s.handleHealth)
	s.router.GET("/ws", s.handleWS)
	s.router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Ad-block Whitelist API
	s.router.GET("/adblock/whitelist", s.handleGetWhitelist)
	s.router.POST("/adblock/whitelist", s.handleAddWhitelist)
	s.router.DELETE("/adblock/whitelist", s.handleRemoveWhitelist)

	// Ad-block Advanced API
	s.router.POST("/adblock/refresh", s.handleRefreshBlocklists)
	s.router.GET("/adblock/stats", s.handleGetAdblockStats)
	s.router.GET("/adblock/custom", s.handleGetCustomRules)
	s.router.POST("/adblock/custom", s.handleAddCustomRules)

	// Billing API
	s.router.GET("/api/billing/plans", s.handleGetPlans)
	s.router.GET("/api/billing/subscription", middleware.JWTAuth(), s.handleGetSubscription)
	s.router.POST("/api/billing/subscribe", middleware.JWTAuth(), s.handleSubscribe)
	s.router.POST("/api/billing/checkout", middleware.JWTAuth(), s.handleCreateCheckoutSession)
	s.router.POST("/api/billing/cancel", middleware.JWTAuth(), s.handleCancelSubscription)
	s.router.GET("/api/billing/usage", middleware.JWTAuth(), s.handleGetUsage)
	s.router.GET("/api/billing/invoices/:id", middleware.JWTAuth(), s.handleDownloadInvoice)
	s.router.POST("/api/billing/trial/start", s.handleStartTrial)
	s.router.GET("/api/billing/status", middleware.JWTAuth(), s.handleGetBillingStatus)

	// Security API
	s.router.GET("/api/security/status", middleware.JWTAuth(), s.handleGetSecurityStatus)

	// Protocol API
	s.router.GET("/api/protocol/credentials", middleware.JWTAuth(), s.handleGetProtocolCredentials)

	// Rotation API
	s.router.GET("/api/rotation/config", middleware.JWTAuth(), s.handleGetRotationConfig)
	s.router.POST("/api/rotation/config", middleware.JWTAuth(), s.handleUpdateRotationConfig)
	s.router.POST("/api/rotation/session/new", middleware.JWTAuth(), s.handleForceRotation) // Override existing if any

	// Locations API
	s.router.GET("/api/locations/available", s.handleGetLocations)

	// Payment verification
	s.router.GET("/api/billing/verify", s.handleVerifyPayment)

	// Compatibility Routes
	s.router.GET("/api/rotation/session/current", s.handleGetCurrentSession)
	s.router.GET("/api/rotation/stats", s.handleGetRotationStats)
	s.router.POST("/api/rotation/geo", s.handleSetGeo)

	// Adblock Management
	s.router.GET("/api/adblock/config", s.handleGetAdblockConfig)
	s.router.POST("/api/adblock/category", s.handleToggleAdblockCategory)

	// Statistics API
	s.router.GET("/api/statistics/hourly", s.handleGetStatisticsHourly)
	s.router.GET("/api/statistics/countries", s.handleGetStatisticsCountries)
	s.router.GET("/api/statistics/protocols", s.handleGetStatisticsProtocols)

	// Servers API
	s.router.GET("/api/servers/list", s.handleGetServersList)
	s.router.GET("/api/servers/status", s.handleGetServersStatus)

	// Activity API
	s.router.GET("/api/activity/log", middleware.JWTAuth(), s.handleGetActivityLog)

	// Settings API
	s.router.GET("/api/settings", middleware.JWTAuth(), s.handleGetSettings)
	s.router.POST("/api/settings", middleware.JWTAuth(), s.handleUpdateSettings)

	// Auth API
	authGroup := s.router.Group("/api/auth")
	{
		authGroup.POST("/register", s.handleRegister)
		authGroup.POST("/login", s.handleLogin)
		authGroup.GET("/me", s.AuthMiddleware(), s.handleMe)
		authGroup.POST("/logout", s.AuthMiddleware(), s.handleLogout)
	}

	// Webhooks
	s.router.POST("/webhooks/paystack", s.handlePaystackWebhook)
}

func (s *Server) handleWS(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		s.logger.Errorf("Failed to upgrade to websocket: %v", err)
		return
	}

	s.mu.Lock()
	s.clients[conn] = true
	s.mu.Unlock()

	defer func() {
		s.mu.Lock()
		delete(s.clients, conn)
		s.mu.Unlock()
		conn.Close()
	}()

	// Send initial status
	conn.WriteJSON(s.status)

	for {
		// Read message (required to handle close messages and ping)
		_, message, err := conn.ReadMessage()
		if err != nil {
			break
		}

		// Handle ping/pong
		var msg map[string]interface{}
		if err := json.Unmarshal(message, &msg); err == nil {
			if msgType, ok := msg["type"].(string); ok && msgType == "ping" {
				conn.WriteJSON(map[string]string{"type": "pong"})
			}
		}
	}
}

func (s *Server) broadcast(payload interface{}) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for client := range s.clients {
		err := client.WriteJSON(payload)
		if err != nil {
			s.logger.Errorf("Failed to send websocket message: %v", err)
			client.Close()
			// We can't delete while iterating over range in a way that affects this range
			// but we can rely on the ReadMessage loop breaking and the defer closing it.
		}
	}
}

func (s *Server) handleConnect(c *gin.Context) {
	var req ConnectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	s.logger.Infof("Connecting to proxy with endpoint: %s", req.Endpoint)

	// Start interception if available
	if s.interceptor != nil {
		// Note: Start might return error if already running or if interface busy.
		// For now, we log errors but assume success as this is idempotent-ish or restarting.
		// However, Start() spawns a goroutine, so we should be careful.
		// Currently service.go starts it. If we want to restart, we should Stop first?
		// For simplicity/safety in this MVP: We assume it's running or we just ensure it's up.
		go func() {
			if err := s.interceptor.Start(context.Background()); err != nil {
				s.logger.Warnf("Interceptor start warning: %v", err)
			}
		}()
	}

	s.mu.Lock()
	s.status.Connected = true
	s.status.ProtectionLevel = "Low"
	s.status.Error = ""
	statusCopy := *s.status
	s.mu.Unlock()

	s.broadcast(statusCopy)

	// Async refresh for detailed info
	go s.fetchGeoAndBroadcast()

	c.JSON(http.StatusOK, gin.H{"message": "Connected successfully"})
}

func (s *Server) handleStatus(c *gin.Context) {
	s.mu.Lock()
	s.status.LastCheck = time.Now().Format(time.RFC3339)
	status := *s.status
	s.mu.Unlock()
	c.JSON(http.StatusOK, status)
}

func (s *Server) handleDisconnect(c *gin.Context) {
	s.logger.Info("Disconnecting from proxy")

	// Stop interception
	if s.interceptor != nil {
		s.interceptor.Stop()
	}

	s.mu.Lock()
	s.status.Connected = false
	s.status.IPAddress = ""
	s.status.Location = ""
	s.status.ISP = ""
	s.status.ASN = ""
	s.status.ProtectionLevel = "None"
	s.status.ISP = ""
	s.status.ASN = ""
	s.status.Latency = 0
	s.status.Error = ""
	s.mu.Unlock()

	s.broadcast(s.status)
	c.JSON(http.StatusOK, gin.H{"message": "Disconnected successfully"})
}

func (s *Server) handleKillSwitch(c *gin.Context) {
	enabled := c.Query("enabled") == "true"
	var err error

	if s.killswitch != nil {
		if enabled {
			err = s.killswitch.Enable()
		} else {
			err = s.killswitch.Disable()
		}
	}

	if err != nil {
		s.logger.Errorf("Failed to update kill switch: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	s.logger.Infof("Kill switch %s", map[bool]string{true: "ACTIVATED", false: "DEACTIVATED"}[enabled])
	s.broadcast(gin.H{"type": "killswitch", "enabled": enabled})
	c.JSON(http.StatusOK, gin.H{"enabled": enabled, "message": "Kill switch updated"})
}

func (s *Server) handleGetKillSwitch(c *gin.Context) {
	enabled := false
	if s.killswitch != nil {
		enabled = s.killswitch.IsEnabled()
	}
	c.JSON(http.StatusOK, gin.H{"enabled": enabled})
}

func (s *Server) handleHealth(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (s *Server) handleGetWhitelist(c *gin.Context) {
	if s.adblock == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Ad-block engine not available"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"whitelist": s.adblock.Blocklist.GetWhitelist()})
}

func (s *Server) handleAddWhitelist(c *gin.Context) {
	if s.adblock == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Ad-block engine not available"})
		return
	}

	var req struct {
		Domain string `json:"domain" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	s.adblock.Blocklist.AddToWhitelist(req.Domain)
	c.JSON(http.StatusOK, gin.H{"message": "Domain added to whitelist"})
}

func (s *Server) handleRemoveWhitelist(c *gin.Context) {
	if s.adblock == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Ad-block engine not available"})
		return
	}

	domain := c.Query("domain")
	if domain == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Domain required"})
		return
	}

	s.adblock.Blocklist.RemoveFromWhitelist(domain)
	c.JSON(http.StatusOK, gin.H{"message": "Domain removed from whitelist"})
}

func (s *Server) Start(ctx context.Context, port string) error {
	addr := ":" + port
	// Check if port already has a colon
	if len(port) > 0 && port[0] == ':' {
		addr = port
	}

	srv := &http.Server{
		Addr:    addr,
		Handler: s.router,
	}

	go func() {
		<-ctx.Done()
		srv.Shutdown(context.Background())
	}()

	s.logger.Infof("Starting HTTP API server on %s", addr)
	return srv.ListenAndServe()
}

func (s *Server) handleRefreshBlocklists(c *gin.Context) {
	if s.adblock == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Ad-block engine not available"})
		return
	}

	go s.adblock.UpdateBlocklists()
	c.JSON(http.StatusOK, gin.H{"message": "Ad-block lists update started"})
}

func (s *Server) handleGetAdblockStats(c *gin.Context) {
	if s.adblock == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Ad-block engine not available"})
		return
	}

	c.JSON(http.StatusOK, s.adblock.Blocklist.GetStats())
}

func (s *Server) handleGetCustomRules(c *gin.Context) {
	if s.adblock == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Ad-block engine not available"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"rules": s.adblock.Blocklist.GetCustomRules()})
}

func (s *Server) handleAddCustomRules(c *gin.Context) {
	if s.adblock == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Ad-block engine not available"})
		return
	}

	var req struct {
		Rules []string `json:"rules" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	s.adblock.Blocklist.SetCustomRules(req.Rules)
	c.JSON(http.StatusOK, gin.H{"message": "Custom rules updated"})
}
