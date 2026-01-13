-- Up
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    data_quota_mb INTEGER NOT NULL, -- -1 for unlimited
    request_limit INTEGER NOT NULL, -- -1 for unlimited
    concurrent_conns INTEGER NOT NULL,
    features TEXT -- JSON array of features
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    plan_id TEXT REFERENCES plans(id),
    status TEXT NOT NULL, -- active, canceled, expired, past_due
    stripe_sub_id TEXT,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usage_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT REFERENCES users(id),
    period_start DATETIME NOT NULL,
    period_end DATETIME NOT NULL,
    data_transferred_bytes INTEGER DEFAULT 0,
    requests_made INTEGER DEFAULT 0,
    ads_blocked INTEGER DEFAULT 0,
    threats_blocked INTEGER DEFAULT 0,
    UNIQUE(user_id, period_start, period_end)
);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL, -- succeeded, failed, pending
    gateway TEXT NOT NULL, -- stripe, crypto
    gateway_ref_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    session_token TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
);

-- Seed Plans
INSERT OR IGNORE INTO plans (id, name, price_cents, data_quota_mb, request_limit, concurrent_conns, features) VALUES 
('starter', 'Starter', 900, 500, 1000, 5, '["Basic Support", "Shared Pool"]'),
('personal', 'Personal', 2900, 5000, 10000, 20, '["Priority Support", "Residential IPs"]'),
('team', 'Team', 9900, 50000, 100000, 50, '["Team Dashboard", "API Access"]'),
('enterprise', 'Enterprise', 29900, -1, -1, 500, '["Dedicated Account Manager", "Custom Solutions"]');
