-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create proxy_connections table
CREATE TABLE IF NOT EXISTS proxy_connections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    client_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    location VARCHAR(100),
    connected_at TIMESTAMP DEFAULT NOW(),
    disconnected_at TIMESTAMP
);

-- Create proxy_usage table
CREATE TABLE IF NOT EXISTS proxy_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bytes_sent BIGINT DEFAULT 0,
    bytes_received BIGINT DEFAULT 0,
    requests_count INTEGER DEFAULT 0,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_proxy_connections_user_id ON proxy_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_proxy_usage_user_id ON proxy_usage(user_id);
