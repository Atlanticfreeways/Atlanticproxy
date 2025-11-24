package api

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type Server struct {
	router *gin.Engine
	logger *logrus.Logger
	status *ProxyStatus
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

func NewServer() *Server {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Recovery())

	s := &Server{
		router: router,
		logger: logrus.New(),
		status: &ProxyStatus{Connected: false},
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

	c.JSON(http.StatusOK, gin.H{"message": "Disconnected successfully"})
}

func (s *Server) handleKillSwitch(c *gin.Context) {
	enabled := c.Query("enabled") == "true"
	s.logger.Infof("Kill switch %s", map[bool]string{true: "ACTIVATED", false: "DEACTIVATED"}[enabled])
	
	// TODO: Implement actual kill switch logic
	c.JSON(http.StatusOK, gin.H{"enabled": enabled, "message": "Kill switch updated"})
}

func (s *Server) handleGetKillSwitch(c *gin.Context) {
	// TODO: Get actual kill switch status
	c.JSON(http.StatusOK, gin.H{"enabled": false})
}

func (s *Server) handleHealth(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
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