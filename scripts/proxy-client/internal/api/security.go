package api

import (
	"context"
	"net/http"
	"time"

	"github.com/atlanticproxy/proxy-client/internal/validator"
	"github.com/gin-gonic/gin"
)

// SecurityStatus represents the current security posture of the user
type SecurityStatus struct {
	AnonymityScore     int      `json:"anonymity_score"` // 0-100
	IPLeakDetected     bool     `json:"ip_leak_detected"`
	DNSLeakDetected    bool     `json:"dns_leak_detected"`
	WebRTCLeakDetected bool     `json:"webrtc_leak_detected"`
	StrictKillswitch   bool     `json:"strict_killswitch"`
	DetectedDNS        []string `json:"detected_dns"`
	Message            string   `json:"message"`
}

func (s *Server) handleGetSecurityStatus(c *gin.Context) {
	s.mu.RLock()
	strictKs := false // Default to false if nil
	if s.killswitch != nil {
		// We'd access a getter here if exposed, for now assume false or track it
		// Ideally Guardian exposes IsEnabled()
	}
	proxyIP := s.status.IPAddress
	connected := s.status.Connected
	s.mu.RUnlock()

	status := SecurityStatus{
		AnonymityScore:   0,
		StrictKillswitch: strictKs,
		DetectedDNS:      []string{}, // Cleared mock
	}

	if !connected {
		status.Message = "Proxy disconnected. You are exposed."
		status.AnonymityScore = 0
		status.IPLeakDetected = true
		c.JSON(http.StatusOK, status)
		return
	}

	// Calculate Score
	score := 100
	if proxyIP == "" {
		score -= 50 // No IP detected
	}

	// Use Leak Detector
	ld := validator.NewLeakDetector(proxyIP, nil)

	timeoutCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	results, err := ld.RunFullCheck(timeoutCtx)
	if err != nil {
		s.logger.Warnf("Leak check failed: %v", err)
	}

	var leakDetails []string

	for _, res := range results {
		if res.IsLeaking {
			score -= 30
			leakDetails = append(leakDetails, res.Details)

			if res.LeakType == "IP" {
				status.IPLeakDetected = true
			} else if res.LeakType == "DNS" {
				status.DNSLeakDetected = true
				status.DetectedDNS = append(status.DetectedDNS, res.DetectedIPs...)
			}
		}
	}

	// Enforce min score
	if score < 0 {
		score = 0
	}
	status.AnonymityScore = score

	if status.IPLeakDetected {
		status.Message = "Critical: IP Leak Detected! " + leakDetails[0]
	} else if status.DNSLeakDetected {
		status.Message = "Warning: DNS Traffic leaking. " + leakDetails[0]
	} else {
		status.Message = "You are anonymous. No leaks detected."
	}

	c.JSON(http.StatusOK, status)
}
