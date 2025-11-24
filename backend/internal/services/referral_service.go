package services

import (
	"crypto/rand"
	"fmt"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
)

// ReferralService handles referral management
type ReferralService struct {
	db *sqlx.DB
}

// ReferralCode represents a referral code
type ReferralCode struct {
	ID        int       `db:"id" json:"id"`
	UserID    int       `db:"user_id" json:"user_id"`
	Code      string    `db:"code" json:"code"`
	URL       string    `json:"url"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

// Referral represents a referral
type Referral struct {
	ID         int       `db:"id" json:"id"`
	ReferrerID int       `db:"referrer_id" json:"referrer_id"`
	ReferredID int       `db:"referred_id" json:"referred_id"`
	Status     string    `db:"status" json:"status"`
	Reward     float64   `db:"reward" json:"reward"`
	CreatedAt  time.Time `db:"created_at" json:"created_at"`
}

// ReferralStats represents referral statistics
type ReferralStats struct {
	TotalReferrals   int     `json:"total_referrals"`
	ActiveReferrals  int     `json:"active_referrals"`
	TotalEarnings    float64 `json:"total_earnings"`
	PendingEarnings  float64 `json:"pending_earnings"`
	AvailableForPayout float64 `json:"available_for_payout"`
}

// NewReferralService creates a new referral service
func NewReferralService(db *sqlx.DB) *ReferralService {
	return &ReferralService{db: db}
}

// GetOrCreateReferralCode gets or creates a referral code for a user
func (rs *ReferralService) GetOrCreateReferralCode(userID int) (*ReferralCode, error) {
	log.Printf("🔗 Getting referral code for user %d", userID)

	var code ReferralCode
	err := rs.db.Get(&code,
		`SELECT id, user_id, code, created_at FROM referrals_codes WHERE user_id = $1`,
		userID,
	)

	if err == nil {
		code.URL = fmt.Sprintf("https://atlanticproxy.com?ref=%s", code.Code)
		log.Printf("✅ Referral code found for user %d", userID)
		return &code, nil
	}

	// Generate new code
	newCode := generateReferralCode()

	err = rs.db.QueryRowx(
		`INSERT INTO referrals_codes (user_id, code, created_at)
		 VALUES ($1, $2, NOW())
		 RETURNING id, user_id, code, created_at`,
		userID, newCode,
	).StructScan(&code)

	if err != nil {
		log.Printf("❌ Failed to create referral code: %v", err)
		return nil, fmt.Errorf("failed to create referral code: %w", err)
	}

	code.URL = fmt.Sprintf("https://atlanticproxy.com?ref=%s", code.Code)
	log.Printf("✅ Referral code created for user %d: %s", userID, newCode)
	return &code, nil
}

// RecordReferral records a new referral
func (rs *ReferralService) RecordReferral(referrerID int, referredID int) (*Referral, error) {
	log.Printf("📝 Recording referral: %d -> %d", referrerID, referredID)

	var referral Referral
	err := rs.db.QueryRowx(
		`INSERT INTO referrals (referrer_id, referred_id, status, reward, created_at)
		 VALUES ($1, $2, 'pending', 0, NOW())
		 RETURNING id, referrer_id, referred_id, status, reward, created_at`,
		referrerID, referredID,
	).StructScan(&referral)

	if err != nil {
		log.Printf("❌ Failed to record referral: %v", err)
		return nil, fmt.Errorf("failed to record referral: %w", err)
	}

	log.Printf("✅ Referral recorded: %d", referral.ID)
	return &referral, nil
}

// GetReferralHistory returns referral history for a user
func (rs *ReferralService) GetReferralHistory(userID int) ([]Referral, error) {
	log.Printf("📋 Getting referral history for user %d", userID)

	var referrals []Referral
	err := rs.db.Select(&referrals,
		`SELECT id, referrer_id, referred_id, status, reward, created_at
		 FROM referrals
		 WHERE referrer_id = $1
		 ORDER BY created_at DESC`,
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to get referral history: %v", err)
		return nil, fmt.Errorf("failed to get referral history: %w", err)
	}

	log.Printf("✅ Retrieved %d referrals", len(referrals))
	return referrals, nil
}

// GetReferralStats returns referral statistics
func (rs *ReferralService) GetReferralStats(userID int) (*ReferralStats, error) {
	log.Printf("📊 Getting referral stats for user %d", userID)

	var stats ReferralStats

	// Get total referrals
	err := rs.db.Get(&stats.TotalReferrals,
		`SELECT COUNT(*) FROM referrals WHERE referrer_id = $1`,
		userID,
	)

	if err != nil {
		log.Printf("⚠️  Failed to get total referrals: %v", err)
		stats.TotalReferrals = 0
	}

	// Get active referrals
	err = rs.db.Get(&stats.ActiveReferrals,
		`SELECT COUNT(*) FROM referrals WHERE referrer_id = $1 AND status = 'active'`,
		userID,
	)

	if err != nil {
		log.Printf("⚠️  Failed to get active referrals: %v", err)
		stats.ActiveReferrals = 0
	}

	// Get total earnings
	err = rs.db.Get(&stats.TotalEarnings,
		`SELECT COALESCE(SUM(reward), 0) FROM referrals WHERE referrer_id = $1 AND status = 'paid'`,
		userID,
	)

	if err != nil {
		log.Printf("⚠️  Failed to get total earnings: %v", err)
		stats.TotalEarnings = 0
	}

	// Get pending earnings
	err = rs.db.Get(&stats.PendingEarnings,
		`SELECT COALESCE(SUM(reward), 0) FROM referrals WHERE referrer_id = $1 AND status = 'pending'`,
		userID,
	)

	if err != nil {
		log.Printf("⚠️  Failed to get pending earnings: %v", err)
		stats.PendingEarnings = 0
	}

	// Available for payout = pending + paid (not yet withdrawn)
	stats.AvailableForPayout = stats.PendingEarnings

	log.Printf("✅ Referral stats retrieved for user %d", userID)
	return &stats, nil
}

// ClaimPayout claims referral payout
func (rs *ReferralService) ClaimPayout(userID int) (float64, error) {
	log.Printf("💰 Claiming payout for user %d", userID)

	// Get available payout
	var payout float64
	err := rs.db.Get(&payout,
		`SELECT COALESCE(SUM(reward), 0) FROM referrals WHERE referrer_id = $1 AND status = 'pending'`,
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to get payout: %v", err)
		return 0, fmt.Errorf("failed to get payout: %w", err)
	}

	if payout == 0 {
		log.Printf("⚠️  No pending payout for user %d", userID)
		return 0, fmt.Errorf("no pending payout")
	}

	// Update referral status to paid
	_, err = rs.db.Exec(
		`UPDATE referrals SET status = 'paid' WHERE referrer_id = $1 AND status = 'pending'`,
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to update referral status: %v", err)
		return 0, fmt.Errorf("failed to update referral status: %w", err)
	}

	// Record payout transaction
	_, err = rs.db.Exec(
		`INSERT INTO payout_history (user_id, amount, status, created_at)
		 VALUES ($1, $2, 'completed', NOW())`,
		userID, payout,
	)

	if err != nil {
		log.Printf("⚠️  Failed to record payout: %v", err)
	}

	log.Printf("✅ Payout claimed for user %d: $%.2f", userID, payout)
	return payout, nil
}

// Helper functions

// generateReferralCode generates a random referral code
func generateReferralCode() string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	code := make([]byte, 8)
	for i := range code {
		idx, _ := rand.Int(rand.Reader, fmt.Errorf(""))
		code[i] = charset[idx.Int64()%int64(len(charset))]
	}
	return string(code)
}
