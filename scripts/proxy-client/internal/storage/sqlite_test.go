package storage

import (
	"path/filepath"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestNewStore(t *testing.T) {
	tmpDir := t.TempDir()
	dbPath := filepath.Join(tmpDir, "test.db")

	store, err := NewStoreWithPath(dbPath)
	if err != nil {
		t.Fatalf("Failed to create store: %v", err)
	}
	defer store.Close()

	// Verify tables exist
	tables := []string{"users", "plans", "subscriptions", "usage_tracking", "adblock_whitelist", "adblock_custom"}
	for _, table := range tables {
		rows, err := store.db.Query("SELECT name FROM sqlite_master WHERE type='table' AND name=?", table)
		if err != nil {
			t.Errorf("Failed to query tables: %v", err)
		}
		if !rows.Next() {
			t.Errorf("Table %s does not exist", table)
		}
		rows.Close()
	}

	// Verify default plans seeded
	rows, err := store.db.Query("SELECT id FROM plans")
	if err != nil {
		t.Fatalf("Failed to seed plans: %v", err)
	}
	count := 0
	for rows.Next() {
		count++
	}
	rows.Close()

	if count != 4 {
		t.Errorf("Expected 4 default plans, got %d", count)
	}
}

func TestWhitelist(t *testing.T) {
	tmpDir := t.TempDir()
	dbPath := filepath.Join(tmpDir, "test_whitelist.db")

	store, err := NewStoreWithPath(dbPath)
	if err != nil {
		t.Fatalf("Failed to create store: %v", err)
	}
	defer store.Close()

	domain := "example.com"
	if err := store.AddToWhitelist(domain); err != nil {
		t.Errorf("Failed to add to whitelist: %v", err)
	}

	domains, err := store.GetWhitelist()
	if err != nil {
		t.Errorf("Failed to get whitelist: %v", err)
	}

	if len(domains) != 1 || domains[0] != domain {
		t.Errorf("Expected whitelist to contain %s, got %v", domain, domains)
	}

	if err := store.RemoveFromWhitelist(domain); err != nil {
		t.Errorf("Failed to remove from whitelist: %v", err)
	}

	domains, err = store.GetWhitelist()
	if err != nil {
		t.Errorf("Failed to get whitelist after removal: %v", err)
	}
	if len(domains) != 0 {
		t.Errorf("Expected empty whitelist, got %v", domains)
	}
}

func TestCustomRules(t *testing.T) {
	tmpDir := t.TempDir()
	dbPath := filepath.Join(tmpDir, "test_rules.db")

	store, err := NewStoreWithPath(dbPath)
	if err != nil {
		t.Fatalf("Failed to create store: %v", err)
	}
	defer store.Close()

	rules := []string{"example.com", "ads.example.com"}
	if err := store.SetCustomRules(rules); err != nil {
		t.Errorf("Failed to set custom rules: %v", err)
	}

	fetchedRules, err := store.GetCustomRules()
	if err != nil {
		t.Errorf("Failed to get custom rules: %v", err)
	}

	if len(fetchedRules) != 2 {
		t.Errorf("Expected 2 rules, got %d", len(fetchedRules))
	}
}

func TestSubscriptionCRUD(t *testing.T) {
	tmpDir := t.TempDir()
	dbPath := filepath.Join(tmpDir, "test_subs.db")

	store, err := NewStoreWithPath(dbPath)
	if err != nil {
		t.Fatalf("Failed to create store: %v", err)
	}
	defer store.Close()

	// Initial check - should be nil
	sub, err := store.GetSubscription("default")
	if err != nil {
		t.Errorf("GetSubscription failed: %v", err)
	}
	if sub != nil {
		t.Errorf("Expected nil subscription, got %v", sub)
	}

	// Create user for FK constraint
	if err := store.CreateUser("default", "test@example.com", "hash"); err != nil {
		t.Fatalf("Failed to create user: %v", err)
	}

	// Create subscription
	id := uuid.New().String()
	planID := "starter"
	now := time.Now().UTC().Format(time.RFC3339)
	end := time.Now().AddDate(0, 1, 0).UTC().Format(time.RFC3339)

	err = store.SetSubscription("default", id, planID, "active", now, end, true)
	if err != nil {
		t.Fatalf("Failed to set subscription: %v", err)
	}

	// Fetch back
	sub, err = store.GetSubscription("default")
	if err != nil {
		t.Errorf("Failed to get subscription: %v", err)
	}
	if sub == nil {
		t.Fatalf("Expected subscription, got nil")
	}

	if sub.ID != id {
		t.Errorf("Expected ID %s, got %s", id, sub.ID)
	}
	if sub.PlanID != planID {
		t.Errorf("Expected PlanID %s, got %s", planID, sub.PlanID)
	}
}

func TestUsageTracking(t *testing.T) {
	tmpDir := t.TempDir()
	dbPath := filepath.Join(tmpDir, "test_usage.db")

	store, err := NewStoreWithPath(dbPath)
	if err != nil {
		t.Fatalf("Failed to create store: %v", err)
	}
	defer store.Close()

	// Create user for FK constraint
	userID := "user123"
	if err := store.CreateUser(userID, "test@example.com", "hash"); err != nil {
		t.Fatalf("Failed to create user: %v", err)
	}

	// Update usage
	err = store.UpdateUsage(userID, 1000, 10, 5, 1)
	if err != nil {
		t.Fatalf("Failed to update usage: %v", err)
	}

	data, reqs, ads, threats, err := store.GetLatestUsage(userID)
	if err != nil {
		t.Fatalf("Failed to get usage: %v", err)
	}

	if data != 1000 || reqs != 10 || ads != 5 || threats != 1 {
		t.Errorf("Usage mismatch: got %d, %d, %d, %d", data, reqs, ads, threats)
	}

	// Accumulate usage
	err = store.UpdateUsage(userID, 500, 5, 1, 0)
	if err != nil {
		t.Fatalf("Failed to accumulate usage: %v", err)
	}

	data, reqs, ads, threats, err = store.GetLatestUsage(userID)
	if err != nil {
		t.Fatalf("Failed to get accumulated usage: %v", err)
	}

	if data != 1500 || reqs != 15 || ads != 6 || threats != 1 {
		t.Errorf("Accumulated usage mismatch: got %d, %d, %d, %d", data, reqs, ads, threats)
	}
}

func TestUserAndSession(t *testing.T) {
	tmpDir := t.TempDir()
	dbPath := filepath.Join(tmpDir, "test_auth.db")

	store, err := NewStoreWithPath(dbPath)
	if err != nil {
		t.Fatalf("Failed to create store: %v", err)
	}
	defer store.Close()

	// 1. Create User
	userID := uuid.New().String()
	email := "test@example.com"
	hash := "hashed_password"

	err = store.CreateUser(userID, email, hash)
	if err != nil {
		t.Fatalf("Failed to create user: %v", err)
	}

	// 2. Get User
	u, err := store.GetUserByEmail(email)
	if err != nil {
		t.Fatalf("Failed to get user by email: %v", err)
	}
	if u.ID != userID {
		t.Errorf("Expected user ID %s, got %s", userID, u.ID)
	}
	if u.PasswordHash != hash {
		t.Errorf("Expected hash %s, got %s", hash, u.PasswordHash)
	}

	u2, err := store.GetUserByID(userID)
	if err != nil {
		t.Fatalf("Failed to get user by ID: %v", err)
	}
	if u2.Email != email {
		t.Errorf("Expected email %s, got %s", email, u2.Email)
	}

	// 3. Create Session
	sessionID := uuid.New().String()
	token := "session_token_123"
	expires := time.Now().Add(24 * time.Hour).UTC()

	// SQLite stores time with less precision usually, or different format.
	// But Scan typically handles it if driver supports it.
	// modernc/sqlite driver + built-in DATETIME

	err = store.CreateSession(sessionID, userID, token, expires)
	if err != nil {
		t.Fatalf("Failed to create session: %v", err)
	}

	// 4. Get Session
	sess, err := store.GetSession(token)
	if err != nil {
		t.Fatalf("Failed to get session: %v", err)
	}
	if sess.UserID != userID {
		t.Errorf("Expected session user ID %s, got %s", userID, sess.UserID)
	}
	if sess.Token != token {
		t.Errorf("Expected token %s, got %s", token, sess.Token)
	}

	// Verify expiration time (allow 1s delta for DB roundtrip/truncation)
	if sess.ExpiresAt.Sub(expires).Abs() > time.Second {
		t.Errorf("Expiration time mismatch: expected %v, got %v", expires, sess.ExpiresAt)
	}

	// 5. Delete Session
	err = store.DeleteSession(token)
	if err != nil {
		t.Fatalf("Failed to delete session: %v", err)
	}

	sess, err = store.GetSession(token)
	if err == nil {
		t.Errorf("Expected error getting deleted session, got nil")
	}
	if sess != nil {
		t.Errorf("Expected session to be nil after deletion, got %v", sess)
	}
}
