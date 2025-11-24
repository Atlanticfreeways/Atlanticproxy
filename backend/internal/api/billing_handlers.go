package api

import (
	"atlanticproxy/backend/internal/stripe"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

// CreateSubscriptionHandler creates a new subscription
func CreateSubscriptionHandler(db *sqlx.DB, stripeService *stripe.StripeService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("user_id")

		var req struct {
			PlanID            string `json:"plan_id" binding:"required"`
			PaymentMethodID   string `json:"payment_method_id" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Create subscription
		subID, err := stripeService.CreateSubscription(userID, req.PlanID, req.PaymentMethodID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"subscription_id": subID,
			"status":          "active",
			"plan":            req.PlanID,
		})
	}
}

// GetSubscriptionHandler gets the current subscription
func GetSubscriptionHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("user_id")

		var sub struct {
			ID                 int    `db:"id" json:"id"`
			StripeSubID        string `db:"stripe_subscription_id" json:"stripe_subscription_id"`
			PlanID             string `db:"plan_id" json:"plan_id"`
			Status             string `db:"status" json:"status"`
			CancelAtPeriodEnd  bool   `db:"cancel_at_period_end" json:"cancel_at_period_end"`
		}

		err := db.Get(&sub, `
			SELECT id, stripe_subscription_id, plan_id, status, cancel_at_period_end
			FROM subscriptions
			WHERE user_id = $1
			ORDER BY created_at DESC
			LIMIT 1
		`, userID)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No subscription found"})
			return
		}

		c.JSON(http.StatusOK, sub)
	}
}

// CancelSubscriptionHandler cancels a subscription
func CancelSubscriptionHandler(db *sqlx.DB, stripeService *stripe.StripeService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("user_id")

		// Get subscription
		var sub struct {
			StripeSubID string `db:"stripe_subscription_id"`
		}

		err := db.Get(&sub, `
			SELECT stripe_subscription_id
			FROM subscriptions
			WHERE user_id = $1
			ORDER BY created_at DESC
			LIMIT 1
		`, userID)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No subscription found"})
			return
		}

		// Cancel subscription
		err = stripeService.CancelSubscription(sub.StripeSubID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"status": "subscription canceled"})
	}
}

// GetInvoicesHandler gets all invoices for a user
func GetInvoicesHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("user_id")

		var invoices []map[string]interface{}

		err := db.Select(&invoices, `
			SELECT 
				id, stripe_invoice_id, amount_paid, amount_due, status,
				paid_at, due_date, pdf_url, created_at
			FROM invoices
			WHERE user_id = $1
			ORDER BY created_at DESC
		`, userID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, invoices)
	}
}

// AddPaymentMethodHandler adds a payment method
func AddPaymentMethodHandler(db *sqlx.DB, stripeService *stripe.StripeService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("user_id")

		var req struct {
			PaymentMethodID string `json:"payment_method_id" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := stripeService.AddPaymentMethod(userID, req.PaymentMethodID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"status": "payment method added"})
	}
}

// GetPaymentMethodsHandler gets all payment methods for a user
func GetPaymentMethodsHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("user_id")

		var methods []map[string]interface{}

		err := db.Select(&methods, `
			SELECT id, stripe_payment_method_id, type, last_four, brand, is_default, created_at
			FROM payment_methods
			WHERE user_id = $1
			ORDER BY is_default DESC, created_at DESC
		`, userID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, methods)
	}
}

// WebhookHandler handles Stripe webhooks
func WebhookHandler(db *sqlx.DB, stripeService *stripe.StripeService) gin.HandlerFunc {
	return func(c *gin.Context) {
		body, err := io.ReadAll(c.Request.Body)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		signature := c.GetHeader("Stripe-Signature")
		webhookSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")

		if webhookSecret == "" {
			log.Println("⚠️  STRIPE_WEBHOOK_SECRET not set")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Webhook secret not configured"})
			return
		}

		// Construct event
		event, err := stripe.ConstructEvent(body, signature, webhookSecret)
		if err != nil {
			log.Printf("❌ Failed to construct webhook event: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Handle event
		err = stripeService.HandleWebhookEvent(event)
		if err != nil {
			log.Printf("❌ Failed to handle webhook event: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"received": true})
	}
}
