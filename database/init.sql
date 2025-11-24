-- Atlantic Proxy Database Schema
CREATE DATABASE atlantic_proxy;

-- Users and Authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User Sessions
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Proxy Endpoints
CREATE TABLE proxy_endpoints (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    endpoint_url VARCHAR(255) NOT NULL,
    proxy_type VARCHAR(50) NOT NULL, -- residential, datacenter, mobile, isp
    country VARCHAR(3), -- ISO country code
    city VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage Tracking
CREATE TABLE usage_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    endpoint_id INTEGER REFERENCES proxy_endpoints(id) ON DELETE CASCADE,
    bytes_used BIGINT DEFAULT 0,
    requests_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Referral System
CREATE TABLE referral_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 15.00,
    total_referrals INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Referral Tracking
CREATE TABLE referrals (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    referred_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    referral_code_id INTEGER REFERENCES referral_codes(id) ON DELETE CASCADE,
    commission_earned DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, paid
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    plan_type VARCHAR(50) NOT NULL, -- individual, reseller, enterprise
    monthly_limit BIGINT, -- bytes limit
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, cancelled, suspended
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES subscriptions(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, refunded
    due_date TIMESTAMP NOT NULL,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Support Tickets
CREATE TABLE support_tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics Events
CREATE TABLE analytics_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_proxy_endpoints_user_id ON proxy_endpoints(user_id);
CREATE INDEX idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX idx_usage_records_recorded_at ON usage_records(recorded_at);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);