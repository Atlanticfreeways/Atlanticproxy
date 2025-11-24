package main

import (
	"atlanticproxy/backend/internal/audit"
	"atlanticproxy/backend/internal/config"
	"atlanticproxy/backend/internal/database"
	"atlanticproxy/backend/internal/encryption"
	"context"
	"crypto/tls"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func main() {
	// Database connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:password@localhost:5432/atlantic_proxy?sslmode=disable"
	}

	log.Println("🔄 Connecting to database...")
	var db *sqlx.DB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	db, err := sqlx.ConnectContext(ctx, "postgres", dbURL)
	cancel()
	
	if err != nil {
		log.Printf("❌ Database connection failed: %v", err)
		log.Println("⚠️  Falling back to mock server for testing...")
		startMockServer()
		return
	}
	defer db.Close()
	log.Println("✅ Database connected")

	// Initialize database schema
	if err := database.InitializeDatabase(db); err != nil {
		log.Printf("❌ Database initialization failed: %v", err)
		log.Println("⚠️  Falling back to mock server...")
		startMockServer()
		return
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "dev-secret-key-change-in-production"
	}

	// Encryption setup
	encryptionKey := os.Getenv("ENCRYPTION_KEY")
	if encryptionKey == "" {
		encryptionKey = "dev-encryption-key-change-in-production"
		log.Println("⚠️  ENCRYPTION_KEY not set. Using default key.")
	}
	encryptor, err := encryption.NewEncryptor(encryptionKey)
	if err != nil {
		log.Printf("❌ Failed to initialize encryptor: %v", err)
		startMockServer()
		return
	}
	log.Println("✅ Encryption initialized")

	// Audit logging setup
	auditLogger := audit.NewAuditLogger(db)
	log.Println("✅ Audit logging initialized")

	// Paystack setup
	paystackSecretKey := os.Getenv("PAYSTACK_SECRET_KEY")
	if paystackSecretKey == "" {
		log.Println("⚠️  PAYSTACK_SECRET_KEY not set. Billing features will use mock data.")
	} else {
		log.Println("✅ Paystack configured")
	}

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

	// Security headers middleware
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("X-Content-Type-Options", "nosniff")
		c.Writer.Header().Set("X-Frame-Options", "DENY")
		c.Writer.Header().Set("X-XSS-Protection", "1; mode=block")
		c.Writer.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		c.Next()
	})

	// Audit logging middleware
	router.Use(func(c *gin.Context) {
		userID := 0
		if user, exists := c.Get("user_id"); exists {
			userID = user.(int)
		}
		
		// Log after request completes
		c.Next()
		
		if c.Request.Method != "GET" && c.Request.Method != "OPTIONS" {
			go func() {
				auditLogger.Log(
					userID,
					c.Request.Method,
					c.Request.URL.Path,
					"",
					c.ClientIP(),
				)
			}()
		}
	})

	// Health
	router.GET("/health", func(c *gin.Context) {
		status := "ok"
		if db != nil {
			if err := db.Ping(); err != nil {
				status = "degraded"
			}
		}
		c.JSON(http.StatusOK, gin.H{"status": status})
	})

	// Auth
	auth := router.Group("/api/auth")
	{
		auth.POST("/register", registerHandler(db, jwtSecret))
		auth.POST("/login", loginHandler(db, jwtSecret))
		auth.GET("/me", authMiddleware(jwtSecret), meHandler(db))
	}

	// API
	api := router.Group("/api")
	api.Use(authMiddleware(jwtSecret))
	{
		// Proxy endpoints
		api.GET("/proxy/status", proxyStatusHandler(db))
		api.POST("/proxy/connect", proxyConnectHandler(db))
		api.POST("/proxy/disconnect", proxyDisconnectHandler(db))

		// Usage endpoints
		api.GET("/usage/stats", usageStatsHandler(db))
		api.GET("/usage/monthly", usageMonthlyHandler(db))

		// Billing endpoints
		api.GET("/billing/plans", billingPlansHandler())
		api.POST("/billing/subscribe", billingSubscribeHandler(db))
		api.GET("/billing/verify", billingVerifyPaymentHandler(db))
		api.GET("/billing/invoices", billingInvoicesHandler(db))
		api.POST("/billing/payment-methods", billingPaymentMethodsHandler(db))
		api.GET("/billing/payment-methods", billingGetPaymentMethodsHandler(db))

		// Notifications endpoints
		api.GET("/notifications/settings", notificationsSettingsHandler(db))
		api.POST("/notifications/settings", notificationsUpdateHandler(db))
		api.POST("/notifications/test-email", notificationsTestEmailHandler())

		// Analytics endpoints
		api.GET("/analytics/usage-trends", analyticsUsageTrendsHandler(db))
		api.GET("/analytics/cost-analysis", analyticsCostAnalysisHandler(db))
		api.POST("/analytics/export", analyticsExportHandler(db))

		// Account endpoints
		api.GET("/account/security", accountSecurityHandler(db))
		api.POST("/account/password", accountPasswordHandler(db))
		api.POST("/account/2fa/enable", account2FAHandler())
		api.POST("/account/delete", accountDeleteHandler(db))

		// Referral endpoints
		api.GET("/referrals/code", referralsCodeHandler(db))
		api.GET("/referrals/history", referralsHistoryHandler(db))
		api.POST("/referrals/claim-payout", referralsPayoutHandler(db))
	}

	// Paystack webhook endpoint (no auth required)
	router.POST("/api/webhooks/paystack", func(c *gin.Context) {
		body, err := io.ReadAll(c.Request.Body)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		signature := c.GetHeader("X-Paystack-Signature")

		if paystackSecretKey == "" {
			log.Println("⚠️  PAYSTACK_SECRET_KEY not set. Webhook verification skipped.")
			c.JSON(http.StatusOK, gin.H{"received": true})
			return
		}

		// TODO: Verify webhook signature and process event
		log.Printf("📨 Paystack webhook received")
		c.JSON(http.StatusOK, gin.H{"received": true})
	})

	// Setup TLS if certificates exist
	tlsConfig := config.GetTLSConfig()
	certFile := os.Getenv("TLS_CERT_FILE")
	keyFile := os.Getenv("TLS_KEY_FILE")
	
	if certFile != "" && keyFile != "" {
		cert, err := config.LoadCertificates(certFile, keyFile)
		if err != nil {
			log.Printf("⚠️  TLS certificates not found, running without HTTPS: %v", err)
		} else {
			tlsConfig.Certificates = []tls.Certificate{cert}
			log.Println("✅ TLS configured")
		}
	} else {
		log.Println("⚠️  TLS_CERT_FILE and TLS_KEY_FILE not set. Running without HTTPS.")
	}

	// Create HTTP server with TLS config
	server := &http.Server{
		Addr:      ":5000",
		Handler:   router,
		TLSConfig: tlsConfig,
	}

	log.Println("🚀 Server starting on port :5000")
	if certFile != "" && keyFile != "" {
		server.ListenAndServeTLS(certFile, keyFile)
	} else {
		server.ListenAndServe()
	}
}
