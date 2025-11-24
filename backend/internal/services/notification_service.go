package services

import (
	"fmt"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
)

// NotificationService handles user notifications
type NotificationService struct {
	db *sqlx.DB
}

// NotificationPreferences represents user notification preferences
type NotificationPreferences struct {
	ID                    int  `db:"id" json:"id"`
	UserID                int  `db:"user_id" json:"user_id"`
	EmailNotifications    bool `db:"email_notifications" json:"email_notifications"`
	PushNotifications     bool `db:"push_notifications" json:"push_notifications"`
	ConnectionAlerts      bool `db:"connection_alerts" json:"connection_alerts"`
	UsageAlerts           bool `db:"usage_alerts" json:"usage_alerts"`
	BillingNotifications  bool `db:"billing_notifications" json:"billing_notifications"`
	SecurityNotifications bool `db:"security_notifications" json:"security_notifications"`
}

// Notification represents a notification
type Notification struct {
	ID        int       `db:"id" json:"id"`
	UserID    int       `db:"user_id" json:"user_id"`
	Type      string    `db:"type" json:"type"`
	Title     string    `db:"title" json:"title"`
	Message   string    `db:"message" json:"message"`
	Read      bool      `db:"read" json:"read"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

// NewNotificationService creates a new notification service
func NewNotificationService(db *sqlx.DB) *NotificationService {
	return &NotificationService{db: db}
}

// GetPreferences returns notification preferences for a user
func (ns *NotificationService) GetPreferences(userID int) (*NotificationPreferences, error) {
	log.Printf("🔔 Getting notification preferences for user %d", userID)

	var prefs NotificationPreferences
	err := ns.db.Get(&prefs,
		`SELECT id, user_id, email_notifications, push_notifications, connection_alerts, usage_alerts, billing_notifications, security_notifications
		 FROM notification_preferences
		 WHERE user_id = $1`,
		userID,
	)

	if err != nil {
		log.Printf("⚠️  No preferences found, creating defaults for user %d", userID)
		// Create default preferences
		err = ns.db.QueryRowx(
			`INSERT INTO notification_preferences (user_id, email_notifications, push_notifications, connection_alerts, usage_alerts, billing_notifications, security_notifications)
			 VALUES ($1, true, true, true, true, true, true)
			 RETURNING id, user_id, email_notifications, push_notifications, connection_alerts, usage_alerts, billing_notifications, security_notifications`,
			userID,
		).StructScan(&prefs)

		if err != nil {
			log.Printf("❌ Failed to create preferences: %v", err)
			return nil, fmt.Errorf("failed to create preferences: %w", err)
		}
	}

	log.Printf("✅ Preferences retrieved for user %d", userID)
	return &prefs, nil
}

// UpdatePreferences updates notification preferences
func (ns *NotificationService) UpdatePreferences(userID int, prefs *NotificationPreferences) error {
	log.Printf("🔔 Updating notification preferences for user %d", userID)

	_, err := ns.db.Exec(
		`UPDATE notification_preferences
		 SET email_notifications = $1, push_notifications = $2, connection_alerts = $3, usage_alerts = $4, billing_notifications = $5, security_notifications = $6
		 WHERE user_id = $7`,
		prefs.EmailNotifications, prefs.PushNotifications, prefs.ConnectionAlerts, prefs.UsageAlerts, prefs.BillingNotifications, prefs.SecurityNotifications, userID,
	)

	if err != nil {
		log.Printf("❌ Failed to update preferences: %v", err)
		return fmt.Errorf("failed to update preferences: %w", err)
	}

	log.Printf("✅ Preferences updated for user %d", userID)
	return nil
}

// SendNotification sends a notification to a user
func (ns *NotificationService) SendNotification(userID int, notificationType string, title string, message string) error {
	log.Printf("📨 Sending %s notification to user %d", notificationType, userID)

	_, err := ns.db.Exec(
		`INSERT INTO notifications (user_id, type, title, message, read, created_at)
		 VALUES ($1, $2, $3, $4, false, NOW())`,
		userID, notificationType, title, message,
	)

	if err != nil {
		log.Printf("❌ Failed to send notification: %v", err)
		return fmt.Errorf("failed to send notification: %w", err)
	}

	// TODO: Send email if preferences allow
	// TODO: Send push notification if preferences allow

	log.Printf("✅ Notification sent to user %d", userID)
	return nil
}

// GetNotifications returns notifications for a user
func (ns *NotificationService) GetNotifications(userID int, limit int) ([]Notification, error) {
	log.Printf("📋 Getting notifications for user %d", userID)

	var notifications []Notification
	err := ns.db.Select(&notifications,
		`SELECT id, user_id, type, title, message, read, created_at
		 FROM notifications
		 WHERE user_id = $1
		 ORDER BY created_at DESC
		 LIMIT $2`,
		userID, limit,
	)

	if err != nil {
		log.Printf("❌ Failed to get notifications: %v", err)
		return nil, fmt.Errorf("failed to get notifications: %w", err)
	}

	log.Printf("✅ Retrieved %d notifications", len(notifications))
	return notifications, nil
}

// MarkAsRead marks a notification as read
func (ns *NotificationService) MarkAsRead(notificationID int) error {
	log.Printf("✅ Marking notification %d as read", notificationID)

	_, err := ns.db.Exec(
		`UPDATE notifications SET read = true WHERE id = $1`,
		notificationID,
	)

	if err != nil {
		log.Printf("❌ Failed to mark as read: %v", err)
		return fmt.Errorf("failed to mark as read: %w", err)
	}

	return nil
}

// MarkAllAsRead marks all notifications as read
func (ns *NotificationService) MarkAllAsRead(userID int) error {
	log.Printf("✅ Marking all notifications as read for user %d", userID)

	_, err := ns.db.Exec(
		`UPDATE notifications SET read = true WHERE user_id = $1 AND read = false`,
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to mark all as read: %v", err)
		return fmt.Errorf("failed to mark all as read: %w", err)
	}

	return nil
}

// GetUnreadCount returns count of unread notifications
func (ns *NotificationService) GetUnreadCount(userID int) (int, error) {
	log.Printf("📊 Getting unread count for user %d", userID)

	var count int
	err := ns.db.Get(&count,
		`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false`,
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to get unread count: %v", err)
		return 0, fmt.Errorf("failed to get unread count: %w", err)
	}

	log.Printf("✅ Unread count: %d", count)
	return count, nil
}

// SendConnectionAlert sends a connection alert
func (ns *NotificationService) SendConnectionAlert(userID int, status string) error {
	title := "Proxy Connection Alert"
	message := fmt.Sprintf("Your proxy connection status changed to: %s", status)
	return ns.SendNotification(userID, "connection", title, message)
}

// SendUsageAlert sends a usage alert
func (ns *NotificationService) SendUsageAlert(userID int, usagePercent int) error {
	title := "Usage Alert"
	message := fmt.Sprintf("You have used %d%% of your monthly bandwidth", usagePercent)
	return ns.SendNotification(userID, "usage", title, message)
}

// SendBillingAlert sends a billing alert
func (ns *NotificationService) SendBillingAlert(userID int, alertType string) error {
	title := "Billing Alert"
	message := fmt.Sprintf("Billing alert: %s", alertType)
	return ns.SendNotification(userID, "billing", title, message)
}

// SendSecurityAlert sends a security alert
func (ns *NotificationService) SendSecurityAlert(userID int, alertType string) error {
	title := "Security Alert"
	message := fmt.Sprintf("Security alert: %s", alertType)
	return ns.SendNotification(userID, "security", title, message)
}
