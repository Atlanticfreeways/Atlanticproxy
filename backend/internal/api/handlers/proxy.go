package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/atlanticproxy/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

type ProxyHandler struct {
	db              *sqlx.DB
	oxylabsUsername string
	oxylabsPassword string
}

func NewProxyHandler(db *sqlx.DB, oxylabsUsername, oxylabsPassword string) *ProxyHandler {
	return &ProxyHandler{
		db:              db,
		oxylabsUsername: oxylabsUsername,
		oxylabsPassword: oxylabsPassword,
	}
}

func (h *ProxyHandler) Connect(c *gin.Context) {
	userID := c.GetInt("user_id")

	// Generate unique client ID
	clientID := fmt.Sprintf("client-%d-%d", userID, time.Now().Unix())

	// Create connection record
	_, err := h.db.Exec(
		`INSERT INTO proxy_connections (user_id, client_id, status, connected_at) 
		 VALUES ($1, $2, 'connecting', NOW())`,
		userID, clientID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create connection"})
		return
	}

	// Return credentials
	c.JSON(http.StatusOK, gin.H{
		"client_id":         clientID,
		"oxylabs_username":  h.oxylabsUsername,
		"oxylabs_password":  h.oxylabsPassword,
		"endpoints": []string{
			"pr.oxylabs.io:7777",
			"pr.oxylabs.io:8000",
		},
	})
}

func (h *ProxyHandler) GetStatus(c *gin.Context) {
	userID := c.GetInt("user_id")

	var connection models.ProxyConnection
	err := h.db.Get(&connection,
		`SELECT * FROM proxy_connections 
		 WHERE user_id = $1 AND disconnected_at IS NULL 
		 ORDER BY connected_at DESC LIMIT 1`,
		userID,
	)

	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"connected": false,
			"status":    "disconnected",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"connected":  true,
		"status":     connection.Status,
		"client_id":  connection.ClientID,
		"ip_address": connection.IPAddress,
		"location":   connection.Location,
	})
}

func (h *ProxyHandler) Disconnect(c *gin.Context) {
	userID := c.GetInt("user_id")

	_, err := h.db.Exec(
		`UPDATE proxy_connections 
		 SET status = 'disconnected', disconnected_at = NOW() 
		 WHERE user_id = $1 AND disconnected_at IS NULL`,
		userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to disconnect"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Disconnected successfully"})
}