package api

import (
	"crypto/hmac"
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/atlanticproxy/proxy-client/internal/billing"
	"github.com/atlanticproxy/proxy-client/internal/storage"
	"github.com/gin-gonic/gin"
)

// handleStripeWebhook processes incoming webhook events from Stripe
// handlePaystackWebhook processes incoming webhook events from Paystack
func (s *Server) handlePaystackWebhook(c *gin.Context) {
	const MaxBodyBytes = int64(65536)
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxBodyBytes)

	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		s.logger.Errorf("Error reading request body: %v", err)
		c.Status(http.StatusServiceUnavailable)
		return
	}

	// 1. Verify Signature
	secret := os.Getenv("PAYSTACK_SECRET_KEY")
	if secret == "" {
		s.logger.Warn("PAYSTACK_SECRET_KEY not set, skipping signature verification (DEV MODE)")
	} else {
		signature := c.GetHeader("X-Paystack-Signature")
		if signature == "" {
			s.logger.Error("Missing Paystack signature")
			c.Status(http.StatusUnauthorized)
			return
		}

		// Calculate HMAC-SHA512
		mac := hmac.New(sha512.New, []byte(secret))
		mac.Write(payload)
		expectedMAC := hex.EncodeToString(mac.Sum(nil))

		if !hmac.Equal([]byte(signature), []byte(expectedMAC)) {
			s.logger.Error("Invalid Paystack signature")
			c.Status(http.StatusUnauthorized)
			return
		}
	}

	// 2. Parse Event
	type PaystackEvent struct {
		Event string `json:"event"`
		Data  struct {
			Reference string `json:"reference"`
			Amount    int    `json:"amount"`
			Email     string `json:"email"`
			Metadata  struct {
				PlanID string `json:"plan_id"`
				UserID string `json:"user_id"`
			} `json:"metadata"`
		} `json:"data"`
	}

	var event PaystackEvent
	if err := json.Unmarshal(payload, &event); err != nil {
		s.logger.Errorf("Failed to parse webhook JSON: %v", err)
		c.Status(http.StatusBadRequest)
		return
	}

	s.logger.Infof("Received Paystack event: %s | Ref: %s", event.Event, event.Data.Reference)

	// 3. Handle 'charge.success'
	if event.Event == "charge.success" {
		userID := event.Data.Metadata.UserID
		planID := event.Data.Metadata.PlanID
		email := event.Data.Email

		// Fallback: If no metadata, try to find user by email
		if userID == "" && email != "" {
			user, err := s.store.GetUserByEmail(email)
			if err == nil {
				userID = user.ID
			}
		}

		if userID == "" {
			s.logger.Errorf("Could not identify user for payment: %s", email)
			c.Status(http.StatusOK) // Return 200 to acknowledge receipt even if logic fails
			return
		}

		if planID == "" {
			planID = "personal" // Default fallback
		}

		s.logger.Infof("Upgrading user %s to plan %s via Paystack", userID, planID)

		// Create subscription using BillingManager
		err := s.billingManager.SubscribeUser(userID, billing.PlanType(planID), event.Data.Reference)
		if err != nil {
			s.logger.Errorf("Failed to create subscription: %v", err)
			c.Status(http.StatusInternalServerError)
			return
		}

		// Create transaction record for invoice generation
		tx := &storage.Transaction{
			ID:            event.Data.Reference,
			UserID:        userID,
			PlanID:        planID,
			Amount:        float64(event.Data.Amount) / 100.0, // Paystack amounts are in kobo/cents
			Currency:      "NGN",                              // Paystack default
			Status:        "completed",
			PaymentMethod: "paystack",
			CreatedAt:     time.Now(),
		}

		if err := s.store.CreateTransaction(tx); err != nil {
			s.logger.Errorf("Failed to create transaction record: %v", err)
			// Don't fail the webhook - subscription is already created
		}

		s.logger.Info("Subscription and transaction created successfully!")
	}

	c.Status(http.StatusOK)
}
