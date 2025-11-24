package services

import (
	"encoding/json"
	"errors"
	"time"

	"atlanticproxy/backend/internal/models"
	"github.com/jmoiron/sqlx"
)

type NotificationsService struct {
	db *sqlx.DB
}

func NewNotificationsService(db *sqlx.DB) *NotificationsService {
	return &NotificationsService{db: db}
}

// GetSettings retrieves notification settings
func (s *NotificationsService) GetSettings(userID string) (*models.NotificationSettings, error) {
	var settings models.NotificationSettings
	var emailJSON, pushJSON []byte

	query := `
		SELECT id, user_id, email_notifications, push_notifications, created_at, updated_at
		FROM notification_settings
		WHERE user_id = $1
	`

	err := s.db.QueryRow(query, userID).Scan(&settings.ID, &settings.UserID, &emailJSON, &pushJSON, &settings.CreatedAt, &settings.UpdatedAt)
	if err != nil {
		// Return default settings if not found
		return s.getDefaultSettings(userID), nil
	}

	err = json.Unmarshal(emailJSON, &settings.EmailNotifications)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(pushJSON, &settings.PushNotifications)
	if err != nil {
		return nil, err
	}

	return &settings, nil
}

// UpdateSettings updates all notification settings
func (s *NotificationsService) UpdateSettings(userID string, settings *models.NotificationSettings) error {
	emailJSON, err := json.Marshal(settings.EmailNotifications)
	if err != nil {
		return err
	}

	pushJSON, err := json.Marshal(settings.PushNotifications)
	if err != nil {
		return err
	}

	query := `
		INSERT INTO notification_settings (user_id, email_notifications, push_notifications, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (user_id) DO UPDATE SET
			email_notifications = $2,
			push_notifications = $3,
			updated_at = $5
	`

	_, err = s.db.Exec(query, userID, emailJSON, pushJSON, time.Now(), time.Now())
	return err
}

// UpdateEmailSettings updates email notification settings
func (s *NotificationsService) UpdateEmailSettings(userID string, emailSettings *models.EmailNotificationSettings) error {
	// Get current settings
	settings, err := s.GetSettings(userID)
	if err != nil {
		return err
	}

	// Update email settings
	settings.EmailNotifications = *emailSettings
	settings.UpdatedAt = time.Now()

	// Save
	return s.UpdateSettings(userID, settings)
}

// UpdatePushSettings updates push notification settings
func (s *NotificationsService) UpdatePushSettings(userID string, pushSettings *models.PushNotificationSettings) error {
	// Get current settings
	settings, err := s.GetSettings(userID)
	if err != nil {
		return err
	}

	// Update push settings
	settings.PushNotifications = *pushSettings
	settings.UpdatedAt = time.Now()

	// Save
	return s.UpdateSettings(userID, settings)
}

// getDefaultSettings returns default notification settings
func (s *NotificationsService) getDefaultSettings(userID string) *models.NotificationSettings {
	return &models.NotificationSettings{
		UserID: userID,
		EmailNotifications: models.EmailNotificationSettings{
			DailyReport:        true,
			WeeklyReport:       true,
			MonthlyReport:      false,
			UsageAlerts:        true,
			BillingAlerts:      true,
			SecurityAlerts:     true,
			MaintenanceNotices: true,
			NewFeatures:        false,
			ReportTime:         "09:00",
		},
		PushNotifications: models.PushNotificationSettings{
			Enabled:          true,
			ConnectionStatus: true,
			UsageAlerts:      true,
			BillingAlerts:    true,
			SecurityAlerts:   true,
			Sound:            true,
			Badge:            true,
		},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}
