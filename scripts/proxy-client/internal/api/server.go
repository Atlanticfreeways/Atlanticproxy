package api

import (
	"context"
	"net/http"
	"sync"
	"time"

	"github.com/atlanticproxy/proxy-client/internal/adblock"
	"github.com/atlanticproxy/proxy-client/internal/billing"
	"github.com/atlanticproxy/proxy-client/internal/interceptor"
	"github.com/atlanticproxy/proxy-client/internal/killswitch"
	"github.com/atlanticproxy/proxy-client/internal/proxy"
	"github.com/atlanticproxy/proxy-client/internal/rotation"
	"github.com/atlanticproxy/proxy-client/internal/storage"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
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
	clients          map[*websocket.Conn]bool
	mu               sync.RWMutex
}

type ProxyStatus struct {
	Connected bool    `json:"connected"`
	IPAddress string  `json:"ip_address,omitempty"`
	Location  string  `json:"location,omitempty"`
	Lat       float64 `json:"lat,omitempty"`
	Lon       float64 `json:"lon,omitempty"`
	LastCheck string  `json:"last_check,omitempty"`
	Error     string  `json:"error,omitempty"`
}

type ConnectRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Endpoint string `json:"endpoint"`
}

func NewServer(ab *adblock.Engine, ks *killswitch.Guardian, it *interceptor.TunInterceptor, pr *proxy.Engine, rm *rotation.Manager, am *rotation.AnalyticsManager, bm *billing.Manager, store *storage.Store) *Server {
	gin.SetMode(gin.ReleaseMode)
	// ... (router setup)
	router := gin.New()
	router.Use(gin.Recovery())
	// ... middleware ...
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	s := &Server{
		router:           router,
		logger:           logrus.New(),
		status:           &ProxyStatus{Connected: false},
		adblock:          ab,
		killswitch:       ks,
		interceptor:      it,
		proxy:            pr,
		rotationManager:  rm,
		analyticsManager: am,
		billingManager:   bm,
		store:            store,
		clients:          make(map[*websocket.Conn]bool),
	}

	s.setupRoutes()
	return s
}

func (s *Server) setupRoutes() {
	s.router.POST("/connect", s.handleConnect)
	s.router.GET("/status", s.handleStatus)
	s.router.POST("/disconnect", s.handleDisconnect)
	s.router.POST("/killswitch", s.handleKillSwitch)
	s.router.GET("/killswitch", s.handleGetKillSwitch)
	s.router.GET("/health", s.handleHealth)
	s.router.GET("/ws", s.handleWS)

	// Ad-block Whitelist API
	s.router.GET("/adblock/whitelist", s.handleGetWhitelist)
	s.router.POST("/adblock/whitelist", s.handleAddWhitelist)
	s.router.DELETE("/adblock/whitelist", s.handleRemoveWhitelist)

	// Ad-block Advanced API
	s.router.POST("/adblock/refresh", s.handleRefreshBlocklists)
	s.router.GET("/adblock/stats", s.handleGetAdblockStats)
	s.router.GET("/adblock/custom", s.handleGetCustomRules)
	s.router.POST("/adblock/custom", s.handleAddCustomRules)

	// Rotation API
	s.router.GET("/api/rotation/config", s.handleGetRotationConfig)

	s.router.POST("/api/rotation/config", s.handleSetRotationConfig)
	s.router.POST("/api/rotation/session/new", s.handleNewSession)
	s.router.GET("/api/rotation/session/current", s.handleGetCurrentSession)
	s.router.GET("/api/rotation/stats", s.handleGetRotationStats)
	s.router.POST("/api/rotation/geo", s.handleSetGeo)

	// Billing API
	s.router.GET("/api/billing/plans", s.handleGetPlans)
	s.router.GET("/api/billing/subscription", s.handleGetSubscription)
	s.router.POST("/api/billing/subscribe", s.handleSubscribe)
	s.router.POST("/api/billing/checkout", s.handleCreateCheckoutSession)
	s.router.POST("/api/billing/cancel", s.handleCancelSubscription)
	s.router.GET("/api/billing/usage", s.handleGetUsage)

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
		// Read message (required to handle close messages)
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
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

	s.status.Connected = true
	s.status.IPAddress = "45.133.190.112" // Example residential IP
	s.status.Location = "New York, USA"
	s.status.Lat = 40.7128
	s.status.Lon = -74.0060
	s.status.LastCheck = time.Now().Format(time.RFC3339)
	s.status.Error = ""

	s.broadcast(s.status)
	c.JSON(http.StatusOK, gin.H{"message": "Connected successfully"})
}

func (s *Server) handleStatus(c *gin.Context) {
	s.status.LastCheck = time.Now().Format(time.RFC3339)
	c.JSON(http.StatusOK, s.status)
}

func (s *Server) handleDisconnect(c *gin.Context) {
	s.logger.Info("Disconnecting from proxy")

	// Stop interception
	if s.interceptor != nil {
		s.interceptor.Stop()
	}

	s.status.Connected = false
	s.status.IPAddress = ""
	s.status.Location = ""
	s.status.Error = ""

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
	// TODO: Get actual kill switch status
	c.JSON(http.StatusOK, gin.H{"enabled": false})
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
