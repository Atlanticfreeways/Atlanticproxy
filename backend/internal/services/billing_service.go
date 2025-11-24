package services

import (
	"fmt"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
)

// BillingService handles billing and subscription management
type BillingService struct {
	db *sqlx.DB
}

// Subscription represents a user subscription
type Subscription struct {
	ID                int       `db:"id" json:"id"`
	UserID            int       `db:"user_id" json:"user_id"`
	PlanID            string    `db:"plan_id" json:"plan_id"`
	Status            string    `db:"status" json:"status"`
	PaystackReference string    `db:"paystack_reference" json:"paystack_reference"`
	Amount            float64   `db:"amount" json:"amount"`
	StartDate         time.Time `db:"start_date" json:"start_date"`
	EndDate           *time.Time `db:"end_date" json:"end_date"`
	CreatedAt         time.Time `db:"created_at" json:"created_at"`
	UpdatedAt         time.Time `db:"updated_at" json:"updated_at"`
}

// Invoice represents a billing invoice
type Invoice struct {
	ID                int       `db:"id" json:"id"`
	UserID            int       `db:"user_id" json:"user_id"`
	SubscriptionID    int       `db:"subscription_id" json:"subscription_id"`
	Amount            float64   `db:"amount" json:"amount"`
	Status            string    `db:"status" json:"status"`
	PaystackReference string    `db:"paystack_reference" json:"paystack_reference"`
	DueDate           time.Time `db:"due_date" json:"due_date"`
	PaidDate          *time.Time `db:"paid_date" json:"paid_date"`
	CreatedAt         time.Time `db:"created_at" json:"created_at"`
}

// BillingPlan represents a billing plan
type BillingPlan struct {
	ID          string  `db:"id" json:"id"`
	Name        string  `db:"name" json:"name"`
	Price       float64 `db:"price" json:"price"`
	Bandwidth   int64   `db:"bandwidth" json:"bandwidth"`
	Connections int     `db:"connections" json:"connections"`
	Features    string  `db:"features" json:"features"`
	Active      bool    `db:"active" json:"active"`
}

// NewBillingService creates a new billing service
func NewBillingService(db *sqlx.DB) *BillingService {
	return &BillingService{db: db}
}

// GetPlans returns all active billing plans
func (bs *BillingService) GetPlans() ([]BillingPlan, error) {
	log.Println("📋 Fetching billing plans")

	var plans []BillingPlan
	err := bs.db.Select(&plans,
		`SELECT id, name, price, bandwidth, connections, features, active
		 FROM billing_plans
		 WHERE active = true
		 ORDER BY price ASC`,
	)

	if err != nil {
		log.Printf("❌ Failed to get plans: %v", err)
		return nil, fmt.Errorf("failed to get plans: %w", err)
	}

	log.Printf("✅ Retrieved %d plans", len(plans))
	return plans, nil
}

// CreateSubscription creates a new subscription
func (bs *BillingService) CreateSubscription(userID int, planID string, paystackReference string, amount float64) (*Subscription, error) {
	log.Printf("💳 Creating subscription for user %d, plan %s", userID, planID)

	var sub Subscription
	err := bs.db.QueryRowx(
		`INSERT INTO billing_transactions (user_id, plan_id, amount, status, reference, created_at)
		 VALUES ($1, $2, $3, 'active', $4, NOW())
		 RETURNING id, user_id, plan_id, 'active' as status, $4 as paystack_reference, $3 as amount, NOW() as start_date, NULL as end_date, NOW() as created_at, NOW() as updated_at`,
		userID, planID, amount, paystackReference,
	).StructScan(&sub)

	if err != nil {
		log.Printf("❌ Failed to create subscription: %v", err)
		return nil, fmt.Errorf("failed to create subscription: %w", err)
	}

	// Update user subscription tier
	_, err = bs.db.Exec(
		`UPDATE users SET subscription_tier = $1, updated_at = NOW() WHERE id = $2`,
		planID, userID,
	)

	if err != nil {
		log.Printf("⚠️  Failed to update user tier: %v", err)
	}

	log.Printf("✅ Subscription created: %d", sub.ID)
	return &sub, nil
}

// GetSubscription returns the current subscription for a user
func (bs *BillingService) GetSubscription(userID int) (*Subscription, error) {
	log.Printf("🔍 Getting subscription for user %d", userID)

	var sub Subscription
	err := bs.db.Get(&sub,
		`SELECT id, user_id, plan_id, status, paystack_reference, amount, start_date, end_date, created_at, updated_at
		 FROM billing_transactions
		 WHERE user_id = $1 AND status = 'active'
		 ORDER BY created_at DESC
		 LIMIT 1`,
		userID,
	)

	if err != nil {
		log.Printf("⚠️  No active subscription for user %d", userID)
		return nil, fmt.Errorf("no active subscription found")
	}

	return &sub, nil
}

