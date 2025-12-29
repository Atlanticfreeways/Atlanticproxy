package storage

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"

	"github.com/atlanticproxy/proxy-client/internal/billing"
)

type Store struct {
	db *sql.DB
}

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
	queries := []string{
		`CREATE TABLE IF NOT EXISTS usage (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			period_start DATETIME,
			period_end DATETIME,
			data_transferred INTEGER DEFAULT 0,
			requests_made INTEGER DEFAULT 0,
			ads_blocked INTEGER DEFAULT 0,
			threats_blocked INTEGER DEFAULT 0,
			UNIQUE(period_start, period_end)
		)`,
		`CREATE TABLE IF NOT EXISTS subscriptions (
			id TEXT PRIMARY KEY,
			plan_id TEXT,
			status TEXT,
			start_date DATETIME,
			end_date DATETIME,
			auto_renew BOOLEAN
		)`,
		`CREATE TABLE IF NOT EXISTS adblock_whitelist (
			domain TEXT PRIMARY KEY
		)`,
		`CREATE TABLE IF NOT EXISTS adblock_custom (
			domain TEXT PRIMARY KEY
		)`,
		`CREATE TABLE IF NOT EXISTS config (
			key TEXT PRIMARY KEY,
			value TEXT
		)`,
	}

	for _, q := range queries {
		if _, err := s.db.Exec(q); err != nil {
			return fmt.Errorf("failed to execute query %s: %w", q, err)
		}
	}

	return nil
}

func (s *Store) Close() error {
	return s.db.Close()
}

// AdBlock Whitelist
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

// Custom Rules
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

	_, err = tx.Exec("DELETE FROM adblock_custom")
	if err != nil {
		return err
	}

	for _, r := range rules {
		_, err = tx.Exec("INSERT INTO adblock_custom (domain) VALUES (?)", r)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// Usage Stats
func (s *Store) UpdateUsage(dataTransferred, requests, ads, threats int64) error {
	// Simple implementation: update the latest record or create new one for current month
	_, err := s.db.Exec(`
		INSERT INTO usage (period_start, period_end, data_transferred, requests_made, ads_blocked, threats_blocked)
		VALUES (datetime('now','start of month'), datetime('now','start of month','+1 month','-1 second'), ?, ?, ?, ?)
		ON CONFLICT(period_start, period_end) DO UPDATE SET
			data_transferred = data_transferred + excluded.data_transferred,
			requests_made = requests_made + excluded.requests_made,
			ads_blocked = ads_blocked + excluded.ads_blocked,
			threats_blocked = threats_blocked + excluded.threats_blocked
	`, dataTransferred, requests, ads, threats)
	return err
}

func (s *Store) GetLatestUsage() (int64, int64, int64, int64, error) {
	var data, reqs, ads, threats int64
	err := s.db.QueryRow(`
		SELECT data_transferred, requests_made, ads_blocked, threats_blocked 
		FROM usage 
		WHERE period_start <= datetime('now') AND period_end >= datetime('now')
	`).Scan(&data, &reqs, &ads, &threats)
	if err == sql.ErrNoRows {
		return 0, 0, 0, 0, nil
	}
	return data, reqs, ads, threats, err
}

// Subscriptions
func (s *Store) GetSubscription() (*billing.PersistedSubscription, error) {
	var sub billing.PersistedSubscription
	err := s.db.QueryRow(`
		SELECT id, plan_id, status, start_date, end_date, auto_renew FROM subscriptions LIMIT 1
	`).Scan(&sub.ID, &sub.PlanID, &sub.Status, &sub.StartDate, &sub.EndDate, &sub.AutoRenew)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &sub, err
}

func (s *Store) SetSubscription(id, planID, status, start, end string, autoRenew bool) error {
	_, err := s.db.Exec("DELETE FROM subscriptions")
	if err != nil {
		return err
	}
	_, err = s.db.Exec(`
		INSERT INTO subscriptions (id, plan_id, status, start_date, end_date, auto_renew)
		VALUES (?, ?, ?, ?, ?, ?)
	`, id, planID, status, start, end, autoRenew)
	return err
}
