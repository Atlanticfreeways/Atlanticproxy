package services

import (
	"testing"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

// TestProxyService tests the proxy service
func TestProxyService(t *testing.T) {
	// Setup test database
	db := setupTestDB(t)
	defer db.Close()

	service := NewProxyService(db)

	// Test Connect
	t.Run("Connect", func(t *testing.T) {
		conn, err := service.Connect(1)
		if err != nil {
			t.Fatalf("Connect failed: %v", err)
		}
		if conn == nil {
			t.Fatal("Connection is nil")
		}
		if conn.Status != "active" {
			t.Fatalf("Expected status 'active', got '%s'", conn.Status)
		}
	})

	// Test GetStatus
	t.Run("GetStatus", func(t *testing.T) {
		conn, err := service.GetStatus(1)
		if err != nil {
			t.Fatalf("GetStatus failed: %v", err)
		}
		if conn == nil {
			t.Fatal("Connection is nil")
		}
	})

	// Test Disconnect
	t.Run("Disconnect", func(t *testing.T) {
		err := service.Disconnect(1)
		if err != nil {
			t.Fatalf("Disconnect failed: %v", err)
		}
	})

	// Test RecordUsage
	t.Run("RecordUsage", func(t *testing.T) {
		err := service.RecordUsage(1, 1000, 2000, 10)
		if err != nil {
			t.Fatalf("RecordUsage failed: %v", err)
		}
	})

	// Test GetUsageStats
	t.Run("GetUsageStats", func(t *testing.T) {
		stats, err := service.GetUsageStats(1)
		if err != nil {
			t.Fatalf("GetUsageStats failed: %v", err)
		}
		if stats == nil {
			t.Fatal("Stats is nil")
		}
	})
}

// TestBillingService tests the billing service
func TestBillingService(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	service := NewBillingService(db)

	// Test GetPlans
	t.Run("GetPlans", func(t *testing.T) {
		plans, err := service.GetPlans()
		if err != nil {
			t.Fatalf("GetPlans failed: %v", err)
		}
		if len(plans) == 0 {
			t.Fatal("No plans returned")
		}
	})

	// Test CreateSubscription
	t.Run("CreateSubscription", func(t *testing.T) {
		sub, err := service.CreateSubscription(1, "pro", "ref123", 9.99)
		if err != nil {
			t.Fatalf("CreateSubscription failed: %v", err)
		}
		if sub == nil {
			t.Fatal("Subscription is nil")
		}
		if sub.Status != "active" {
			t.Fatalf("Expected status 'active', got '%s'", sub.Status)
		}
	})

	// Test GetSubscription
	t.Run("GetSubscription", func(t *testing.T) {
		sub, err := service.GetSubscription(1)
		if err != nil {
			t.Fatalf("GetSubscription failed: %v", err)
		}
		if sub == nil {
			t.Fatal("Subscription is nil")
		}
	})

	// Test CancelSubscription
	t.Run("CancelSubscription", func(t *testing.T) {
		err := service.CancelSubscription(1)
		if err != nil {
			t.Fatalf("CancelSubscription failed: %v", err)
		}
	})
}

// TestAccountService tests the account service
func TestAccountService(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	service := NewAccountService(db)

	// Test GetAccount
	t.Run("GetAccount", func(t *testing.T) {
		account, err := service.GetAccount(1)
		if err != nil {
			t.Fatalf("GetAccount failed: %v", err)
		}
		if account == nil {
			t.Fatal("Account is nil")
		}
	})

	// Test ChangePassword
	t.Run("ChangePassword", func(t *testing.T) {
		// This would need a real user with a password set
		// Skipping for now
	})

	// Test Enable2FA
	t.Run("Enable2FA", func(t *testing.T) {
		secret, err := service.Enable2FA(1)
		if err != nil {
			t.Fatalf("Enable2FA failed: %v", err)
		}
		if secret == "" {
			t.Fatal("Secret is empty")
		}
	})

	// Test GetSecurityInfo
	t.Run("GetSecurityInfo", func(t *testing.T) {
		info, err := service.GetSecurityInfo(1)
		if err != nil {
			t.Fatalf("GetSecurityInfo failed: %v", err)
		}
		if info == nil {
			t.Fatal("Security info is nil")
		}
	})

	// Test RecordLogin
	t.Run("RecordLogin", func(t *testing.T) {
		err := service.RecordLogin(1, "192.168.1.1", "Mozilla/5.0")
		if err != nil {
			t.Fatalf("RecordLogin failed: %v", err)
		}
	})

	// Test GetLoginHistory
	t.Run("GetLoginHistory", func(t *testing.T) {
		history, err := service.GetLoginHistory(1, 10)
		if err != nil {
			t.Fatalf("GetLoginHistory failed: %v", err)
		}
		if history == nil {
			t.Fatal("History is nil")
		}
	})
}

// TestAnalyticsService tests the analytics service
func TestAnalyticsService(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	service := NewAnalyticsService(db)

	// Test GetCostAnalysis
	t.Run("GetCostAnalysis", func(t *testing.T) {
		analysis, err := service.GetCostAnalysis(1)
		if err != nil {
			t.Fatalf("GetCostAnalysis failed: %v", err)
		}
		if analysis == nil {
			t.Fatal("Analysis is nil")
		}
	})

	// Test GetMonthlyStats
	t.Run("GetMonthlyStats", func(t *testing.T) {
		stats, err := service.GetMonthlyStats(1)
		if err != nil {
			t.Fatalf("GetMonthlyStats failed: %v", err)
		}
		if stats == nil {
			t.Fatal("Stats is nil")
		}
	})
}

// TestReferralService tests the referral service
func TestReferralService(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	service := NewReferralService(db)

	// Test GetOrCreateReferralCode
	t.Run("GetOrCreateReferralCode", func(t *testing.T) {
		code, err := service.GetOrCreateReferralCode(1)
		if err != nil {
			t.Fatalf("GetOrCreateReferralCode failed: %v", err)
		}
		if code == nil {
			t.Fatal("Code is nil")
		}
		if code.Code == "" {
			t.Fatal("Code is empty")
		}
	})

	// Test RecordReferral
	t.Run("RecordReferral", func(t *testing.T) {
		referral, err := service.RecordReferral(1, 2)
		if err != nil {
			t.Fatalf("RecordReferral failed: %v", err)
		}
		if referral == nil {
			t.Fatal("Referral is nil")
		}
	})

	// Test GetReferralStats
	t.Run("GetReferralStats", func(t *testing.T) {
		stats, err := service.GetReferralStats(1)
		if err != nil {
			t.Fatalf("GetReferralStats failed: %v", err)
		}
		if stats == nil {
			t.Fatal("Stats is nil")
		}
	})
}

// TestNotificationService tests the notification service
func TestNotificationService(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	service := NewNotificationService(db)

	// Test GetPreferences
	t.Run("GetPreferences", func(t *testing.T) {
		prefs, err := service.GetPreferences(1)
		if err != nil {
			t.Fatalf("GetPreferences failed: %v", err)
		}
		if prefs == nil {
			t.Fatal("Preferences is nil")
		}
	})

	// Test SendNotification
	t.Run("SendNotification", func(t *testing.T) {
		err := service.SendNotification(1, "test", "Test Title", "Test Message")
		if err != nil {
			t.Fatalf("SendNotification failed: %v", err)
		}
	})

	// Test GetNotifications
	t.Run("GetNotifications", func(t *testing.T) {
		notifications, err := service.GetNotifications(1, 10)
		if err != nil {
			t.Fatalf("GetNotifications failed: %v", err)
		}
		if notifications == nil {
			t.Fatal("Notifications is nil")
		}
	})

	// Test GetUnreadCount
	t.Run("GetUnreadCount", func(t *testing.T) {
		count, err := service.GetUnreadCount(1)
		if err != nil {
			t.Fatalf("GetUnreadCount failed: %v", err)
		}
		if count < 0 {
			t.Fatalf("Invalid count: %d", count)
		}
	})
}

// Helper function to setup test database
func setupTestDB(t *testing.T) *sqlx.DB {
	// For testing, we would use a test database
	// This is a placeholder - in real tests, you'd use a test database
	db, err := sqlx.Connect("postgres", "postgres://postgres:password@localhost:5432/atlantic_proxy_test?sslmode=disable")
	if err != nil {
		t.Skipf("Could not connect to test database: %v", err)
	}
	return db
}

// BenchmarkProxyConnect benchmarks proxy connection
func BenchmarkProxyConnect(b *testing.B) {
	db, err := sqlx.Connect("postgres", "postgres://postgres:password@localhost:5432/atlantic_proxy_test?sslmode=disable")
	if err != nil {
		b.Skipf("Could not connect to test database: %v", err)
	}
	defer db.Close()

	service := NewProxyService(db)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		service.Connect(1)
	}
}

// BenchmarkBillingGetPlans benchmarks getting billing plans
func BenchmarkBillingGetPlans(b *testing.B) {
	db, err := sqlx.Connect("postgres", "postgres://postgres:password@localhost:5432/atlantic_proxy_test?sslmode=disable")
	if err != nil {
		b.Skipf("Could not connect to test database: %v", err)
	}
	defer db.Close()

	service := NewBillingService(db)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		service.GetPlans()
	}
}
