package oxylabs

type Client struct {
	Username string
	Password string
	BaseURL  string
}

type SessionRequest struct {
	Source      string `json:"source"`
	URL         string `json:"url"`
	SessionID   int    `json:"session_id,omitempty"`
	GeoLocation string `json:"geo_location,omitempty"`
}

type SessionResponse struct {
	Results []struct {
		Content   string `json:"content"`
		CreatedAt string `json:"created_at"`
		UpdatedAt string `json:"updated_at"`
		Page      int    `json:"page"`
		URL       string `json:"url"`
		JobID     string `json:"job_id"`
		StatusCode int   `json:"status_code"`
	} `json:"results"`
}

type ProxyEndpoint struct {
	Host     string `json:"host"`
	Port     int    `json:"port"`
	Username string `json:"username"`
	Password string `json:"password"`
	Type     string `json:"type"`
}

func NewClient(username, password string) *Client {
	return &Client{
		Username: username,
		Password: password,
		BaseURL:  "https://realtime.oxylabs.io/v1/queries",
	}
}

func (c *Client) GetProxyEndpoints() []ProxyEndpoint {
	return []ProxyEndpoint{
		{
			Host:     "pr.oxylabs.io",
			Port:     7777,
			Username: c.Username,
			Password: c.Password,
			Type:     "residential",
		},
		{
			Host:     "pr.oxylabs.io", 
			Port:     8000,
			Username: c.Username,
			Password: c.Password,
			Type:     "datacenter",
		},
	}
}