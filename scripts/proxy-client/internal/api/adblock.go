package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (s *Server) handleToggleAdblockCategory(c *gin.Context) {
	var req struct {
		Category string `json:"category" binding:"required"`
		Enabled  bool   `json:"enabled"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// We access the blocklist manager via the engine -> adblock engine
	// But in server.go we only have local instances of Adblock Engine if passed?
	// Let's check s.adblock in server.go
	if s.adblock == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Adblock engine not available"})
		return
	}

	s.adblock.Blocklist.ToggleCategory(req.Category, req.Enabled)
	c.JSON(http.StatusOK, gin.H{"message": "Category updated"})
}

func (s *Server) handleGetAdblockConfig(c *gin.Context) {
	if s.adblock == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Adblock engine not available"})
		return
	}

	// List of known categories (could be dynamic)
	categories := []string{"ads", "trackers", "malware", "social", "adult", "gambling"}

	config := make(map[string]bool)
	for _, cat := range categories {
		config[cat] = s.adblock.Blocklist.IsCategoryEnabled(cat)
	}

	c.JSON(http.StatusOK, gin.H{
		"categories": config,
		"whitelist":  s.adblock.Blocklist.GetWhitelist(),
		"custom":     s.adblock.Blocklist.GetCustomRules(),
	})
}
