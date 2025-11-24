-- Dedicated Proxy Pools
CREATE TABLE dedicated_proxy_pools (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    proxy_type VARCHAR(50) NOT NULL,
    countries JSONB,
    min_ips INTEGER DEFAULT 100,
    max_concurrency INTEGER DEFAULT 1000,
    sla_uptime DECIMAL(5,2) DEFAULT 99.9,
    status VARCHAR(20) DEFAULT 'provisioning', -- provisioning, active, maintenance, suspended
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- SLA Monitoring
CREATE TABLE sla_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pool_id INTEGER REFERENCES dedicated_proxy_pools(id),
    uptime_percentage DECIMAL(5,2),
    avg_response_time INTEGER, -- milliseconds
    success_rate DECIMAL(5,2),
    total_requests BIGINT,
    failed_requests BIGINT,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Custom Integrations
CREATE TABLE custom_integrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL, -- api, webhook, sdk
    name VARCHAR(255) NOT NULL,
    configuration JSONB,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Performance Alerts
CREATE TABLE performance_alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- uptime, response_time, success_rate
    threshold_value DECIMAL(10,2),
    current_value DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'active', -- active, resolved, acknowledged
    triggered_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- White-label Configurations
CREATE TABLE whitelabel_configs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    domain VARCHAR(255),
    brand_name VARCHAR(255),
    logo_url VARCHAR(500),
    primary_color VARCHAR(7), -- hex color
    secondary_color VARCHAR(7),
    custom_css TEXT,
    email_templates JSONB,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Update custom_pricing table to include valid_until
ALTER TABLE custom_pricing ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP;

-- Create indexes
CREATE INDEX idx_dedicated_pools_user_id ON dedicated_proxy_pools(user_id);
CREATE INDEX idx_dedicated_pools_status ON dedicated_proxy_pools(status);
CREATE INDEX idx_sla_metrics_user_id ON sla_metrics(user_id);
CREATE INDEX idx_sla_metrics_recorded_at ON sla_metrics(recorded_at);
CREATE INDEX idx_custom_integrations_user_id ON custom_integrations(user_id);
CREATE INDEX idx_performance_alerts_user_id ON performance_alerts(user_id);
CREATE INDEX idx_performance_alerts_status ON performance_alerts(status);
CREATE INDEX idx_whitelabel_configs_user_id ON whitelabel_configs(user_id);
CREATE INDEX idx_whitelabel_configs_domain ON whitelabel_configs(domain);