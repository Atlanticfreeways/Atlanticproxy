-- Create test user for Atlantic Proxy
-- Password: password123 (hashed with bcrypt)

INSERT INTO users (email, password_hash, subscription_tier) 
VALUES (
    'test@atlanticproxy.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'premium'
) ON CONFLICT (email) DO NOTHING;

-- Insert some sample proxy usage data
INSERT INTO proxy_usage (user_id, bytes_sent, bytes_received, requests_count, recorded_at)
SELECT 
    u.id,
    1024 * 1024 * 50, -- 50MB sent
    1024 * 1024 * 200, -- 200MB received  
    1500, -- 1500 requests
    NOW() - INTERVAL '1 day'
FROM users u WHERE u.email = 'test@atlanticproxy.com';