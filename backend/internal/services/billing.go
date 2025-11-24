package services

import (
	"errors"
	"fmt"
	"time"

	"atlanticproxy/backend/internal/models"
	"github.com/jmoiron/sqlx"
)

type BillingService struct {
	db *sqlx.DB
}

func NewBillingService(db *sqlx.DB) *BillingService {
	return &BillingService{db: db}
}

// Pricing constants
var (
	basePrices = map[string]float64{
		"starter":    9.99,
		"pro":        29.99,
		"enterprise": 99.99,
	}

	protocolAdjustments = map[string]float64{
		"http":   0,
		"https":  1.00,
		"socks5": 2.00,
	}

	tierAdjustments = map[string]float64{
		"budget":   -3.00,
		"standard": 0,
		"premium":  5.00,
	}
)

// CalculatePrice calculates final price based on customization
func (s *BillingService) CalculatePrice(planID, protocol, ispTier, billingCycle string) (float64, map[string]float64, error) {
	basePrice, ok := basePrices[planID]
	if !ok {
		return 0, nil, errors.New("invalid plan ID")
	}

	protocolAdj, ok := protocolAdjustments[protocol]
	if !ok {
		return 0, nil, errors.New("invalid protocol")
	}

	tierAdj, ok := tierAdjustments[ispTier]
	if !ok {
		return 0, nil, errors.New("invalid ISP tier")
	}

	monthlyPrice := basePrice + protocolAdj + tierAdj
	var finalPrice float64
	var billingDiscount float64

	if billingCycle == "annual" {
		billingDiscount = monthlyPrice * 12 * 0.17 // 17% discount
		finalPrice = monthlyPrice * 12 * 0.83
	} else {
		finalPrice = monthlyPrice
	}

	breakdown := map[string]float64{
		"basePrice":           basePrice,
		"protocolAdjustment":  protocolAdj,
		"ispTierAdjustment":   tierAdj,
		"billingDiscount":     billingDiscount,
	}

	return finalPrice, breakdown, nil
}

// ProcessCheckout processes a subscription purchase
func (s *BillingService) ProcessCheckout(userID, planID, protocol, ispTier, billingCycle, paymentMethodID string) (*models.Order, error) {
	// Calculate price
	price, _, err := s.CalculatePrice(planID, protocol, ispTier, billingCycle)
	if err != nil {
		return nil, err
	}

	// Create order
	order := &models.Order{
		ID:              fmt.Sprintf("ord_%d", time.Now().Unix()),
		UserID:          userID,
		PlanID:          planID,
		Protocol:        protocol,
		ISPTier:         ispTier,
		BillingCycle:    billingCycle,
		Amount:          price,
		Status:          "pending",
		PaymentMethodID: paymentMethodID,
	}

	// Save to database
	query := `
		INSERT INTO orders (id, user_id, plan_id, protocol, isp_tier, billing_cycle, amount, status, payment_method_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err = s.db.Exec(query, order.ID, order.UserID, order.PlanID, order.Protocol, order.ISPTier, order.BillingCycle, order.Amount, order.Status, order.PaymentMethodID)
	if err != nil {
		return nil, err
	}

	return order, nil
}

// GetPaymentMethods retrieves user's payment methods
func (s *BillingService) GetPaymentMethods(userID string) ([]*models.PaymentMethod, error) {
	var methods []*models.PaymentMethod
	query := `SELECT id, user_id, type, name, last_four, expiry_date, is_default, created_at, updated_at FROM payment_methods WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`
	err := s.db.Select(&methods, query, userID)
	if err != nil {
		return nil, err
	}
	return methods, nil
}

// AddPaymentMethod adds a new payment method
func (s *BillingService) AddPaymentMethod(userID string, method *models.PaymentMethod) (*models.PaymentMethod, error) {
	method.ID = fmt.Sprintf("pm_%d", time.Now().Unix())
	method.UserID = userID
	method.CreatedAt = time.Now()
	method.UpdatedAt = time.Now()

	query := `
		INSERT INTO payment_methods (id, user_id, type, name, last_four, expiry_date, is_default, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := s.db.Exec(query, method.ID, method.UserID, method.Type, method.Name, method.LastFour, method.ExpiryDate, method.IsDefault, method.CreatedAt, method.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return method, nil
}

// DeletePaymentMethod deletes a payment method
func (s *BillingService) DeletePaymentMethod(userID, methodID string) error {
	query := `DELETE FROM payment_methods WHERE id = $1 AND user_id = $2`
	result, err := s.db.Exec(query, methodID, userID)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return errors.New("payment method not found")
	}

	return nil
}

// SetDefaultPaymentMethod sets a payment method as default
func (s *BillingService) SetDefaultPaymentMethod(userID, methodID string) error {
	tx, err := s.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Set all to false
	_, err = tx.Exec(`UPDATE payment_methods SET is_default = false WHERE user_id = $1`, userID)
	if err != nil {
		return err
	}

	// Set this one to true
	result, err := tx.Exec(`UPDATE payment_methods SET is_default = true WHERE id = $1 AND user_id = $2`, methodID, userID)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return errors.New("payment method not found")
	}

	return tx.Commit().Error
}

// GetInvoices retrieves user's invoices
func (s *BillingService) GetInvoices(userID, status string, limit int) ([]*models.Invoice, error) {
	var invoices []*models.Invoice
	query := `SELECT id, user_id, amount, status, description, date, download_url, created_at, updated_at FROM invoices WHERE user_id = $1`

	if status != "" {
		query += ` AND status = $2`
	}

	query += ` ORDER BY date DESC LIMIT $3`

	var err error
	if status != "" {
		err = s.db.Select(&invoices, query, userID, status, limit)
	} else {
		err = s.db.Select(&invoices, query, userID, limit)
	}

	if err != nil {
		return nil, err
	}

	return invoices, nil
}

// GenerateInvoicePDF generates a PDF invoice
func (s *BillingService) GenerateInvoicePDF(userID, invoiceID string) ([]byte, error) {
	// TODO: Implement PDF generation using a library like gofpdf
	return nil, errors.New("PDF generation not yet implemented")
}

// GetCostAnalysis retrieves cost analysis data
func (s *BillingService) GetCostAnalysis(userID, period string) (*models.CostAnalysis, error) {
	var startDate time.Time
	now := time.Now()

	switch period {
	case "week":
		startDate = now.AddDate(0, 0, -7)
	case "month":
		startDate = now.AddDate(0, -1, 0)
	case "year":
		startDate = now.AddDate(-1, 0, 0)
	default:
		return nil, errors.New("invalid period")
	}

	query := `
		SELECT 
			COALESCE(SUM(amount), 0) as total_cost,
			COALESCE(AVG(amount), 0) as avg_cost,
			COALESCE(MAX(amount), 0) as max_cost
		FROM invoices
		WHERE user_id = $1 AND date >= $2 AND status = 'paid'
	`

	var totalCost, avgCost, maxCost float64
	err := s.db.QueryRow(query, userID, startDate).Scan(&totalCost, &avgCost, &maxCost)
	if err != nil {
		return nil, err
	}

	analysis := &models.CostAnalysis{
		TotalCost: totalCost,
		AvgCost:   avgCost,
		MaxCost:   maxCost,
	}

	return analysis, nil
}
