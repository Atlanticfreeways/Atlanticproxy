package database

import (
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
)

// InitializeDatabase creates all necessary tables and indexes
func InitializeDatabase(db *sqlx.DB) error {
	log.Println("📊 Initializing database schema...")

	// Create users table
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			subscription_tier VARCHAR(50) DEFAULT 'free',
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create users table: %w", err)
	}
	log.Println("✅ Users table ready")

	// Create proxy_connections table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS proxy_connections (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			client_id VARCHAR(255) UNIQUE NOT NULL,
			status VARCHAR(50) NOT NULL,
			ip_address VARCHAR(45),
			location VARCHAR(100),
			connected_at TIMESTAMP DEFAULT NOW(),
			disconnected_at TIMESTAMP
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create proxy_connections table: %w", err)
	}
	log.Println("✅ Proxy connections table ready")

	// Create proxy_usage table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS proxy_usage (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			bytes_sent BIGINT DEFAULT 0,
			bytes_received BIGINT DEFAULT 0,
			requests_count INTEGER DEFAULT 0,
			recorded_at TIMESTAMP DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create proxy_usage table: %w", err)
	}
	log.Println("✅ Proxy usage table ready")

	// Create billing_plans table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS billing_plans (
			id VARCHAR(50) PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			price DECIMAL(10, 2) NOT NULL,
			bandwidth BIGINT NOT NULL,
			connections INTEGER NOT NULL,
			features TEXT,
			active BOOLEAN DEFAULT true
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create billing_plans table: %w", err)
	}
	log.Println("✅ Billing plans table ready")

	// Create billing_transactions table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS billing_transactions (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			plan_id VARCHAR(50) REFERENCES billing_plans(id),
			amount DECIMAL(10, 2) NOT NULL,
			status VARCHAR(50) NOT NULL,
			reference VARCHAR(255),
			created_at TIMESTAMP DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create billing_transactions table: %w", err)
	}
	log.Println("✅ Billing transactions table ready")

	// Create referrals table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS referrals (
			id SERIAL PRIMARY KEY,
			referrer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			referred_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			status VARCHAR(50) DEFAULT 'pending',
			reward DECIMAL(10, 2) DEFAULT 0,
			created_at TIMESTAMP DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create referrals table: %w", err)
	}
	log.Println("✅ Referrals table ready")

	// Create notification_preferences table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS notification_preferences (
			id SERIAL PRIMARY KEY,
			user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
			email_notifications BOOLEAN DEFAULT true,
			push_notifications BOOLEAN DEFAULT true,
			connection_alerts BOOLEAN DEFAULT true,
			usage_alerts BOOLEAN DEFAULT true,
			created_at TIMESTAMP DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create notification_preferences table: %w", err)
	}
	log.Println("✅ Notification preferences table ready")

	// Create audit_logs table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS audit_logs (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			action VARCHAR(100) NOT NULL,
			resource VARCHAR(100) NOT NULL,
			details TEXT,
			ip_address VARCHAR(45),
			timestamp TIMESTAMP DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create audit_logs table: %w", err)
	}
	log.Println("✅ Audit logs table ready")

	// Create api_keys table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS api_keys (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			key_encrypted TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT NOW(),
			rotated_at TIMESTAMP
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create api_keys table: %w", err)
	}
	log.Println("✅ API keys table ready")

	// Create encrypted_data table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS encrypted_data (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			data_type VARCHAR(50) NOT NULL,
			data_encrypted TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT NOW(),
			rotated_at TIMESTAMP
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create encrypted_data table: %w", err)
	}
	log.Println("✅ Encrypted data table ready")

	// Create indexes
	_, err = db.Exec(`
		CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
		CREATE INDEX IF NOT EXISTS idx_proxy_connections_user_id ON proxy_connections(user_id);
		CREATE INDEX IF NOT EXISTS idx_proxy_usage_user_id ON proxy_usage(user_id);
		CREATE INDEX IF NOT EXISTS idx_billing_transactions_user_id ON billing_transactions(user_id);
		CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
		CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
		CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
		CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
		CREATE INDEX IF NOT EXISTS idx_encrypted_data_user_id ON encrypted_data(user_id);
	`)
	if err != nil {
		return fmt.Errorf("failed to create indexes: %w", err)
	}
	log.Println("✅ Indexes created")

	// Seed default plans if they don't exist
	var count int
	err = db.Get(&count, "SELECT COUNT(*) FROM billing_plans")
	if err == nil && count == 0 {
		_, err = db.Exec(`
			INSERT INTO billing_plans (id, name, price, bandwidth, connections, features, active) VALUES
			('free', 'Free', 0, 1073741824, 1, 'Basic proxy access', true),
			('pro', 'Pro', 9.99, 10737418240, 5, 'Advanced features, priority support', true),
			('enterprise', 'Enterprise', 99.99, 1099511627776, 100, 'Unlimited features, dedicated support', true)
		`)
		if err != nil {
			return fmt.Errorf("failed to seed plans: %w", err)
		}
		log.Println("✅ Default plans seeded")
	}

	log.Println("✅ Database initialization complete")
	return nil
}
