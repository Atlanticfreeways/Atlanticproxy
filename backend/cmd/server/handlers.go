package main

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
)

// User model
type User struct {
	ID                int       `db:"id" json:"id"`
	Email             string    `db:"email" json:"email"`
	PasswordHash      string    `db:"password_hash" json:"-"`
	SubscriptionTier  string    `db:"subscription_tier" json:"subscription_tier"`
	CreatedAt         time.Time `db:"created_at" json:"created_at"`
}

// Claims for JWT
type Claims struct {
	UserID int    `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

// Register handler
func registerHandler(db *sqlx.DB, jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Email    string `json:"email" binding:"required,email"`
			Password string `json:"password" binding:"required,min=8"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}

		// If no database, return mock response
		if db == nil {
			user := User{
				ID:               1,
				Email:            req.Email,
				SubscriptionTier: "free",
			}
			token, err := generateToken(user.ID, user.Email, jwtSecret)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
				return
			}
			c.JSON(http.StatusCreated, gin.H{
				"user":  user,
				"token": token,
			})
			return
		}

		// Insert user
		var user User
		err = db.QueryRowx(
			`INSERT INTO users (email, password_hash, subscription_tier) 
			 VALUES ($1, $2, 'free') 
			 RETURNING id, email, subscription_tier, created_at`,
			req.Email, string(hashedPassword),
		).StructScan(&user)

		if err != nil {
			if strings.Contains(err.Error(), "duplicate key") {
				c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		// Generate token
		token, err := generateToken(user.ID, user.Email, jwtSecret)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"user":  user,
			"token": token,
		})
	}
}

// Login handler
func loginHandler(db *sqlx.DB, jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Email    string `json:"email" binding:"required,email"`
			Password string `json:"password" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// If no database, return mock response
		if db == nil {
			user := User{
				ID:               1,
				Email:            req.Email,
				SubscriptionTier: "free",
			}
			token, err := generateToken(user.ID, user.Email, jwtSecret)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
				return
			}
			c.JSON(http.StatusOK, gin.H{
				"user":  user,
				"token": token,
			})
			return
		}

		// Get user
		var user User
		err := db.Get(&user, "SELECT id, email, password_hash, subscription_tier, created_at FROM users WHERE email = $1", req.Email)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		// Verify password
		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		// Generate token
		token, err := generateToken(user.ID, user.Email, jwtSecret)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"user":  user,
			"token": token,
		})
	}
}

// Me handler
func meHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("user_id")

		var user User
		err := db.Get(&user, "SELECT id, email, subscription_tier, created_at FROM users WHERE id = $1", userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}

// Proxy status handler
func proxyStatusHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("user_id")

		var status struct {
			Connected  bool   `json:"connected"`
			ClientID   string `json:"client_id"`
			IPAddress  string `json:"ip_address"`
			Location   string `json:"location"`
		}

		// Check if user has active connection
		err := db.QueryRow(
			`SELECT COALESCE(status = 'connected', false) as connected,
			        COALESCE(client_id, '') as client_id,
			        COALESCE(ip_address, '') as ip_address,
			        COALESCE(location, '') as location
			 FROM proxy_connections 
			 WHERE user_id = $1 
			 ORDER BY connected_at DESC 
			 LIMIT 1`,
			userID,
		).Scan(&status.Connected, &status.ClientID, &status.IPAddress, &status.Location)

		if err != nil {
			// No connection found, return default
			status.Connected = false
			status.ClientID = ""
			status.IPAddress = ""
			status.Location = ""
		}

		c.JSON(http.StatusOK, status)
	}
}

// Proxy connect handler
func proxyConnectHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("user_id")

		clientID := fmt.Sprintf("client-%d-%d", userID, time.Now().Unix())
		ipAddress := "192.168.1.1"
		location := "New York, USA"

		// Insert connection record
		_, err := db.Exec(
			`INSERT INTO proxy_connections (user_id, client_id, status, ip_address, location, connected_at)
			 VALUES ($1, $2, 'connected', $3, $4, NOW())`,
			userID, clientID, ipAddress, location,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"client_id":  clientID,
			"ip_address": ipAddress,
			"location":   location,
		})
	}
}

// Proxy disconnect handler
func proxyDisconnectHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("user_id")

		// Update connection status
		_, err := db.Exec(
			`UPDATE proxy_connections 
			 SET status = 'disconnected', disconnected_at = NOW()
			 WHERE user_id = $1 AND status = 'connected'`,
			userID,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to disconnect"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"status": "disconnected"})
	}
}

// Usage stats handler
func usageStatsHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("user_id")

		var stats struct {
			BytesSent     int64 `json:"bytes_sent"`
			BytesReceived int64 `json:"bytes_received"`
			RequestsCount int   `json:"requests_count"`
		}

		err := db.QueryRow(
			`SELECT COALESCE(SUM(bytes_sent), 0) as bytes_sent,
			        COALESCE(SUM(bytes_received), 0) as bytes_received,
			        COALESCE(SUM(requests_count), 0) as requests_count
			 FROM proxy_usage 
			 WHERE user_id = $1`,
			userID,
		).Scan(&stats.BytesSent, &stats.BytesReceived, &stats.RequestsCount)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get stats"})
			return
		}

		c.JSON(http.StatusOK, stats)
	}
}

// Usage monthly handler
func usageMonthlyHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("user_id")

		var stats struct {
			Month         string `json:"month"`
			BytesUsed     int64  `json:"bytes_used"`
			RequestsCount int    `json:"requests_count"`
			Cost          string `json:"cost"`
		}

		err := db.QueryRow(
			`SELECT TO_CHAR(NOW(), 'Month YYYY') as month,
			        COALESCE(SUM(bytes_sent + bytes_received), 0) as bytes_used,
			        COALESCE(SUM(requests_count), 0) as requests_count
			 FROM proxy_usage 
			 WHERE user_id = $1 
			 AND recorded_at >= DATE_TRUNC('month', NOW())`,
			userID,
		).Scan(&stats.Month, &stats.BytesUsed, &stats.RequestsCount)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get monthly stats"})
			return
		}

		// Calculate cost (mock: $0.01 per GB)
		gbUsed := float64(stats.BytesUsed) / (1024 * 1024 * 1024)
		cost := gbUsed * 0.01
		stats.Cost = fmt.Sprintf("$%.2f", cost)

		c.JSON(http.StatusOK, stats)
	}
}

// Generate JWT token
func generateToken(userID int, email, secret string) (string, error) {
	claims := Claims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// Auth middleware
func authMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header"})
			c.Abort()
			return
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Next()
	}
}


// Billing plans handler
func billingPlansHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, []gin.H{
			{
				"id":          "free",
				"name":        "Free",
				"price":       0,
				"features":    []string{"1 GB/month", "1 location", "Basic support"},
				"description": "Perfect for getting started",
			},
			{
				"id":          "pro",
				"name":        "Pro",
				"price":       9.99,
				"features":    []string{"100 GB/month", "All locations", "Priority support"},
				"description": "For regular users",
			},
			{
				"id":          "enterprise",
				"name":        "Enterprise",
				"price":       0,
				"features":    []string{"Unlimited", "Dedicated support", "Custom SLA"},
				"description": "For large-scale operations",
			},
		})
	}
}

// Billing subscribe handler
func billingSubscribeHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("user_id")
		email := c.GetString("email")

		var req struct {
			PlanID string `json:"plan_id" binding:"required"`
			Amount int    `json:"amount" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Generate reference
		reference := fmt.Sprintf("ref-%d-%d", userID, time.Now().Unix())

		// TODO: Initialize Paystack transaction
		// paystackService.InitializeTransaction(email, req.Amount, reference)

		// For now, return mock response with Paystack structure
		c.JSON(http.StatusOK, gin.H{
			"status":              "success",
			"message":             "Authorization URL created",
			"data": gin.H{
				"authorization_url": "https://checkout.paystack.com/abc123",
				"access_code":       "access_code_123",
				"reference":         reference,
			},
		})
	}
}

