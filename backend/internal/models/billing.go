package models

import "time"

// PaymentMethod represents a payment method
type PaymentMethod struct {
	ID         string    `db:"id" json:"id"`
	UserID     string    `db:"user_id" json:"userId"`
	Type       string    `db:"type" json:"type"` // card, paypal, crypto
	Name       string    `db:"name" json:"name"`
	LastFour   string    `db:"last_four" json:"lastFour"`
	ExpiryDate string    `db:"expiry_date" json:"expiryDate"`
	IsDefault  bool      `db:"is_default" json:"isDefault"`
	CreatedAt  time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt  time.Time `db:"updated_at" json:"updatedAt"`
}

// Invoice represents an invoice
type Invoice struct {
	ID          string    `db:"id" json:"id"`
	UserID      string    `db:"user_id" json:"userId"`
	Amount      float64   `db:"amount" json:"amount"`
	Status      string    `db:"status" json:"status"` // paid, pending, failed
	Description string    `db:"description" json:"description"`
	Date        time.Time `db:"date" json:"date"`
	DownloadURL string    `db:"download_url" json:"downloadUrl"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt"`
}

// Order represents a purchase order
type Order struct {
	ID              string    `db:"id" json:"id"`
	UserID          string    `db:"user_id" json:"userId"`
	PlanID          string    `db:"plan_id" json:"planId"`
	Protocol        string    `db:"protocol" json:"protocol"`
	ISPTier         string    `db:"isp_tier" json:"ispTier"`
	BillingCycle    string    `db:"billing_cycle" json:"billingCycle"`
	Amount          float64   `db:"amount" json:"amount"`
	Status          string    `db:"status" json:"status"` // pending, completed, failed
	PaymentMethodID string    `db:"payment_method_id" json:"paymentMethodId"`
	CreatedAt       time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt       time.Time `db:"updated_at" json:"updatedAt"`
}

// Customization represents a plan customization
type Customization struct {
	ID           string    `db:"id" json:"id"`
	UserID       string    `db:"user_id" json:"userId"`
	PlanID       string    `db:"plan_id" json:"planId"`
	Protocol     string    `db:"protocol" json:"protocol"`
	ISPTier      string    `db:"isp_tier" json:"ispTier"`
	BillingCycle string    `db:"billing_cycle" json:"billingCycle"`
	FinalPrice   float64   `db:"final_price" json:"finalPrice"`
	CreatedAt    time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt    time.Time `db:"updated_at" json:"updatedAt"`
}

// CostAnalysis represents cost analysis data
type CostAnalysis struct {
	TotalCost float64 `json:"totalCost"`
	AvgCost   float64 `json:"avgCost"`
	MaxCost   float64 `json:"maxCost"`
	Data      []struct {
		Date      string  `json:"date"`
		Cost      float64 `json:"cost"`
		Bandwidth int     `json:"bandwidth"`
	} `json:"data"`
}
