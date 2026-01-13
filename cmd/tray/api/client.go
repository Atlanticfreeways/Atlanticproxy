package api

import (
	"encoding/json"
	"net/http"
	"time"
)

type ProxyStatus struct {
	Connected  bool   `json:"connected"`
	Location   string `json:"location"`
	IP         string `json:"ip"`
	Latency    int    `json:"latency"`
	KillSwitch bool   `json:"kill_switch"`
}

type Client struct {
	BaseURL    string
	HttpClient *http.Client
}

func NewClient(baseURL string) *Client {
	return &Client{
		BaseURL: baseURL,
		HttpClient: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

func (c *Client) GetStatus() (*ProxyStatus, error) {
	resp, err := c.HttpClient.Get(c.BaseURL + "/health")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var status ProxyStatus
	if err := json.NewDecoder(resp.Body).Decode(&status); err != nil {
		return nil, err
	}

	return &status, nil
}
