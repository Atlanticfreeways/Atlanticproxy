package security

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// RateLimiter implements rate limiting
type RateLimiter struct {
	requests map[string][]time.Time
	limit    int
	window   time.Duration
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	return &RateLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}
}

// Allow checks if a request is allowed
func (rl *RateLimiter) Allow(ip string) bool {
	now := time.Now()
	cutoff := now.Add(-rl.window)

	// Clean old requests
	if requests, exists := rl.requests[ip]; exists {
		var valid []time.Time
		for _, req := range requests {
			if req.After(cutoff) {
				valid = append(valid, req)
			}
		}
		rl.requests[ip] = valid

		if len(valid) >= rl.limit {
			return false
		}
	}

	// Add new request
	rl.requests[ip] = append(rl.requests[ip], now)
	return true
}

// RateLimitMiddleware returns a rate limiting middleware
func RateLimitMiddleware(limiter *RateLimiter) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		if !limiter.Allow(ip) {
			log.Printf("⚠️  Rate limit exceeded for IP: %s", ip)
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "Rate limit exceeded"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// CSRFMiddleware implements CSRF protection
func CSRFMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// For state-changing requests, verify CSRF token
		if c.Request.Method != "GET" && c.Request.Method != "HEAD" && c.Request.Method != "OPTIONS" {
			token := c.GetHeader("X-CSRF-Token")
			if token == "" {
				log.Printf("⚠️  Missing CSRF token for %s %s", c.Request.Method, c.Request.URL.Path)
				c.JSON(http.StatusForbidden, gin.H{"error": "Missing CSRF token"})
				c.Abort()
				return
			}

			// TODO: Verify CSRF token against session
			// For now, just check it exists
		}

		c.Next()
	}
}

// SecurityHeadersMiddleware adds security headers
func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Prevent clickjacking
		c.Header("X-Frame-Options", "DENY")

		// Prevent MIME type sniffing
		c.Header("X-Content-Type-Options", "nosniff")

		// Enable XSS protection
		c.Header("X-XSS-Protection", "1; mode=block")

		// Content Security Policy
		c.Header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'")

		// Referrer Policy
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")

		// Permissions Policy
		c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

		// HSTS (only in production)
		if gin.Mode() == gin.ReleaseMode {
			c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		}

		c.Next()
	}
}

// InputValidationMiddleware validates input
func InputValidationMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Validate content type for POST/PUT requests
		if c.Request.Method == "POST" || c.Request.Method == "PUT" {
			contentType := c.GetHeader("Content-Type")
			if contentType != "" && !strings.Contains(contentType, "application/json") {
				log.Printf("⚠️  Invalid content type: %s", contentType)
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid content type"})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}

// LoggingMiddleware logs all requests
func LoggingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()

		c.Next()

		duration := time.Since(startTime)
		statusCode := c.Writer.Status()
		method := c.Request.Method
		path := c.Request.URL.Path
		ip := c.ClientIP()

		log.Printf("[%s] %s %s - Status: %d - Duration: %v - IP: %s",
			method, path, c.Request.URL.RawQuery, statusCode, duration, ip)
	}
}

// AuthenticationMiddleware validates JWT tokens
func AuthenticationMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			log.Printf("⚠️  Missing authorization header for %s %s", c.Request.Method, c.Request.URL.Path)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Printf("⚠️  Invalid authorization header format")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header"})
			c.Abort()
			return
		}

		token := parts[1]

		// TODO: Verify JWT token
		// For now, just check it exists
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// CORSMiddleware implements CORS
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// ErrorHandlingMiddleware handles panics and errors
func ErrorHandlingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("❌ Panic recovered: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			}
		}()

		c.Next()

		// Handle errors
		if len(c.Errors) > 0 {
			err := c.Errors.Last()
			log.Printf("❌ Error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		}
	}
}

// RequestIDMiddleware adds request ID to context
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := fmt.Sprintf("%d", time.Now().UnixNano())
		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)
		c.Next()
	}
}
