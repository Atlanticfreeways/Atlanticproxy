-- Phase 4 Database Migrations
-- Created: 2024-01-20
-- Purpose: Add tables for billing, proxy configuration, and notifications

-- Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('card', 'paypal', 'crypto')),
    name VARCHAR(255) NOT NULL,
    last_four VARCHAR(4),
    expiry_date VARCHAR(5),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('paid', 'pending', 'failed')),
    description TEXT,
    date TIMESTAMP NOT NULL,
    download_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL,
    protocol VARCHAR(20) NOT NULL CHECK (protocol IN ('http', 'https', 'socks5')),
    isp_tier VARCHAR(20) NOT NULL CHECK (isp_tier IN ('budget', 'standard', 'premium')),
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    payment_method_id VARCHAR(50),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proxy Locations Table
CREATE TABLE IF NOT EXISTS proxy_locations (
    id VARCHAR(50) PRIMARY KEY,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL,
    servers INTEGER NOT NULL,
    latency INTEGER NOT NULL,
    uptime DECIMAL(5, 2) NOT NULL,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proxy Configurations Table
CREATE TABLE IF NOT EXISTS proxy_configurations (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    protocol VARCHAR(20) NOT NULL CHECK (protocol IN ('http', 'https', 'socks5')),
    isp_tier VARCHAR(20) NOT NULL CHECK (isp_tier IN ('budget', 'standard', 'premium')),
    locations JSONB NOT NULL DEFAULT '[]',
    load_balancing_mode VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session Settings Table
CREATE TABLE IF NOT EXISTS session_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT true,
    session_duration INTEGER NOT NULL DEFAULT 30,
    session_timeout INTEGER NOT NULL DEFAULT 60,
    ip_stickiness BOOLEAN DEFAULT true,
    cookie_preservation BOOLEAN DEFAULT true,
    header_preservation BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom Headers Table
CREATE TABLE IF NOT EXISTS custom_headers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Throttling Settings Table
CREATE TABLE IF NOT EXISTS throttling_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT true,
    requests_per_second INTEGER NOT NULL DEFAULT 10,
    burst_size INTEGER NOT NULL DEFAULT 20,
    delay_between_requests INTEGER NOT NULL DEFAULT 100,
    connection_limit INTEGER NOT NULL DEFAULT 50,
    bandwidth_limit INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proxy Authentication Table
CREATE TABLE IF NOT EXISTS proxy_authentication (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    auth_method VARCHAR(20) NOT NULL CHECK (auth_method IN ('basic', 'digest', 'bearer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification Settings Table
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email_notifications JSONB NOT NULL DEFAULT '{}',
    push_notifications JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Connection Logs Table (for analytics)
CREATE TABLE IF NOT EXISTS connection_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    protocol VARCHAR(20) NOT NULL,
    location VARCHAR(100) NOT NULL,
    latency INTEGER NOT NULL,
    bandwidth BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(user_id, is_default);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(user_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(user_id, date);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_proxy_locations_region ON proxy_locations(region);
CREATE INDEX IF NOT EXISTS idx_proxy_locations_available ON proxy_locations(available);

CREATE INDEX IF NOT EXISTS idx_proxy_configurations_user_id ON proxy_configurations(user_id);

CREATE INDEX IF NOT EXISTS idx_session_settings_user_id ON session_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_custom_headers_user_id ON custom_headers(user_id);

CREATE INDEX IF NOT EXISTS idx_throttling_settings_user_id ON throttling_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_proxy_authentication_user_id ON proxy_authentication(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_connection_logs_user_id ON connection_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_logs_created_at ON connection_logs(user_id, created_at);

-- Insert sample proxy locations
INSERT INTO proxy_locations (id, country, city, region, servers, latency, uptime, available) VALUES
('loc_us_east_1', 'United States', 'New York', 'us-east', 150, 12, 99.9, true),
('loc_us_west_1', 'United States', 'Los Angeles', 'us-west', 120, 45, 99.8, true),
('loc_eu_west_1', 'United Kingdom', 'London', 'eu-west', 80, 28, 99.7, true),
('loc_eu_central_1', 'Germany', 'Frankfurt', 'eu-central', 100, 35, 99.9, true),
('loc_asia_east_1', 'Japan', 'Tokyo', 'asia-east', 90, 85, 99.6, true),
('loc_asia_pacific_1', 'Australia', 'Sydney', 'asia-pacific', 60, 120, 99.5, true),
('loc_north_america_1', 'Canada', 'Toronto', 'north-america', 70, 18, 99.8, true),
('loc_south_america_1', 'Brazil', 'São Paulo', 'south-america', 50, 95, 99.4, false)
ON CONFLICT DO NOTHING;
