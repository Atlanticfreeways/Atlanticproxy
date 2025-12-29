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
	ID              PlanType
	Name            string
	PriceMonthly    float64
	PriceAnnual     float64
	DataLimitMB     int64 // -1 for unlimited
	RequestLimit    int64 // -1 for unlimited
	ConcurrentConns int
	Features        []string
}

// Subscription represents a user's active subscription
type Subscription struct {
	ID        string
	PlanID    PlanType
	Status    string // active, canceled, past_due
	StartDate time.Time
	EndDate   time.Time
	AutoRenew bool
}

// AvailablePlans returns the hardcoded list of plans
func AvailablePlans() []Plan {
	return []Plan{
		{
			ID:              PlanStarter,
			Name:            "Starter",
			PriceMonthly:    0,
			PriceAnnual:     0,
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
}

// GetPlan returns a plan by ID
func GetPlan(id PlanType) (Plan, error) {
	for _, p := range AvailablePlans() {
		if p.ID == id {
			return p, nil
		}
	}
	return Plan{}, errors.New("plan not found")
}
