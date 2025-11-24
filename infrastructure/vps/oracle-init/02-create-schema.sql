-- Atlantic Proxy Oracle Schema Creation
-- Connect as atlantic_user and create application tables

-- Connect to PDB and switch to atlantic_user
ALTER SESSION SET CONTAINER = XEPDB1;
-- Note: This will be executed as atlantic_user via connection

-- Users table
CREATE TABLE users (
    id VARCHAR2(36) DEFAULT SYS_GUID() PRIMARY KEY,
    email VARCHAR2(255) UNIQUE NOT NULL,
    password_hash VARCHAR2(255) NOT NULL,
    plan VARCHAR2(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    active NUMBER(1) DEFAULT 1,
    CONSTRAINT chk_plan CHECK (plan IN ('basic', 'professional', 'enterprise'))
);

-- Sessions table
CREATE TABLE user_sessions (
    id VARCHAR2(36) DEFAULT SYS_GUID() PRIMARY KEY,
    user_id VARCHAR2(36) NOT NULL,
    token VARCHAR2(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id VARCHAR2(36) DEFAULT SYS_GUID() PRIMARY KEY,
    user_id VARCHAR2(36) NOT NULL,
    plan_id VARCHAR2(50) NOT NULL,
    status VARCHAR2(20) DEFAULT 'active',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    amount NUMBER(10,2) NOT NULL,
    stripe_subscription_id VARCHAR2(255),
    CONSTRAINT fk_subscription_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_status CHECK (status IN ('active', 'cancelled', 'expired'))
);

-- Usage tracking table
CREATE TABLE usage_records (
    id VARCHAR2(36) DEFAULT SYS_GUID() PRIMARY KEY,
    user_id VARCHAR2(36) NOT NULL,
    data_used NUMBER(20) DEFAULT 0,
    request_count NUMBER(20) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    monthly_limit NUMBER(20) NOT NULL,
    CONSTRAINT fk_usage_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Support tickets table
CREATE TABLE support_tickets (
    id VARCHAR2(36) DEFAULT SYS_GUID() PRIMARY KEY,
    user_id VARCHAR2(36) NOT NULL,
    subject VARCHAR2(255) NOT NULL,
    description CLOB,
    status VARCHAR2(20) DEFAULT 'open',
    priority VARCHAR2(10) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ticket_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_ticket_status CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    CONSTRAINT chk_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Referrals table
CREATE TABLE referrals (
    id VARCHAR2(36) DEFAULT SYS_GUID() PRIMARY KEY,
    referrer_id VARCHAR2(36) NOT NULL,
    referee_email VARCHAR2(255) NOT NULL,
    status VARCHAR2(20) DEFAULT 'pending',
    commission NUMBER(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    converted_at TIMESTAMP,
    CONSTRAINT fk_referral_user FOREIGN KEY (referrer_id) REFERENCES users(id),
    CONSTRAINT chk_referral_status CHECK (status IN ('pending', 'converted', 'expired'))
);

-- Analytics metrics table
CREATE TABLE analytics_metrics (
    id VARCHAR2(36) DEFAULT SYS_GUID() PRIMARY KEY,
    metric_name VARCHAR2(100) NOT NULL,
    metric_value NUMBER(20,2) NOT NULL,
    metric_type VARCHAR2(20) NOT NULL,
    tags CLOB, -- JSON format
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_metric_type CHECK (metric_type IN ('gauge', 'counter', 'histogram'))
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_token ON user_sessions(token);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_usage_user ON usage_records(user_id);
CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_analytics_name ON analytics_metrics(metric_name);
CREATE INDEX idx_analytics_timestamp ON analytics_metrics(timestamp);

-- Create sequences for auto-incrementing IDs (if needed)
CREATE SEQUENCE user_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE ticket_seq START WITH 1 INCREMENT BY 1;

-- Insert demo data
INSERT INTO users (email, password_hash, plan, active) VALUES 
('demo@atlanticproxy.com', 'hashed_demo_password', 'professional', 1);

INSERT INTO users (email, password_hash, plan, active) VALUES 
('enterprise@atlanticproxy.com', 'hashed_enterprise_password', 'enterprise', 1);

INSERT INTO users (email, password_hash, plan, active) VALUES 
('basic@atlanticproxy.com', 'hashed_basic_password', 'basic', 1);

-- Commit changes
COMMIT;

-- Verify table creation
SELECT table_name FROM user_tables ORDER BY table_name;