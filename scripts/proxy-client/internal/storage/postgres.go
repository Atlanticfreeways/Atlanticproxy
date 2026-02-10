package storage

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
)

type PostgresStore struct {
	db *sql.DB
}

func NewPostgresStore(connStr string) (*PostgresStore, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &PostgresStore{db: db}, nil
}

func (s *PostgresStore) Close() error {
	return s.db.Close()
}

func (s *PostgresStore) CreateUser(id, email, passwordHash string) error {
	_, err := s.db.Exec(
		"INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)",
		id, email, passwordHash,
	)
	return err
}

func (s *PostgresStore) GetUserByEmail(email string) (*User, error) {
	var u User
	err := s.db.QueryRow(
		"SELECT id, email, password_hash, created_at FROM users WHERE email = $1",
		email,
	).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &u, err
}

func (s *PostgresStore) GetUserByID(id string) (*User, error) {
	var u User
	err := s.db.QueryRow(
		"SELECT id, email, password_hash, created_at FROM users WHERE id = $1",
		id,
	).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &u, err
}

func (s *PostgresStore) CreateSubscription(sub *Subscription) error {
	_, err := s.db.Exec(
		`INSERT INTO subscriptions (id, user_id, plan_id, status, stripe_sub_id, start_date, end_date, auto_renew)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		sub.ID, sub.UserID, sub.PlanID, sub.Status, sub.StripeSubID, sub.StartDate, sub.EndDate, sub.AutoRenew,
	)
	return err
}

func (s *PostgresStore) GetSubscriptionByUserID(userID string) (*Subscription, error) {
	var sub Subscription
	err := s.db.QueryRow(
		`SELECT id, user_id, plan_id, status, stripe_sub_id, start_date, end_date, auto_renew, created_at
		FROM subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
		userID,
	).Scan(&sub.ID, &sub.UserID, &sub.PlanID, &sub.Status, &sub.StripeSubID, &sub.StartDate, &sub.EndDate, &sub.AutoRenew, &sub.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &sub, err
}

func (s *PostgresStore) UpdateSubscriptionStatus(id, status string) error {
	_, err := s.db.Exec("UPDATE subscriptions SET status = $1 WHERE id = $2", status, id)
	return err
}

func (s *PostgresStore) CreateTransaction(tx *Transaction) error {
	_, err := s.db.Exec(
		`INSERT INTO payment_transactions (id, user_id, amount_cents, currency, status, gateway, gateway_ref_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		tx.ID, tx.UserID, tx.AmountCents, tx.Currency, tx.Status, tx.Gateway, tx.GatewayRefID,
	)
	return err
}

func (s *PostgresStore) GetPlanByID(id string) (*Plan, error) {
	var p Plan
	err := s.db.QueryRow(
		"SELECT id, name, price_cents, currency, data_quota_mb, request_limit, concurrent_conns FROM plans WHERE id = $1",
		id,
	).Scan(&p.ID, &p.Name, &p.PriceCents, &p.Currency, &p.DataQuotaMB, &p.RequestLimit, &p.ConcurrentConns)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &p, err
}

func (s *PostgresStore) TrackUsage(userID string, dataBytes int64) error {
	now := time.Now()
	periodStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	periodEnd := periodStart.AddDate(0, 1, 0).Add(-time.Second)

	_, err := s.db.Exec(
		`INSERT INTO usage_tracking (user_id, period_start, period_end, data_transferred_bytes, requests_made)
		VALUES ($1, $2, $3, $4, 1)
		ON CONFLICT (user_id, period_start, period_end)
		DO UPDATE SET data_transferred_bytes = usage_tracking.data_transferred_bytes + $4,
		requests_made = usage_tracking.requests_made + 1`,
		userID, periodStart, periodEnd, dataBytes,
	)
	return err
}

func (s *PostgresStore) GetUsage(userID string, periodStart, periodEnd time.Time) (*UsageStats, error) {
	var stats UsageStats
	err := s.db.QueryRow(
		`SELECT COALESCE(SUM(data_transferred_bytes), 0), COALESCE(SUM(requests_made), 0),
		COALESCE(SUM(ads_blocked), 0), COALESCE(SUM(threats_blocked), 0)
		FROM usage_tracking WHERE user_id = $1 AND period_start >= $2 AND period_end <= $3`,
		userID, periodStart, periodEnd,
	).Scan(&stats.DataTransferredBytes, &stats.RequestsMade, &stats.AdsBlocked, &stats.ThreatsBlocked)
	
	stats.PeriodStart = periodStart
	stats.PeriodEnd = periodEnd
	return &stats, err
}
