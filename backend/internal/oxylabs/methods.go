package oxylabs

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

func (c *Client) CreateSession(userID int, geoLocation string) (*SessionResponse, error) {
	req := SessionRequest{
		Source:      "universal",
		URL:         "https://httpbin.org/ip",
		SessionID:   userID,
		GeoLocation: geoLocation,
	}

	return c.makeRequest(req)
}

func (c *Client) TestConnection() error {
	req := SessionRequest{
		Source: "universal",
		URL:    "https://httpbin.org/ip",
	}

	_, err := c.makeRequest(req)
	return err
}

func (c *Client) makeRequest(req SessionRequest) (*SessionResponse, error) {
	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	httpReq, err := http.NewRequest("POST", c.BaseURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	httpReq.SetBasicAuth(c.Username, c.Password)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("oxylabs API error: %d", resp.StatusCode)
	}

	var sessionResp SessionResponse
	if err := json.NewDecoder(resp.Body).Decode(&sessionResp); err != nil {
		return nil, err
	}

	return &sessionResp, nil
}