package models

import "time"

// EmailNotificationSettings represents email notification preferences
type EmailNotificationSettings struct {
	DailyReport        bool   `json:"dailyReport"`
	WeeklyReport       bool   `json:"weeklyReport"`
	MonthlyReport      bool   `json:"monthlyReport"`
	UsageAlerts        bool   `json:"usageAlerts"`
	BillingAlerts      bool   `json:"billingAlerts"`
	SecurityAlerts     bool   `json:"securityAlerts"`
	MaintenanceNotices bool   `json:"maintenanceNotices"`
	NewFeatures        bool   `json:"newFeatures"`
	ReportTime         string `json:"reportTime"`
}

// PushNotificationSettings represents push notification preferences
type PushNotificationSettings struct {
	Enabled          bool `json:"enabled"`
	ConnectionStatus bool `json:"connectionStatus"`
	UsageAlerts      bool `json:"usageAlerts"`
	BillingAlerts    bool `json:"billingAlerts"`
	SecurityAlerts   bool `json:"securityAlerts"`
	Sound            bool `json:"sound"`
	Badge            bool `json:"badge"`
}

// NotificationSettings represents all notification settings
type NotificationSettings struct {
	ID                   string                      `db:"id" json:"id"`
	UserID               string                      `db:"user_id" json:"userId"`
	EmailNotifications   EmailNotificationSettings   `db:"email_notifications" json:"emailNotifications"`
	PushNotifications    PushNotificationSettings    `db:"push_notifications" json:"pushNotifications"`
	CreatedAt            time.Time                   `db:"created_at" json:"createdAt"`
	UpdatedAt            time.Time                   `db:"updated_at" json:"updatedAt"`
}
