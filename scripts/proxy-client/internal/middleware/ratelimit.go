package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type RateLimiter struct {
	limiters map[string]*rate.Limiter
	mu       sync.RWMutex
	rate     rate.Limit
	burst    int
}

func NewRateLimiter(r rate.Limit, b int) *RateLimiter {
	return &RateLimiter{
		limiters: make(map[string]*rate.Limiter),
		rate:     r,
		burst:    b,
	}
}

func (rl *RateLimiter) getLimiter(key string) *rate.Limiter {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	limiter, exists := rl.limiters[key]
	if !exists {
		limiter = rate.NewLimiter(rl.rate, rl.burst)
		rl.limiters[key] = limiter
	}

	return limiter
}

func RateLimitMiddleware(requestsPerMinute int) gin.HandlerFunc {
	limiter := NewRateLimiter(rate.Limit(requestsPerMinute)/60, requestsPerMinute)

	return func(c *gin.Context) {
		key := c.ClientIP()
		
		// Get user ID if authenticated
		if userID, exists := c.Get("user_id"); exists {
			key = userID.(string)
		}

		l := limiter.getLimiter(key)
		
		if !l.Allow() {
			c.Header("X-RateLimit-Limit", string(rune(requestsPerMinute)))
			c.Header("X-RateLimit-Remaining", "0")
			c.Header("X-RateLimit-Reset", string(rune(time.Now().Add(time.Minute).Unix())))
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Rate limit exceeded. Please try again later.",
			})
			c.Abort()
			return
		}

		c.Header("X-RateLimit-Limit", string(rune(requestsPerMinute)))
		c.Next()
	}
}

// Endpoint-specific rate limiters
func LoginRateLimit() gin.HandlerFunc {
	return RateLimitMiddleware(5) // 5 requests per minute
}

func APIRateLimit() gin.HandlerFunc {
	return RateLimitMiddleware(100) // 100 requests per minute
}

func WebhookRateLimit() gin.HandlerFunc {
	return RateLimitMiddleware(10) // 10 requests per minute
}
