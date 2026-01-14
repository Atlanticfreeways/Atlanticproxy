package api

import (
	"net/http"
	"sync"
	"time"

	"github.com/atlanticproxy/proxy-client/internal/billing"
	"github.com/atlanticproxy/proxy-client/internal/storage"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// RateLimiter implements a simple token bucket
type RateLimiter struct {
	tokens      float64
	lastUpdated time.Time
	refillRate  float64 // tokens per second
	capacity    float64
	mu          sync.Mutex
}

func NewRateLimiter(rate, capacity float64) *RateLimiter {
	return &RateLimiter{
		tokens:      capacity,
		lastUpdated: time.Now(),
		refillRate:  rate,
		capacity:    capacity,
	}
}

func (rl *RateLimiter) Allow() bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	elapsed := now.Sub(rl.lastUpdated).Seconds()

	// Refill tokens
	rl.tokens += elapsed * rl.refillRate
	if rl.tokens > rl.capacity {
		rl.tokens = rl.capacity
	}
	rl.lastUpdated = now

	if rl.tokens >= 1.0 {
		rl.tokens -= 1.0
		return true
	}
	return false
}

// RateLimiterMiddleware enforces rate limiting based on user plan or IP
func RateLimiterMiddleware(bm *billing.Manager) gin.HandlerFunc {
	// Mutex for map safety
	var mu sync.RWMutex
	limiters := make(map[string]*RateLimiter)

	// Clean up old limiters periodically to prevent memory leak
	go func() {
		for {
			time.Sleep(10 * time.Minute)
			mu.Lock()
			for key, limiter := range limiters {
				if time.Since(limiter.lastUpdated) > 10*time.Minute {
					delete(limiters, key)
				}
			}
			mu.Unlock()
		}
	}()

	return func(c *gin.Context) {
		// Determine Key and Limits
		key := c.ClientIP()
		rate := 100.0 / 60.0 // Default: 100 req/min
		burst := 20.0

		// If authenticated, use UserID and Plan Limits
		if userVal, exists := c.Get("user"); exists {
			if user, ok := userVal.(*storage.User); ok {
				key = user.ID

				// Fetch Subscription to get Plan Limits
				// Ensure we handle concurrent access if needed, but Manager is thread-safe
				sub := bm.GetSubscription() // This gets ACTIVE user's sub
				if sub != nil {
					_, err := billing.GetPlan(sub.PlanID)
					if err == nil {
						// Apply Plan Limits
						// RequestLimit in Plan is "Monthly Limit", not Rate per second.
						// We probably want a "Rate" derived from tier, or just generic high limits for paid.
						// Let's interpret tiers:
						// Starter: 10 req/sec
						// Personal: 50 req/sec
						// Team: 500 req/sec
						// Enterprise: Unlimited (10000 req/sec)

						switch sub.PlanID {
						case billing.PlanStarter:
							rate = 10.0
							burst = 50.0
						case billing.PlanPersonal:
							rate = 50.0
							burst = 200.0
						case billing.PlanTeam:
							rate = 500.0
							burst = 1000.0
						case billing.PlanEnterprise:
							rate = 10000.0
							burst = 10000.0
						}
					}
				}
			}
		}

		mu.Lock()
		limiter, exists := limiters[key]
		if !exists || limiter.refillRate != rate { // Update limit if changed (e.g. upgrade)
			limiter = NewRateLimiter(rate, burst)
			limiters[key] = limiter
		}
		mu.Unlock()

		if !limiter.Allow() {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests. Please upgrade your plan for higher limits.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequestIDMiddleware generates a unique request ID for tracing
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = time.Now().Format("20060102150405") + "-" + c.ClientIP()
		}
		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)
		c.Next()
	}
}

// LoggingMiddleware logs all requests with structured fields
func LoggingMiddleware(logger *logrus.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path

		c.Next()

		duration := time.Since(start)
		requestID, _ := c.Get("request_id")

		fields := map[string]interface{}{
			"request_id": requestID,
			"method":     c.Request.Method,
			"path":       path,
			"status":     c.Writer.Status(),
			"duration":   duration.Milliseconds(),
			"ip":         c.ClientIP(),
		}

		logger.WithFields(logrus.Fields(fields)).Info("Request completed")
	}
}

// RecoveryMiddleware catches panics and logs them
func RecoveryMiddleware(logger *logrus.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				requestID, _ := c.Get("request_id")

				fields := map[string]interface{}{
					"request_id": requestID,
					"error":      err,
					"path":       c.Request.URL.Path,
				}

				logger.WithFields(logrus.Fields(fields)).Error("Panic recovered")

				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Internal server error",
				})
				c.Abort()
			}
		}()
		c.Next()
	}
}

// SecurityHeadersMiddleware adds essential security headers to every response
func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ws: wss:;")
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")

		c.Next()
	}
}
