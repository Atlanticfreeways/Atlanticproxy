package models

import "time"

// SecurityInfo represents account security information
type SecurityInfo struct {
	LastLogin           string `json:"lastLogin"`
	LastLoginIP         string `json:"lastLoginIP"`
	LastPasswordChange  string `json:"lastPasswordChange"`
	TwoFactorEnabled    bool   `json:"twoFactorEnabled"`
	ActiveDevices       int    `json:"activeDevices"`
	LoginAttempts       int    `json:"loginAttempts"`
}

// Session represents an active session
type Session struct {
	ID        string    `db:"id" json:"id"`
	UserID    string    `db:"user_id" json:"userId"`
	Device    string    `db:"device" json:"device"`
	IP        string    `db:"ip" json:"ip"`
	LastActive time.Time `db:"last_active" json:"lastActive"`
	Current   bool      `json:"current"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt"`
}
