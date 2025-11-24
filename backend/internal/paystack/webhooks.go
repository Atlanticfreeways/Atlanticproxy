package paystack

import (
	"crypto/hmac"
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"log"

	"github.com/jmoiron/sqlx"
)

// WebhookEvent represents a Paystack webhook event
type WebhookEvent struct {
	Event string      `json:"event"`
	Data  interface{} `json:"data"`
}

// HandleWebhook handles Paystack webhook events
func (s *PaystackService) HandleWebhook(body []byte, signature string) error {
	// Verify signature
	hash := hmac.New(sha512.New, []byte(s.secretKey))
	hash.Write(body)
	expectedSignature := hex.EncodeToString(hash.Sum(nil))

	if signature != expectedSignature {
		log.Printf("❌ Invalid webhook signature")
		return nil // Don't error, just log
	}

	var event WebhookEvent
	err := json.Unmarshal(body, &event)
	if err != nil {
		log.Printf("❌ Failed to unmarshal webhook: %v", err)
		return err
	}

	log.Printf("📨 Webhook received: %s", event.Event)

	// Handle specific events
	switch event.Event {
	case "charge.success":
		return s.handleChargeSuccess(event.Data)
	case "charge.failed":
		return s.handleChargeFailed(event.Data)
	case "subscription.create":
		return s.handleSubscriptionCreate(event.Data)
	case "subscription.disable":
		return s.handleSubscriptionDisable(event.Data)
	default:
		log.Printf("⚠️  Unhandled webhook event: %s", event.Event)
		return nil
	}
}

func (s *PaystackService) handleChargeSuccess(data interface{}) error {
	log.Printf("✅ Charge successful")
	// TODO: Update database with successful payment
	return nil
}

func (s *PaystackService) handleChargeFailed(data interface{}) error {
	log.Printf("❌ Charge failed")
	// TODO: Update database with failed payment
	return nil
}

func (s *PaystackService) handleSubscriptionCreate(data interface{}) error {
	log.Printf("✅ Subscription created")
	// TODO: Update database with new subscription
	return nil
}

func (s *PaystackService) handleSubscriptionDisable(data interface{}) error {
	log.Printf("✅ Subscription disabled")
	// TODO: Update database with disabled subscription
	return nil
}

// VerifyWebhookSignature verifies the Paystack webhook signature
func (s *PaystackService) VerifyWebhookSignature(body []byte, signature string) bool {
	hash := hmac.New(sha512.New, []byte(s.secretKey))
	hash.Write(body)
	expectedSignature := hex.EncodeToString(hash.Sum(nil))
	return signature == expectedSignature
}
