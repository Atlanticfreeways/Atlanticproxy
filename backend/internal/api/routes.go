package api

import (
	"atlanticproxy/backend/internal/api/handlers"
	"atlanticproxy/backend/internal/middleware"
	"atlanticproxy/backend/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

// SetupRoutes configures all API routes
func SetupRoutes(router *gin.Engine, db *sqlx.DB) {
	// Initialize services
	billingService := services.NewBillingService(db)
	proxyService := services.NewProxyService(db)
	accountService := services.NewAccountService(db)
	notificationsService := services.NewNotificationsService(db)
	analyticsService := services.NewAnalyticsService(db)

	// Initialize handlers
	billingHandler := handlers.NewBillingHandler(billingService)
	proxyHandler := handlers.NewProxyHandler(proxyService)
	accountHandler := handlers.NewAccountHandler(accountService)
	notificationsHandler := handlers.NewNotificationsHandler(notificationsService)
	analyticsHandler := handlers.NewAnalyticsHandler(analyticsService)

	// Billing routes
	billing := router.Group("/api/billing")
	{
		billing.POST("/calculate-price", billingHandler.CalculatePrice)
		billing.POST("/checkout", middleware.AuthRequired(), billingHandler.Checkout)
		billing.GET("/payment-methods", middleware.AuthRequired(), billingHandler.GetPaymentMethods)
		billing.POST("/payment-methods", middleware.AuthRequired(), billingHandler.AddPaymentMethod)
		billing.DELETE("/payment-methods/:id", middleware.AuthRequired(), billingHandler.DeletePaymentMethod)
		billing.PUT("/payment-methods/:id/default", middleware.AuthRequired(), billingHandler.SetDefaultPaymentMethod)
		billing.GET("/invoices", middleware.AuthRequired(), billingHandler.GetInvoices)
		billing.GET("/invoices/:id/download", middleware.AuthRequired(), billingHandler.DownloadInvoice)
		billing.GET("/cost-analysis", middleware.AuthRequired(), billingHandler.GetCostAnalysis)
	}

	// Proxy routes
	proxy := router.Group("/api/proxy")
	{
		proxy.GET("/locations", proxyHandler.GetLocations)
		proxy.POST("/configuration", middleware.AuthRequired(), proxyHandler.SaveConfiguration)
		proxy.GET("/configuration", middleware.AuthRequired(), proxyHandler.GetConfiguration)
		proxy.PUT("/session-settings", middleware.AuthRequired(), proxyHandler.UpdateSessionSettings)
		proxy.PUT("/custom-headers", middleware.AuthRequired(), proxyHandler.UpdateCustomHeaders)
		proxy.PUT("/throttling-settings", middleware.AuthRequired(), proxyHandler.UpdateThrottlingSettings)
		proxy.PUT("/authentication", middleware.AuthRequired(), proxyHandler.UpdateProxyAuthentication)
	}

	// Account routes
	account := router.Group("/api/account")
	{
		account.GET("/security", middleware.AuthRequired(), accountHandler.GetSecurityInfo)
		account.GET("/sessions", middleware.AuthRequired(), accountHandler.GetActiveSessions)
		account.DELETE("/sessions/:id", middleware.AuthRequired(), accountHandler.LogoutDevice)
		account.POST("/sessions/logout-all", middleware.AuthRequired(), accountHandler.LogoutAllDevices)
		account.DELETE("/delete", middleware.AuthRequired(), accountHandler.DeleteAccount)
		account.POST("/change-password", middleware.AuthRequired(), accountHandler.ChangePassword)
	}

	// Notifications routes
	notifications := router.Group("/api/notifications")
	{
		notifications.GET("/settings", middleware.AuthRequired(), notificationsHandler.GetSettings)
		notifications.PUT("/settings", middleware.AuthRequired(), notificationsHandler.UpdateSettings)
		notifications.PUT("/email-settings", middleware.AuthRequired(), notificationsHandler.UpdateEmailSettings)
		notifications.PUT("/push-settings", middleware.AuthRequired(), notificationsHandler.UpdatePushSettings)
	}

	// Analytics routes
	analytics := router.Group("/api/analytics")
	{
		analytics.POST("/export", middleware.AuthRequired(), analyticsHandler.ExportData)
		analytics.GET("/usage-trends", middleware.AuthRequired(), analyticsHandler.GetUsageTrends)
		analytics.GET("/connection-metrics", middleware.AuthRequired(), analyticsHandler.GetConnectionMetrics)
	}
}
