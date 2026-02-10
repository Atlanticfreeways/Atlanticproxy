package billing

import (
	"errors"
	"time"
)

type Plan string

const (
	PlanStarter    Plan = "starter"
	PlanPAYG       Plan = "payg"
	PlanPersonal   Plan = "personal"
	PlanTeam       Plan = "team"
	PlanEnterprise Plan = "enterprise"
)

type User struct {
	ID           string
	Email        string
	Plan         Plan
	DataUsed     int64 // bytes
	DataLimit    int64 // bytes
	CreditsUsed  float64
	CreditsLimit float64
	SubscriptionStatus string
	SubscriptionEnd    time.Time
}

// CanUseProtocol checks if user's plan allows the protocol
func CanUseProtocol(user *User, protocol string) error {
	if user.Plan == PlanStarter && protocol != "https" {
		return errors.New("upgrade to PAYG or higher for HTTP, SOCKS5, and Shadowsocks protocols")
	}
	return nil
}

// CanAccessAPI checks if user can access API features
func CanAccessAPI(user *User) error {
	if user.Plan == PlanStarter || user.Plan == PlanPAYG {
		return errors.New("upgrade to Personal plan or higher for API access")
	}
	return nil
}

// CanSelectProtocol checks if user can change protocol via UI
func CanSelectProtocol(user *User) error {
	if user.Plan == PlanStarter || user.Plan == PlanPAYG {
		return errors.New("upgrade to Personal plan or higher for protocol selection")
	}
	return nil
}

// CheckDataQuota verifies user hasn't exceeded data limit
func CheckDataQuota(user *User) error {
	if user.DataLimit > 0 && user.DataUsed >= user.DataLimit {
		return errors.New("data limit reached - upgrade your plan or wait for quota reset")
	}
	return nil
}

// CheckCredits verifies PAYG user has credits
func CheckCredits(user *User) error {
	if user.Plan == PlanPAYG && user.CreditsUsed >= user.CreditsLimit {
		return errors.New("insufficient credits - please purchase more credits")
	}
	return nil
}

// CheckSubscriptionActive verifies subscription is active
func CheckSubscriptionActive(user *User) error {
	if user.SubscriptionStatus != "active" {
		return errors.New("subscription inactive - please renew your subscription")
	}
	
	if time.Now().After(user.SubscriptionEnd) {
		return errors.New("subscription expired - please renew your subscription")
	}
	
	return nil
}

// GetDataQuotaPercentage returns percentage of data used
func GetDataQuotaPercentage(user *User) float64 {
	if user.DataLimit == 0 {
		return 0
	}
	return float64(user.DataUsed) / float64(user.DataLimit) * 100
}

// ShouldWarnQuota checks if user should receive quota warning
func ShouldWarnQuota(user *User) (bool, string) {
	percentage := GetDataQuotaPercentage(user)
	
	if percentage >= 100 {
		return true, "Data limit reached"
	} else if percentage >= 80 {
		return true, "80% of data quota used"
	}
	
	return false, ""
}
