package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type ProxyClientService struct {
	clientURL string
	client    *http.Client
}

type OxylabsCredentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Endpoint string `json:"endpoint"`
}

type ProxyStatus struct {
	Connected   bool   `json:"connected"`
	IPAddress   string `json:"ip_address,omitempty"`
	Location    string `json:"location,omitempty"`
	LastCheck   string `json:"last_check,omitempty"`
	Error       string `json:"error,omitempty"`
}

func NewProxyClientService() *ProxyClientService {
	return &ProxyClientService{
		clientURL: "http://localhost:8082", // Proxy client HTTP interface
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (p *ProxyClientService) Connect(credentials OxylabsCredentials) error {
	credentialsJSON, err := json.Marshal(credentials)
	if err != nil {
		return fmt.Errorf("failed to marshal credentials: %w", err)
	}

	resp, err := p.client.Post(p.clientURL+"/connect", "application/json", 
		bytes.NewBuffer(credentialsJSON))
	if err != nil {
		return fmt.Errorf("failed to connect to proxy client: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("proxy client returned status: %d", resp.StatusCode)
	}

	return nil
}

func (p *ProxyClientService) GetStatus() (*ProxyStatus, error) {
	resp, err := p.client.Get(p.clientURL + "/status")
	if err != nil {
		return nil, fmt.Errorf("failed to get proxy status: %w", err)
	}
	defer resp.Body.Close()

	var status ProxyStatus
	if err := json.NewDecoder(resp.Body).Decode(&status); err != nil {
		return nil, fmt.Errorf("failed to decode status: %w", err)
	}

	return &status, nil
}

func (p *ProxyClientService) Disconnect() error {
	resp, err := p.client.Post(p.clientURL+"/disconnect", "application/json", nil)
	if err != nil {
		return fmt.Errorf("failed to disconnect proxy: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("proxy client returned status: %d", resp.StatusCode)
	}

	return nil
}

func (p *ProxyClientService) SetKillSwitch(enabled bool) error {
	url := fmt.Sprintf("%s/killswitch?enabled=%t", p.clientURL, enabled)
	resp, err := p.client.Post(url, "application/json", nil)
	if err != nil {
		return fmt.Errorf("failed to set kill switch: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("proxy client returned status: %d", resp.StatusCode)
	}

	return nil
}

func (p *ProxyClientService) GetKillSwitchStatus() (bool, error) {
	resp, err := p.client.Get(p.clientURL + "/killswitch")
	if err != nil {
		return false, fmt.Errorf("failed to get kill switch status: %w", err)
	}
	defer resp.Body.Close()

	var result struct {
		Enabled bool `json:"enabled"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return false, fmt.Errorf("failed to decode response: %w", err)
	}

	return result.Enabled, nil
}