// Billing invoices handler
func billingInvoicesHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, []gin.H{})
	}
}

// Billing payment methods handler
func billingPaymentMethodsHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"id":        "pm-123",
			"type":      "card",
			"last_four": "4242",
		})
	}
}

// Billing get payment methods handler
func billingGetPaymentMethodsHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, []gin.H{})
	}
}

// Billing verify payment handler
func billingVerifyPaymentHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("user_id")
		reference := c.Query("reference")

		if reference == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Reference required"})
			return
		}

		// TODO: Verify Paystack transaction
		// paystackService.VerifyTransaction(reference)

		// For now, return mock response
		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Verification successful",
			"data": gin.H{
				"reference":      reference,
				"amount":         999900,
				"paid_at":        time.Now(),
				"customer_code":  "CUS_abc123",
				"authorization": gin.H{
					"authorization_code": "AUTH_xyz789",
					"bin":                 "408408",
					"last4":               "4081",
					"exp_month":           "12",
					"exp_year":            "2025",
					"channel":             "card",
					"card_type":           "visa",
				},
			},
		})
	}
}

// Notifications settings handler
func notificationsSettingsHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"email_notifications": gin.H{
				"connection_alerts": true,
				"usage_alerts":      true,
				"billing_alerts":    true,
			},
			"push_notifications": gin.H{
				"connection_alerts": false,
				"usage_alerts":      false,
			},
		})
	}
}

// Notifications update handler
func notificationsUpdateHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "updated"})
	}
}

// Notifications test email handler
func notificationsTestEmailHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "email sent"})
	}
}

// Analytics usage trends handler
func analyticsUsageTrendsHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"period": "month",
			"data": []gin.H{
				{"date": "2025-11-01", "bytes": 1000000},
				{"date": "2025-11-02", "bytes": 1500000},
				{"date": "2025-11-03", "bytes": 1200000},
				{"date": "2025-11-04", "bytes": 2000000},
				{"date": "2025-11-05", "bytes": 1800000},
			},
		})
	}
}

// Analytics cost analysis handler
func analyticsCostAnalysisHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"total_cost": 9.99,
			"breakdown": gin.H{
				"residential": 5.99,
				"datacenter":  2.50,
				"mobile":      1.50,
			},
		})
	}
}

// Analytics export handler
func analyticsExportHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"export_id": "exp-123",
			"format":    "csv",
			"status":    "processing",
		})
	}
}

// Account security handler
func accountSecurityHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"two_factor_enabled":   false,
			"last_password_change": "2025-11-01",
			"active_sessions":      1,
		})
	}
}

// Account password handler
func accountPasswordHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "password updated"})
	}
}

// Account 2FA handler
func account2FAHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"secret":  "JBSWY3DPEBLW64TMMQ======",
			"qr_code": "data:image/png;base64,...",
		})
	}
}

// Account delete handler
func accountDeleteHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "account deletion initiated"})
	}
}

// Referrals code handler
func referralsCodeHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"code":              "REF-ABC123",
			"link":              "https://atlanticproxy.com/ref/abc123",
			"commission_rate":   20,
			"total_referrals":   0,
			"total_earnings":    0,
		})
	}
}

// Referrals history handler
func referralsHistoryHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, []gin.H{})
	}
}

// Referrals payout handler
func referralsPayoutHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"payout_id": "payout-123",
			"amount":    0,
			"status":    "processing",
		})
	}
}
