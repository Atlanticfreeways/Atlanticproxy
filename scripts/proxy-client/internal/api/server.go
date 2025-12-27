package api

import (
	"context"
	"net/http"
	"sync"
	"time"

	"github.com/atlanticproxy/proxy-client/internal/adblock"
	"github.com/atlanticproxy/proxy-client/internal/killswitch"
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
	router     *gin.Engine
	logger     *logrus.Logger
	status     *ProxyStatus
	adblock    *adblock.Engine
	killswitch *killswitch.Guardian
	clients    map[*websocket.Conn]bool
	mu         sync.RWMutex
}



type ProxyStatus struct {
	Connected bool   `json:"connected"`
	IPAddress string `json:"ip_address,omitempty"`
	Location  string `json:"location,omitempty"`
	LastCheck string `json:"last_check,omitempty"`
	Error     string `json:"error,omitempty"`
}

type ConnectRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Endpoint string `json:"endpoint"`
}

func NewServer(ab *adblock.Engine, ks *killswitch.Guardian) *Server {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Recovery())

	s := &Server{
		router:     router,
		logger:     logrus.New(),
		status:     &ProxyStatus{Connected: false},
		adblock:    ab,
		killswitch: ks,
		clients:    make(map[*websocket.Conn]bool),
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

	s.status.Connected = true
	s.status.IPAddress = "192.168.1.100"
	s.status.Location = "United States"
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

	s.status.Connected = false
	s.status.IPAddress = ""
	s.status.Location = ""
	s.status.Error = ""

	s.broadcast(s.status)
	c.JSON(http.StatusOK, gin.H{"message": "Disconnected successfully"})
}

func (s *Server) handleKillSwitch(c *gin.Context) {
	enabled := c.Query("enabled") == "true"
	s.logger.Infof("Kill switch %s", map[bool]string{true: "ACTIVATED", false: "DEACTIVATED"}[enabled])

	// TODO: Implement actual kill switch logic
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

func (s *Server) Start(ctx context.Context) error {

	srv := &http.Server{
		Addr:    ":8082",
		Handler: s.router,
	}

	go func() {
		<-ctx.Done()
		srv.Shutdown(context.Background())
	}()

	s.logger.Info("Starting HTTP API server on :8082")
	return srv.ListenAndServe()
}
