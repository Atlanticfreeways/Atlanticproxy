package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"atlanticproxy/backend/internal/models"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type ProxyService struct {
	db *sqlx.DB
}

func NewProxyService(db *sqlx.DB) *ProxyService {
	return &ProxyService{db: db}
}

// GetLocations retrieves proxy locations, optionally filtered by region
func (s *ProxyService) GetLocations(region string) ([]*models.ProxyLocation, error) {
	var locations []*models.ProxyLocation
	query := `SELECT id, country, city, region, servers, latency, uptime, available FROM proxy_locations WHERE available = true`

	if region != "" {
		query += ` AND region = $1`
		err := s.db.Select(&locations, query, region)
		if err != nil {
			return nil, err
		}
	} else {
		err := s.db.Select(&locations, query)
		if err != nil {
			return nil, err
		}
	}

	return locations, nil
}

// SaveConfiguration saves proxy configuration
func (s *ProxyService) SaveConfiguration(userID string, config *models.ProxyConfiguration) (*models.ProxyConfiguration, error) {
	config.ID = fmt.Sprintf("%d", time.Now().Unix())
	config.UserID = userID
	config.CreatedAt = time.Now()
	config.UpdatedAt = time.Now()

	locationsJSON, err := json.Marshal(config.Locations)
	if err != nil {
		return nil, err
	}

	query := `
		INSERT INTO proxy_configurations (id, user_id, protocol, isp_tier, locations, load_balancing_mode, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (user_id) DO UPDATE SET
			protocol = $3,
			isp_tier = $4,
			locations = $5,
			load_balancing_mode = $6,
			updated_at = $8
	`

	_, err = s.db.Exec(query, config.ID, config.UserID, config.Protocol, config.ISPTier, locationsJSON, config.LoadBalancingMode, config.CreatedAt, config.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return config, nil
}

// GetConfiguration retrieves current proxy configuration
func (s *ProxyService) GetConfiguration(userID string) (*models.ProxyConfiguration, error) {
	var config models.ProxyConfiguration
	var locationsJSON []byte

	query := `SELECT id, user_id, protocol, isp_tier, locations, load_balancing_mode, created_at, updated_at FROM proxy_configurations WHERE user_id = $1`
	err := s.db.QueryRow(query, userID).Scan(&config.ID, &config.UserID, &config.Protocol, &config.ISPTier, &locationsJSON, &config.LoadBalancingMode, &config.CreatedAt, &config.UpdatedAt)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(locationsJSON, &config.Locations)
	if err != nil {
		return nil, err
	}

	return &config, nil
}

// UpdateSessionSettings updates session persistence settings
func (s *ProxyService) UpdateSessionSettings(userID string, settings *models.SessionSettings) error {
	settings.UserID = userID
	settings.UpdatedAt = time.Now()

	query := `
		INSERT INTO session_settings (user_id, enabled, session_duration, session_timeout, ip_stickiness, cookie_preservation, header_preservation, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (user_id) DO UPDATE SET
			enabled = $2,
			session_duration = $3,
			session_timeout = $4,
			ip_stickiness = $5,
			cookie_preservation = $6,
			header_preservation = $7,
			updated_at = $8
	`

	_, err := s.db.Exec(query, settings.UserID, settings.Enabled, settings.SessionDuration, settings.SessionTimeout, settings.IPStickiness, settings.CookiePreservation, settings.HeaderPreservation, settings.UpdatedAt)
	return err
}

// UpdateCustomHeaders updates custom HTTP headers
func (s *ProxyService) UpdateCustomHeaders(userID string, headers []*models.CustomHeader) error {
	tx, err := s.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Delete existing headers
	_, err = tx.Exec(`DELETE FROM custom_headers WHERE user_id = $1`, userID)
	if err != nil {
		return err
	}

	// Insert new headers
	for _, header := range headers {
		header.UserID = userID
		header.CreatedAt = time.Now()
		header.UpdatedAt = time.Now()

		query := `
			INSERT INTO custom_headers (user_id, name, value, enabled, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6)
		`
		_, err := tx.Exec(query, header.UserID, header.Name, header.Value, header.Enabled, header.CreatedAt, header.UpdatedAt)
		if err != nil {
			return err
		}
	}

	return tx.Commit().Error
}

// UpdateThrottlingSettings updates request throttling settings
func (s *ProxyService) UpdateThrottlingSettings(userID string, settings *models.ThrottlingSettings) error {
	settings.UserID = userID
	settings.UpdatedAt = time.Now()

	query := `
		INSERT INTO throttling_settings (user_id, enabled, requests_per_second, burst_size, delay_between_requests, connection_limit, bandwidth_limit, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (user_id) DO UPDATE SET
			enabled = $2,
			requests_per_second = $3,
			burst_size = $4,
			delay_between_requests = $5,
			connection_limit = $6,
			bandwidth_limit = $7,
			updated_at = $8
	`

	_, err := s.db.Exec(query, settings.UserID, settings.Enabled, settings.RequestsPerSecond, settings.BurstSize, settings.DelayBetweenRequests, settings.ConnectionLimit, settings.BandwidthLimit, settings.UpdatedAt)
	return err
}

// UpdateProxyAuthentication updates proxy authentication
func (s *ProxyService) UpdateProxyAuthentication(userID string, auth *models.ProxyAuthentication) error {
	auth.UserID = userID
	auth.UpdatedAt = time.Now()

	query := `
		INSERT INTO proxy_authentication (user_id, username, password, auth_method, updated_at)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (user_id) DO UPDATE SET
			username = $2,
			password = $3,
			auth_method = $4,
			updated_at = $5
	`

	_, err := s.db.Exec(query, auth.UserID, auth.Username, auth.Password, auth.AuthMethod, auth.UpdatedAt)
	return err
}
