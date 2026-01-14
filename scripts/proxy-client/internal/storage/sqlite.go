package storage

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"time"

	_ "modernc.org/sqlite"

	"github.com/atlanticproxy/proxy-client/internal/billing"
)

// Store implements the storage.Store interface using SQLite.
// It manages persistence for users, subscriptions, usage tracking, and ad-block rules.
type Store struct {
	db *sql.DB
}

// NewStore creates a new SQLite store at the default location.
// It automatically initializes the database schema if it doesn't exist.
func NewStore() (*Store, error) {
	// Use a standard path for the database
	home, err := os.UserHomeDir()
	if err != nil {
		return nil, err
	}

	dbDir := filepath.Join(home, ".atlanticproxy")
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		return nil, err
	}

	dbPath := filepath.Join(dbDir, "atlantic.db")
	return NewStoreWithPath(dbPath)
}

func NewStoreWithPath(dbPath string) (*Store, error) {
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, err
	}

	s := &Store{db: db}
	if err := s.Init(); err != nil {
		db.Close()
		return nil, err
	}

	return s, nil
}

func (s *Store) Init() error {
	// Optimization pragmas
	pragmas := []string{
		"PRAGMA foreign_keys = ON",
		"PRAGMA journal_mode = WAL",
		"PRAGMA synchronous = NORMAL",
		"PRAGMA busy_timeout = 5000",
		"PRAGMA cache_size = -2000", // ~2MB cache
	}
	for _, p := range pragmas {
		if _, err := s.db.Exec(p); err != nil {
			return fmt.Errorf("failed to set pragma %s: %w", p, err)
		}
	}

	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS plans (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			price_cents INTEGER NOT NULL,
			currency TEXT DEFAULT 'USD',
			data_quota_mb INTEGER NOT NULL,
			request_limit INTEGER NOT NULL,
			concurrent_conns INTEGER NOT NULL,
			features TEXT
		)`,
		`CREATE TABLE IF NOT EXISTS subscriptions (
			id TEXT PRIMARY KEY,
			user_id TEXT REFERENCES users(id),
			plan_id TEXT REFERENCES plans(id),
			status TEXT NOT NULL,
			stripe_sub_id TEXT,
			start_date DATETIME NOT NULL,
			end_date DATETIME NOT NULL,
			auto_renew BOOLEAN DEFAULT TRUE,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS usage_tracking (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id TEXT REFERENCES users(id),
			period_start DATETIME NOT NULL,
			period_end DATETIME NOT NULL,
			data_transferred_bytes INTEGER DEFAULT 0,
			requests_made INTEGER DEFAULT 0,
			ads_blocked INTEGER DEFAULT 0,
			threats_blocked INTEGER DEFAULT 0,
			UNIQUE(user_id, period_start, period_end)
		)`,
		`CREATE TABLE IF NOT EXISTS sessions (
			id TEXT PRIMARY KEY,
			user_id TEXT REFERENCES users(id),
			token TEXT UNIQUE NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			expires_at DATETIME NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS payment_transactions (
			id TEXT PRIMARY KEY,
			user_id TEXT REFERENCES users(id),
			plan_id TEXT NOT NULL,
			amount REAL NOT NULL,
			currency TEXT NOT NULL,
			status TEXT NOT NULL,
			payment_method TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS adblock_whitelist (
			domain TEXT PRIMARY KEY
		)`,
		`CREATE TABLE IF NOT EXISTS adblock_custom (
			domain TEXT PRIMARY KEY
		)`,
		// Seed default plans if not exist
		`INSERT OR IGNORE INTO plans (id, name, price_cents, data_quota_mb, request_limit, concurrent_conns, features) VALUES 
		('starter', 'Starter', 900, 500, 1000, 5, '["Basic Support", "Shared Pool"]'),
		('personal', 'Personal', 2900, 5000, 10000, 20, '["Priority Support", "Residential IPs"]'),
		('team', 'Team', 9900, 50000, 100000, 50, '["Team Dashboard", "API Access"]'),
		('enterprise', 'Enterprise', 29900, -1, -1, 500, '["Dedicated Account Manager", "Custom Solutions"]')`,
	}

	for _, q := range queries {
		if _, err := s.db.Exec(q); err != nil {
			return fmt.Errorf("failed to execute query: %s, error: %w", q, err)
		}
	}

	// Performance Indexes
	indexes := []string{
		`CREATE INDEX IF NOT EXISTS idx_subs_user_created ON subscriptions(user_id, created_at DESC)`,
		`CREATE INDEX IF NOT EXISTS idx_usage_user_period ON usage_tracking(user_id, period_start, period_end)`,
		`CREATE INDEX IF NOT EXISTS idx_tx_user_created ON payment_transactions(user_id, created_at DESC)`,
	}

	for _, idx := range indexes {
		if _, err := s.db.Exec(idx); err != nil {
			return fmt.Errorf("failed to create index: %s, error: %w", idx, err)
		}
	}

	return nil
}

func (s *Store) Close() error {
	return s.db.Close()
}

// --- Whitelist ---

func (s *Store) GetWhitelist() ([]string, error) {
	rows, err := s.db.Query("SELECT domain FROM adblock_whitelist")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var domains []string
	for rows.Next() {
		var d string
		if err := rows.Scan(&d); err != nil {
			return nil, err
		}
		domains = append(domains, d)
	}
	return domains, nil
}

func (s *Store) AddToWhitelist(domain string) error {
	_, err := s.db.Exec("INSERT OR IGNORE INTO adblock_whitelist (domain) VALUES (?)", domain)
	return err
}

func (s *Store) RemoveFromWhitelist(domain string) error {
	_, err := s.db.Exec("DELETE FROM adblock_whitelist WHERE domain = ?", domain)
	return err
}

// --- Custom Rules ---

func (s *Store) GetCustomRules() ([]string, error) {
	rows, err := s.db.Query("SELECT domain FROM adblock_custom")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var domains []string
	for rows.Next() {
		var d string
		if err := rows.Scan(&d); err != nil {
			return nil, err
		}
		domains = append(domains, d)
	}
	return domains, nil
}

func (s *Store) SetCustomRules(rules []string) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.Exec("DELETE FROM adblock_custom"); err != nil {
		return err
	}

	for _, r := range rules {
		if _, err := tx.Exec("INSERT INTO adblock_custom (domain) VALUES (?)", r); err != nil {
			return err
		}
	}

	return tx.Commit()
}

// --- Usage ---

func (s *Store) UpdateUsage(userID string, dataTransferred, requests, ads, threats int64) error {
	_, err := s.db.Exec(`
		INSERT INTO usage_tracking (user_id, period_start, period_end, data_transferred_bytes, requests_made, ads_blocked, threats_blocked)
		VALUES (?, datetime('now','start of month'), datetime('now','start of month','+1 month','-1 second'), ?, ?, ?, ?)
		ON CONFLICT(user_id, period_start, period_end) DO UPDATE SET
			data_transferred_bytes = data_transferred_bytes + excluded.data_transferred_bytes,
			requests_made = requests_made + excluded.requests_made,
			ads_blocked = ads_blocked + excluded.ads_blocked,
			threats_blocked = threats_blocked + excluded.threats_blocked
	`, userID, dataTransferred, requests, ads, threats)
	return err
}

func (s *Store) GetLatestUsage(userID string) (int64, int64, int64, int64, error) {
	var data, reqs, ads, threats int64
	err := s.db.QueryRow(`
		SELECT data_transferred_bytes, requests_made, ads_blocked, threats_blocked 
		FROM usage_tracking 
		WHERE user_id = ? AND period_start <= datetime('now') AND period_end >= datetime('now')
	`, userID).Scan(&data, &reqs, &ads, &threats)

	if err == sql.ErrNoRows {
		return 0, 0, 0, 0, nil
	}
	return data, reqs, ads, threats, err
}

// --- Subscriptions ---

func (s *Store) GetSubscription(userID string) (*billing.PersistedSubscription, error) {
	var sub billing.PersistedSubscription
	err := s.db.QueryRow(`
		SELECT id, plan_id, status, start_date, end_date, auto_renew 
		FROM subscriptions 
		WHERE user_id = ? 
		ORDER BY created_at DESC LIMIT 1
	`, userID).Scan(&sub.ID, &sub.PlanID, &sub.Status, &sub.StartDate, &sub.EndDate, &sub.AutoRenew)

	if err == sql.ErrNoRows {
		return nil, nil // No subscription found
	}
	return &sub, err
}

func (s *Store) SetSubscription(userID, id, planID, status, start, end string, autoRenew bool) error {
	// Upsert or simple insert? For MVP, we might just track the active one.
	// Let's insert a new record or update existing if ID matches?
	// The Manager generates a NEW ID every subscribe call, so we insert.
	// But we should invalidate old active ones?

	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Ensure user exists (skipped, assume generic user existence check handled elsewhere or FK will fail)

	// Mark others as canceled? Or just insert.
	// Let's just insert.

	_, err = tx.Exec(`
		INSERT INTO subscriptions (id, user_id, plan_id, status, start_date, end_date, auto_renew)
		VALUES (?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET
			plan_id=excluded.plan_id,
			status=excluded.status,
			start_date=excluded.start_date,
			end_date=excluded.end_date,
			auto_renew=excluded.auto_renew
	`, id, userID, planID, status, start, end, autoRenew)

	if err != nil {
		return err
	}
	return tx.Commit()
}

// --- Auth: Users ---

type User struct {
	ID           string
	Email        string
	PasswordHash string
	CreatedAt    time.Time
}

func (s *Store) CreateUser(id, email, passwordHash string) error {
	_, err := s.db.Exec(`
		INSERT INTO users (id, email, password_hash)
		VALUES (?, ?, ?)
	`, id, email, passwordHash)
	return err
}

func (s *Store) GetUserByEmail(email string) (*User, error) {
	var u User
	err := s.db.QueryRow(`
		SELECT id, email, password_hash, created_at
		FROM users WHERE email = ?
	`, email).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.CreatedAt)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (s *Store) GetUserByID(id string) (*User, error) {
	var u User
	err := s.db.QueryRow(`
		SELECT id, email, password_hash, created_at
		FROM users WHERE id = ?
	`, id).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.CreatedAt)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// --- Auth: Sessions ---

type Session struct {
	ID        string
	UserID    string
	Token     string
	CreatedAt time.Time
	ExpiresAt time.Time
}

func (s *Store) CreateSession(id, userID, token string, expiresAt time.Time) error {
	_, err := s.db.Exec(`
		INSERT INTO sessions (id, user_id, token, expires_at)
		VALUES (?, ?, ?, ?)
	`, id, userID, token, expiresAt)
	return err
}

func (s *Store) GetSession(token string) (*Session, error) {
	var sess Session
	err := s.db.QueryRow(`
		SELECT id, user_id, token, created_at, expires_at
		FROM sessions WHERE token = ?
	`, token).Scan(&sess.ID, &sess.UserID, &sess.Token, &sess.CreatedAt, &sess.ExpiresAt)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("session not found")
	}
	if err != nil {
		return nil, err
	}
	return &sess, nil
}

func (s *Store) DeleteSession(token string) error {
	_, err := s.db.Exec("DELETE FROM sessions WHERE token = ?", token)
	return err
}

// --- Transactions ---

type Transaction struct {
	ID            string
	UserID        string
	PlanID        string
	Amount        float64
	Currency      string
	Status        string
	PaymentMethod string
	CreatedAt     time.Time
}

func (s *Store) CreateTransaction(tx *Transaction) error {
	_, err := s.db.Exec(`
		INSERT INTO payment_transactions (id, user_id, plan_id, amount, currency, status, payment_method, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, tx.ID, tx.UserID, tx.PlanID, tx.Amount, tx.Currency, tx.Status, tx.PaymentMethod, tx.CreatedAt.Format(time.RFC3339))
	return err
}

func (s *Store) GetTransaction(id string) (*Transaction, error) {
	var tx Transaction
	var createdAt string

	err := s.db.QueryRow(`
		SELECT id, user_id, plan_id, amount, currency, status, payment_method, created_at
		FROM payment_transactions
		WHERE id = ?
	`, id).Scan(&tx.ID, &tx.UserID, &tx.PlanID, &tx.Amount, &tx.Currency, &tx.Status, &tx.PaymentMethod, &createdAt)

	if err != nil {
		return nil, err
	}

	tx.CreatedAt, _ = time.Parse(time.RFC3339, createdAt)
	return &tx, nil
}
