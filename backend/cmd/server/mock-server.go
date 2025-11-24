package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// MockServer starts a mock backend for testing without database
func startMockServer() {
	router := gin.Default()

	// CORS
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Mock auth endpoints
	router.POST("/api/auth/register", func(c *gin.Context) {
		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		c.BindJSON(&req)
		c.JSON(http.StatusOK, gin.H{
			"id":    1,
			"email": req.Email,
			"token": "mock-token-12345",
		})
	})

	router.POST("/api/auth/login", func(c *gin.Context) {
		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		c.BindJSON(&req)
		c.JSON(http.StatusOK, gin.H{
			"id":    1,
			"email": req.Email,
			"token": "mock-token-12345",
		})
	})

	router.GET("/api/auth/me", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"id":                 1,
			"email":              "test@example.com",
			"subscription_tier":  "pro",
			"created_at":         "2024-01-01T00:00:00Z",
		})
	})

	// Mock proxy endpoints
	router.GET("/api/proxy/status", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":     "connected",
			"ip":         "192.168.1.1",
			"location":   "US",
			"connected":  true,
		})
	})

	router.POST("/api/proxy/connect", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "connected",
			"message":   "Proxy connected successfully",
		})
	})

	router.POST("/api/proxy/disconnect", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "disconnected",
			"message":   "Proxy disconnected successfully",
		})
	})

	// Mock usage endpoints
	router.GET("/api/usage/stats", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"bytes_sent":     1024000,
			"bytes_received": 2048000,
			"requests":       150,
		})
	})

	// Mock billing endpoints
	router.GET("/api/billing/plans", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"plans": []gin.H{
				{
					"id":    "free",
					"name":  "Free",
					"price": 0,
				},
				{
					"id":    "pro",
					"name":  "Pro",
					"price": 9.99,
				},
				{
					"id":    "enterprise",
					"name":  "Enterprise",
					"price": 99.99,
				},
			},
		})
	})

	router.POST("/api/billing/subscribe", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "success",
			"message":   "Subscription created",
		})
	})

	router.GET("/api/billing/verify", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "verified",
			"message":   "Payment verified",
		})
	})

	router.GET("/api/billing/invoices", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"invoices": []gin.H{},
		})
	})

	// Mock analytics endpoints
	router.GET("/api/analytics/usage-trends", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"trends": []gin.H{
				{"date": "2024-01-01", "usage": 100},
				{"date": "2024-01-02", "usage": 150},
			},
		})
	})

	router.GET("/api/analytics/cost-analysis", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"total_cost": 25.50,
			"breakdown":  gin.H{},
		})
	})

	// Mock account endpoints
	router.GET("/api/account/security", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"2fa_enabled": false,
			"last_login":  "2024-01-15T10:30:00Z",
		})
	})

	// Mock referral endpoints
	router.GET("/api/referrals/code", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"code":  "REF123456",
			"url":   "https://atlanticproxy.com?ref=REF123456",
		})
	})

	router.GET("/api/referrals/history", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"referrals": []gin.H{},
		})
	})

	log.Println("🚀 Mock Server starting on port :5000")
	router.Run(":5000")
}
