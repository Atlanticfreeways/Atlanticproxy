package brightdata

import (
	"fmt"
	"net/http"
	"net/url"
)

type Client struct {
	Username string
	Password string
	Host     string
	Port     int
}

func NewClient(username, password string) *Client {
	return &Client{
		Username: username,
		Password: password,
		Host:     "brd.superproxy.io",
		Port:     22225,
	}
}

func (c *Client) GetProxyURL() string {
	return fmt.Sprintf("http://%s:%s@%s:%d",
		c.Username,
		c.Password,
		c.Host,
		c.Port,
	)
}

func (c *Client) GetProxyURLWithSession(sessionID string) string {
	username := fmt.Sprintf("%s-session-%s", c.Username, sessionID)
	return fmt.Sprintf("http://%s:%s@%s:%d",
		username,
		c.Password,
		c.Host,
		c.Port,
	)
}

func (c *Client) GetProxyURLWithCountry(country string) string {
	username := fmt.Sprintf("%s-country-%s", c.Username, country)
	return fmt.Sprintf("http://%s:%s@%s:%d",
		username,
		c.Password,
		c.Host,
		c.Port,
	)
}

func (c *Client) GetProxyURLWithCity(country, city string) string {
	username := fmt.Sprintf("%s-country-%s-city-%s", c.Username, country, city)
	return fmt.Sprintf("http://%s:%s@%s:%d",
		username,
		c.Password,
		c.Host,
		c.Port,
	)
}

func (c *Client) GetHTTPTransport() (*http.Transport, error) {
	proxyURL, err := url.Parse(c.GetProxyURL())
	if err != nil {
		return nil, fmt.Errorf("invalid proxy URL: %w", err)
	}

	return &http.Transport{
		Proxy: http.ProxyURL(proxyURL),
	}, nil
}

func (c *Client) GetHTTPTransportWithSession(sessionID string) (*http.Transport, error) {
	proxyURL, err := url.Parse(c.GetProxyURLWithSession(sessionID))
	if err != nil {
		return nil, fmt.Errorf("invalid proxy URL: %w", err)
	}

	return &http.Transport{
		Proxy: http.ProxyURL(proxyURL),
	}, nil
}