// CancelSubscription cancels a subscription
func (bs *BillingService) CancelSubscription(userID int) error {
	log.Printf("❌ Cancelling subscription for user %d", userID)

	result, err := bs.db.Exec(
		`UPDATE billing_transactions
		 SET status = 'cancelled', end_date = NOW(), updated_at = NOW()
		 WHERE user_id = $1 AND status = 'active'`,
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to cancel subscription: %v", err)
		return fmt.Errorf("failed to cancel subscription: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		log.Printf("⚠️  No active subscription found for user %d", userID)
		return fmt.Errorf("no active subscription found")
	}

	// Update user subscription tier to free
	_, err = bs.db.Exec(
		`UPDATE users SET subscription_tier = 'free', updated_at = NOW() WHERE id = $1`,
		userID,
	)

	if err != nil {
		log.Printf("⚠️  Failed to update user tier: %v", err)
	}

	log.Printf("✅ Subscription cancelled for user %d", userID)
	return nil
}

// CreateInvoice creates a new invoice
func (bs *BillingService) CreateInvoice(userID int, subscriptionID int, amount float64, paystackReference string) (*Invoice, error) {
	log.Printf("📄 Creating invoice for user %d", userID)

	var invoice Invoice
	err := bs.db.QueryRowx(
		`INSERT INTO billing_transactions (user_id, subscription_id, amount, status, reference, due_date, created_at)
		 VALUES ($1, $2, $3, 'pending', $4, NOW() + INTERVAL '30 days', NOW())
		 RETURNING id, user_id, subscription_id, amount, status, reference, due_date, NULL as paid_date, created_at`,
		userID, subscriptionID, amount, paystackReference,
	).StructScan(&invoice)

	if err != nil {
		log.Printf("❌ Failed to create invoice: %v", err)
		return nil, fmt.Errorf("failed to create invoice: %w", err)
	}

	log.Printf("✅ Invoice created: %d", invoice.ID)
	return &invoice, nil
}

// GetInvoices returns all invoices for a user
func (bs *BillingService) GetInvoices(userID int) ([]Invoice, error) {
	log.Printf("📋 Getting invoices for user %d", userID)

	var invoices []Invoice
	err := bs.db.Select(&invoices,
		`SELECT id, user_id, subscription_id, amount, status, paystack_reference, due_date, paid_date, created_at
		 FROM billing_transactions
		 WHERE user_id = $1 AND status IN ('pending', 'paid', 'overdue')
		 ORDER BY created_at DESC`,
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to get invoices: %v", err)
		return nil, fmt.Errorf("failed to get invoices: %w", err)
	}

	log.Printf("✅ Retrieved %d invoices", len(invoices))
	return invoices, nil
}

// MarkInvoicePaid marks an invoice as paid
func (bs *BillingService) MarkInvoicePaid(invoiceID int, paystackReference string) error {
	log.Printf("✅ Marking invoice %d as paid", invoiceID)

	result, err := bs.db.Exec(
		`UPDATE billing_transactions
		 SET status = 'paid', paid_date = NOW(), reference = $1
		 WHERE id = $2`,
		paystackReference, invoiceID,
	)

	if err != nil {
		log.Printf("❌ Failed to mark invoice as paid: %v", err)
		return fmt.Errorf("failed to mark invoice as paid: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		log.Printf("⚠️  Invoice %d not found", invoiceID)
		return fmt.Errorf("invoice not found")
	}

	log.Printf("✅ Invoice %d marked as paid", invoiceID)
	return nil
}

// GetBillingHistory returns billing history for a user
func (bs *BillingService) GetBillingHistory(userID int) (map[string]interface{}, error) {
	log.Printf("📊 Getting billing history for user %d", userID)

	// Get total spent
	var totalSpent float64
	err := bs.db.Get(&totalSpent,
		`SELECT COALESCE(SUM(amount), 0) FROM billing_transactions WHERE user_id = $1 AND status = 'paid'`,
		userID,
	)

	if err != nil {
		log.Printf("⚠️  Failed to get total spent: %v", err)
		totalSpent = 0
	}

	// Get current subscription
	sub, err := bs.GetSubscription(userID)
	if err != nil {
		log.Printf("⚠️  No active subscription: %v", err)
	}

	// Get invoices
	invoices, err := bs.GetInvoices(userID)
	if err != nil {
		log.Printf("⚠️  Failed to get invoices: %v", err)
		invoices = []Invoice{}
	}

	return map[string]interface{}{
		"total_spent":        totalSpent,
		"current_subscription": sub,
		"invoices":           invoices,
	}, nil
}

// GetPaymentMethods returns payment methods for a user
func (bs *BillingService) GetPaymentMethods(userID int) ([]map[string]interface{}, error) {
	log.Printf("💳 Getting payment methods for user %d", userID)

	var methods []map[string]interface{}
	rows, err := bs.db.Queryx(
		`SELECT id, user_id, method_type, last_four, is_default, created_at
		 FROM payment_methods
		 WHERE user_id = $1
		 ORDER BY is_default DESC, created_at DESC`,
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to get payment methods: %v", err)
		return nil, fmt.Errorf("failed to get payment methods: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var method map[string]interface{}
		err := rows.MapScan(method)
		if err != nil {
			log.Printf("❌ Failed to scan method: %v", err)
			continue
		}
		methods = append(methods, method)
	}

	log.Printf("✅ Retrieved %d payment methods", len(methods))
	return methods, nil
}

// AddPaymentMethod adds a new payment method
func (bs *BillingService) AddPaymentMethod(userID int, methodType string, lastFour string) error {
	log.Printf("➕ Adding payment method for user %d", userID)

	_, err := bs.db.Exec(
		`INSERT INTO payment_methods (user_id, method_type, last_four, is_default, created_at)
		 VALUES ($1, $2, $3, false, NOW())`,
		userID, methodType, lastFour,
	)

	if err != nil {
		log.Printf("❌ Failed to add payment method: %v", err)
		return fmt.Errorf("failed to add payment method: %w", err)
	}

	log.Printf("✅ Payment method added for user %d", userID)
	return nil
}
