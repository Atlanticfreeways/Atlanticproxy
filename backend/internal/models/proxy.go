package models

import "time"

// ProxyLocation represents a proxy server location
type ProxyLocation struct {
	ID        string `db:"id" json:"id"`
	Country   string `db:"country" json:"country"`
	City      string `db:"city" json:"city"`
	Region    string `db:"region" json:"region"`
	Servers   int    `db:"servers" json:"servers"`
	Latency   int    `db:"latency" json:"latency"`
	Uptime    float64 `db:"uptime" json:"uptime"`
	Available bool   `db:"available" json:"available"`
}

// ProxyConfiguration represents user's proxy configuration
type ProxyConfiguration struct {
	ID                string    `db:"id" json:"id"`
	UserID            string    `db:"user_id" json:"userId"`
	Protocol          string    `db:"protocol" json:"protocol"`
	ISPTier           string    `db:"isp_tier" json:"ispTier"`
	Locations         []string  `db:"locations" json:"locations"`
	LoadBalancingMode string    `db:"load_balancing_mode" json:"loadBalancingMode"`
	CreatedAt         time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt         time.Time `db:"updated_at" json:"updatedAt"`
}

// SessionSettings represents session persistence settings
type SessionSettings struct {
	ID                 string    `db:"id" json:"id"`
	UserID             string    `db:"user_id" json:"userId"`
	Enabled            bool      `db:"enabled" json:"enabled"`
	SessionDuration    int       `db:"session_duration" json:"sessionDuration"`
	SessionTimeout     int       `db:"session_timeout" json:"sessionTimeout"`
	IPStickiness       bool      `db:"ip_stickiness" json:"ipStickiness"`
	CookiePreservation bool      `db:"cookie_preservation" json:"cookiePreservation"`
	HeaderPreservation bool      `db:"header_preservation" json:"headerPreservation"`
	CreatedAt          time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt          time.Time `db:"updated_at" json:"updatedAt"`
}

// CustomHeader represents a custom HTTP header
type CustomHeader struct {
	ID        string    `db:"id" json:"id"`
	UserID    string    `db:"user_id" json:"userId"`
	Name      string    `db:"name" json:"name"`
	Value     string    `db:"value" json:"value"`
	Enabled   bool      `db:"enabled" json:"enabled"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt"`
}

// ThrottlingSettings represents request throttling settings
type ThrottlingSettings struct {
	ID                   string    `db:"id" json:"id"`
	UserID               string    `db:"user_id" json:"userId"`
	Enabled              bool      `db:"enabled" json:"enabled"`
	RequestsPerSecond    int       `db:"requests_per_second" json:"requestsPerSecond"`
	BurstSize            int       `db:"burst_size" json:"burstSize"`
	DelayBetweenRequests int       `db:"delay_between_requests" json:"delayBetweenRequests"`
	ConnectionLimit      int       `db:"connection_limit" json:"connectionLimit"`
	BandwidthLimit       int       `db:"bandwidth_limit" json:"bandwidthLimit"`
	CreatedAt            time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt            time.Time `db:"updated_at" json:"updatedAt"`
}

// ProxyAuthentication represents proxy authentication credentials
type ProxyAuthentication struct {
	ID         string    `db:"id" json:"id"`
	UserID     string    `db:"user_id" json:"userId"`
	Username   string    `db:"username" json:"username"`
	Password   string    `db:"password" json:"password"`
	AuthMethod string    `db:"auth_method" json:"authMethod"`
	CreatedAt  time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt  time.Time `db:"updated_at" json:"updatedAt"`
}
