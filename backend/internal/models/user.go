package models

import "time"

type User struct {
	ID               int       `db:"id" json:"id"`
	Email            string    `db:"email" json:"email"`
	PasswordHash     string    `db:"password_hash" json:"-"`
	SubscriptionTier string    `db:"subscription_tier" json:"subscription_tier"`
	CreatedAt        time.Time `db:"created_at" json:"created_at"`
}

type ProxyConnection struct {
	ID             int        `db:"id" json:"id"`
	UserID         int        `db:"user_id" json:"user_id"`
	ClientID       string     `db:"client_id" json:"client_id"`
	Status         string     `db:"status" json:"status"`
	IPAddress      *string    `db:"ip_address" json:"ip_address,omitempty"`
	Location       *string    `db:"location" json:"location,omitempty"`
	ConnectedAt    time.Time  `db:"connected_at" json:"connected_at"`
	DisconnectedAt *time.Time `db:"disconnected_at" json:"disconnected_at,omitempty"`
}