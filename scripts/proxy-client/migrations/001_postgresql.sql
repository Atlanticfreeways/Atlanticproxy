-- PostgreSQL Migration Script
-- Converts SQLite schema to PostgreSQL

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    data_quota_mb INTEGER NOT NULL,
    request_limit INTEGER NOT NULL,
    concurrent_conns INTEGER NOT NULL,
    features JSONB
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    plan_id TEXT REFERENCES plans(id),
    status TEXT NOT NULL,
    stripe_sub_id TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    data_transferred_bytes BIGINT DEFAULT 0,
    requests_made INTEGER DEFAULT 0,
    ads_blocked INTEGER DEFAULT 0,
    threats_blocked INTEGER DEFAULT 0,
    UNIQUE(user_id, period_start, period_end)
);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL,
    gateway TEXT NOT NULL,
    gateway_ref_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);

-- Seed Plans
INSERT INTO plans (id, name, price_cents, data_quota_mb, request_limit, concurrent_conns, features) VALUES 
('starter', 'Starter', 699, 10240, 10000, 5, '["HTTPS Only", "Kill Switch", "Ad-Blocking", "Town-Level Targeting"]'),
('personal', 'Personal', 2900, 51200, 100000, 20, '["All Protocols", "API Access", "Protocol Selection", "Priority Support"]'),
('team', 'Team', 9900, 512000, 1000000, 50, '["5 Team Seats", "Team Management", "Shared Configs", "Priority Support"]'),
('enterprise', 'Enterprise', 99900, -1, -1, 500, '["Dedicated IPs", "White-Label", "99.99% SLA", "Custom Integration"]')
ON CONFLICT (id) DO NOTHING;
