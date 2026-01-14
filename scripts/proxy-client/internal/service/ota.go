package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"runtime"
	"time"

	"github.com/sirupsen/logrus"
)

type UpdateInfo struct {
	Version     string `json:"version"`
	URL         string `json:"url"`
	Checksum    string `json:"checksum"`
	ReleaseDate string `json:"release_date"`
}

type OTAManager struct {
	currentVersion string
	updateURL      string
	logger         *logrus.Logger
}

func NewOTAManager(currentVersion string, logger *logrus.Logger) *OTAManager {
	return &OTAManager{
		currentVersion: currentVersion,
		updateURL:      "https://api.atlanticproxy.com/v1/updates/check",
		logger:         logger,
	}
}

func (m *OTAManager) CheckForUpdates(ctx context.Context) (*UpdateInfo, error) {
	client := &http.Client{Timeout: 10 * time.Second}

	url := fmt.Sprintf("%s?version=%s&os=%s&arch=%s", m.updateURL, m.currentVersion, runtime.GOOS, runtime.GOARCH)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNoContent {
		return nil, nil // Up to date
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("update server returned status %d", resp.StatusCode)
	}

	var info UpdateInfo
	if err := json.NewDecoder(resp.Body).Decode(&info); err != nil {
		return nil, err
	}

	return &info, nil
}

// VerifyChecksum verifies the checksum of a downloaded file
func (m *OTAManager) VerifyChecksum(filePath, expectedChecksum string) error {
	// Placeholder for actual implementation
	// In production, this would compute SHA256 of the file and compare
	return nil
}
