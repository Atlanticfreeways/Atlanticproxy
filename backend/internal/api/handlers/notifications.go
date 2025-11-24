package handlers

import (
	"net/http"

	"atlanticproxy/backend/internal/models"
	"atlanticproxy/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type NotificationsHandler struct {
	notificationsService *services.NotificationsService
}

func NewNotificationsHandler(notificationsService *services.NotificationsService) *NotificationsHandler {
	return &NotificationsHandler{
		notificationsService: notificationsService,
	}
}

// GetSettings retrieves notification settings
// GET /api/notifications/settings
func (h *NotificationsHandler) GetSettings(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	settings, err := h.notificationsService.GetSettings(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, settings)
}

// UpdateSettings updates all notification settings
// PUT /api/notifications/settings
func (h *NotificationsHandler) UpdateSettings(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req struct {
		EmailNotifications struct {
			DailyReport        bool   `json:"dailyReport"`
			WeeklyReport       bool   `json:"weeklyReport"`
			MonthlyReport      bool   `json:"monthlyReport"`
			UsageAlerts        bool   `json:"usageAlerts"`
			BillingAlerts      bool   `json:"billingAlerts"`
			SecurityAlerts     bool   `json:"securityAlerts"`
			MaintenanceNotices bool   `json:"maintenanceNotices"`
			NewFeatures        bool   `json:"newFeatures"`
			ReportTime         string `json:"reportTime"`
		} `json:"emailNotifications"`
		PushNotifications struct {
			Enabled           bool `json:"enabled"`
			ConnectionStatus  bool `json:"connectionStatus"`
			UsageAlerts       bool `json:"usageAlerts"`
			BillingAlerts     bool `json:"billingAlerts"`
			SecurityAlerts    bool `json:"securityAlerts"`
			Sound             bool `json:"sound"`
			Badge             bool `json:"badge"`
		} `json:"pushNotifications"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	settings := &models.NotificationSettings{
		EmailNotifications: models.EmailNotificationSettings{
			DailyReport:        req.EmailNotifications.DailyReport,
			WeeklyReport:       req.EmailNotifications.WeeklyReport,
			MonthlyReport:      req.EmailNotifications.MonthlyReport,
			UsageAlerts:        req.EmailNotifications.UsageAlerts,
			BillingAlerts:      req.EmailNotifications.BillingAlerts,
			SecurityAlerts:     req.EmailNotifications.SecurityAlerts,
			MaintenanceNotices: req.EmailNotifications.MaintenanceNotices,
			NewFeatures:        req.EmailNotifications.NewFeatures,
			ReportTime:         req.EmailNotifications.ReportTime,
		},
		PushNotifications: models.PushNotificationSettings{
			Enabled:          req.PushNotifications.Enabled,
			ConnectionStatus: req.PushNotifications.ConnectionStatus,
			UsageAlerts:      req.PushNotifications.UsageAlerts,
			BillingAlerts:    req.PushNotifications.BillingAlerts,
			SecurityAlerts:   req.PushNotifications.SecurityAlerts,
			Sound:            req.PushNotifications.Sound,
			Badge:            req.PushNotifications.Badge,
		},
	}

	if err := h.notificationsService.UpdateSettings(userID, settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// UpdateEmailSettings updates email notification settings
// PUT /api/notifications/email-settings
func (h *NotificationsHandler) UpdateEmailSettings(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req struct {
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

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	emailSettings := models.EmailNotificationSettings{
		DailyReport:        req.DailyReport,
		WeeklyReport:       req.WeeklyReport,
		MonthlyReport:      req.MonthlyReport,
		UsageAlerts:        req.UsageAlerts,
		BillingAlerts:      req.BillingAlerts,
		SecurityAlerts:     req.SecurityAlerts,
		MaintenanceNotices: req.MaintenanceNotices,
		NewFeatures:        req.NewFeatures,
		ReportTime:         req.ReportTime,
	}

	if err := h.notificationsService.UpdateEmailSettings(userID, &emailSettings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// UpdatePushSettings updates push notification settings
// PUT /api/notifications/push-settings
func (h *NotificationsHandler) UpdatePushSettings(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req struct {
		Enabled          bool `json:"enabled"`
		ConnectionStatus bool `json:"connectionStatus"`
		UsageAlerts      bool `json:"usageAlerts"`
		BillingAlerts    bool `json:"billingAlerts"`
		SecurityAlerts   bool `json:"securityAlerts"`
		Sound            bool `json:"sound"`
		Badge            bool `json:"badge"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	pushSettings := models.PushNotificationSettings{
		Enabled:          req.Enabled,
		ConnectionStatus: req.ConnectionStatus,
		UsageAlerts:      req.UsageAlerts,
		BillingAlerts:    req.BillingAlerts,
		SecurityAlerts:   req.SecurityAlerts,
		Sound:            req.Sound,
		Badge:            req.Badge,
	}

	if err := h.notificationsService.UpdatePushSettings(userID, &pushSettings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
