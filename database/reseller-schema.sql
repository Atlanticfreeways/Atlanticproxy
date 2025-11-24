-- Reseller Applications
CREATE TABLE reseller_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    business_type VARCHAR(100) NOT NULL,
    expected_volume VARCHAR(100) NOT NULL,
    experience TEXT,
    marketing_plan TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Reseller Profiles
CREATE TABLE reseller_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    commission_rate DECIMAL(5,2) DEFAULT 30.00,
    tier VARCHAR(20) DEFAULT 'bronze', -- bronze, silver, gold, platinum
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, inactive
    total_customers INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Marketing Materials
CREATE TABLE marketing_materials (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    material_type VARCHAR(50) NOT NULL, -- banner, email, landing_page, brochure
    file_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Custom Pricing Tiers
CREATE TABLE custom_pricing (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    monthly_limit BIGINT,
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_reseller_applications_user_id ON reseller_applications(user_id);
CREATE INDEX idx_reseller_applications_status ON reseller_applications(status);
CREATE INDEX idx_reseller_profiles_user_id ON reseller_profiles(user_id);
CREATE INDEX idx_reseller_profiles_tier ON reseller_profiles(tier);
CREATE INDEX idx_marketing_materials_type ON marketing_materials(material_type);
CREATE INDEX idx_custom_pricing_user_id ON custom_pricing(user_id);