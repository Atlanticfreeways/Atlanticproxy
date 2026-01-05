package realtime

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/atlanticproxy/proxy-client/pkg/oxylabs"
)

const DefaultEndpoint = "https://realtime.oxylabs.io/v1/queries"

type Client struct {
	apiKey   string
	endpoint string
	client   *http.Client
}

type Request struct {
	Source      string `json:"source"`
	URL         string `json:"url"`
	GeoLocation string `json:"geo_location,omitempty"`
	Render      string `json:"render,omitempty"`
	UserAgent   string `json:"user_agent_type,omitempty"`
}

type Response struct {
	Results []struct {
		Content    string `json:"content"`
		StatusCode int    `json:"status_code"`
		URL        string `json:"url"`
	} `json:"results"`
}

func NewClient(apiKey string) *Client {
	return &Client{
		apiKey:   apiKey,
		endpoint: DefaultEndpoint,
		client: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

// FetchURL makes a request to the Oxylabs Realtime Crawler API
// It returns a standard http.Response that can be consumed by the caller
func (c *Client) FetchURL(ctx context.Context, targetURL string, config oxylabs.ProxyConfig) (*http.Response, error) {
	reqBody := Request{
		Source:      "universal",
		URL:         targetURL,
		GeoLocation: config.Country,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", c.endpoint, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}

	// If the API call itself failed (e.g. 401 Unauthorized), return the error response
	if resp.StatusCode != http.StatusOK {
		return resp, nil // Caller handles non-200 API responses
	}

	// Parse the success response to extract content
	var realtimeResp Response
	if err := json.NewDecoder(resp.Body).Decode(&realtimeResp); err != nil {
		resp.Body.Close()
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	resp.Body.Close()

	if len(realtimeResp.Results) == 0 {
		return nil, fmt.Errorf("no results found")
	}

	result := realtimeResp.Results[0]

	// Construct a synthetic http.Response from the crawled content
	syntheticResp := &http.Response{
		StatusCode:    result.StatusCode,
		Status:        http.StatusText(result.StatusCode),
		Proto:         "HTTP/1.1",
		ProtoMajor:    1,
		ProtoMinor:    1,
		Body:          io.NopCloser(bytes.NewBufferString(result.Content)),
		ContentLength: int64(len(result.Content)),
		Header:        make(http.Header),
	}

	syntheticResp.Header.Set("Content-Type", "text/html; charset=utf-8") // Approximation
	return syntheticResp, nil
}
