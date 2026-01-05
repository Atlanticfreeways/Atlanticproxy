package billing

import (
	"errors"
	"time"
)

// PlanType represents the tier of the subscription
type PlanType string

const (
	PlanStarter    PlanType = "starter"
	PlanPersonal   PlanType = "personal"
	PlanTeam       PlanType = "team"
	PlanEnterprise PlanType = "enterprise"
)

// Plan defines the limits and features of a subscription tier
type Plan struct {
	ID              PlanType `json:"id"`
	Name            string   `json:"name"`
	PriceMonthly    float64  `json:"price_monthly"`
	PriceAnnual     float64  `json:"price_annual"`
	DataLimitMB     int64    `json:"data_limit_mb"` // -1 for unlimited
	RequestLimit    int64    `json:"request_limit"` // -1 for unlimited
	ConcurrentConns int      `json:"concurrent_conns"`
	Features        []string `json:"features"`
	// Localized Pricing Fields
	DisplayPriceMonthly float64 `json:"display_price_monthly"`
	DisplayPriceAnnual  float64 `json:"display_price_annual"`
	Currency            string  `json:"currency"`
	Symbol              string  `json:"symbol"`
}

// Subscription represents a user's active subscription
type Subscription struct {
	ID        string    `json:"id"`
	PlanID    PlanType  `json:"plan_id"`
	Status    string    `json:"status"` // active, canceled, past_due
	StartDate time.Time `json:"start_date"`
	EndDate   time.Time `json:"end_date"`
	AutoRenew bool      `json:"auto_renew"`
}

// AvailablePlans returns the hardcoded list of plans (Default USD)
func AvailablePlans() []Plan {
	return AvailablePlansInCurrency(CurrencyUSD)
}

// AvailablePlansInCurrency returns plans with prices converted to the target currency
func AvailablePlansInCurrency(code CurrencyCode) []Plan {
	symbol := GetCurrencySymbol(code)
	plans := []Plan{
		{
			ID:              PlanStarter,
			Name:            "Starter",
			PriceMonthly:    9,  // Base USD
			PriceAnnual:     90, // Base USD
			DataLimitMB:     500,
			RequestLimit:    1000,
			ConcurrentConns: 5,
			Features:        []string{"Basic Rotation", "US Only", "Shared Pool"},
		},
		{
			ID:              PlanPersonal,
			Name:            "Personal",
			PriceMonthly:    29,
			PriceAnnual:     290,
			DataLimitMB:     10 * 1024,
			RequestLimit:    -1,
			ConcurrentConns: 20,
			Features:        []string{"Advanced Rotation", "50+ Countries", "Sticky Sessions"},
		},
		{
			ID:              PlanTeam,
			Name:            "Team",
			PriceMonthly:    99,
			PriceAnnual:     990,
			DataLimitMB:     50 * 1024,
			RequestLimit:    -1,
			ConcurrentConns: 100,
			Features:        []string{"All Countries", "Priority Support", "API Access", "Team Management"},
		},
		{
			ID:              PlanEnterprise,
			Name:            "Enterprise",
			PriceMonthly:    499,
			PriceAnnual:     4990,
			DataLimitMB:     -1,
			RequestLimit:    -1,
			ConcurrentConns: 1000,
			Features:        []string{"Dedicated Pool", "Account Manager", "SLA", "Custom Integrations"},
		},
	}

	// Apply conversion
	for i := range plans {
		plans[i].Currency = string(code)
		plans[i].Symbol = symbol
		plans[i].DisplayPriceMonthly = ConvertPrice(plans[i].PriceMonthly, code)
		plans[i].DisplayPriceAnnual = ConvertPrice(plans[i].PriceAnnual, code)
	}

	return plans
}

// GetPlan returns a plan by ID (Default USD)
func GetPlan(id PlanType) (Plan, error) {
	for _, p := range AvailablePlans() {
		if p.ID == id {
			return p, nil
		}
	}
	return Plan{}, errors.New("plan not found")
}
