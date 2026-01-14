package geo

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type Location struct {
	IP          string  `json:"query"`
	Country     string  `json:"country"`
	CountryCode string  `json:"countryCode"`
	Region      string  `json:"regionName"`
	City        string  `json:"city"`
	Lat         float64 `json:"lat"`
	Lon         float64 `json:"lon"`
	ISP         string  `json:"isp"`
}

var cache = make(map[string]Location)
var lastFetch time.Time

func GetLocation(ip string) (*Location, error) {
	if loc, ok := cache[ip]; ok {
		return &loc, nil
	}

	resp, err := http.Get(fmt.Sprintf("http://ip-api.com/json/%s", ip))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var loc Location
	if err := json.NewDecoder(resp.Body).Decode(&loc); err != nil {
		return nil, err
	}

	cache[ip] = loc
	return &loc, nil
}

func GetPublicIP() (string, error) {
	resp, err := http.Get("https://api.ipify.org")
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var ip string
	_, err = fmt.Fscan(resp.Body, &ip)
	return ip, err
}

// GeoInfo contains detailed geolocation information
type GeoInfo struct {
	IP      string
	Country string
	City    string
	ISP     string
	ASN     string
	Lat     float64
	Lon     float64
}

// MultiResolver provides geolocation resolution with fallback support
type MultiResolver struct {
	client *http.Client
}

// NewMultiResolver creates a new MultiResolver instance
func NewMultiResolver() *MultiResolver {
	return &MultiResolver{
		client: &http.Client{Timeout: 10 * time.Second},
	}
}

// GetCurrentLocation fetches the current public IP's geolocation
func (m *MultiResolver) GetCurrentLocation(ctx context.Context) (*GeoInfo, error) {
	// Get public IP
	ip, err := GetPublicIP()
	if err != nil {
		return nil, fmt.Errorf("failed to get public IP: %w", err)
	}

	// Get location for IP
	loc, err := GetLocation(ip)
	if err != nil {
		return nil, fmt.Errorf("failed to get location: %w", err)
	}

	return &GeoInfo{
		IP:      loc.IP,
		Country: loc.Country,
		City:    loc.City,
		ISP:     loc.ISP,
		ASN:     "", // Not provided by ip-api.com free tier
		Lat:     loc.Lat,
		Lon:     loc.Lon,
	}, nil
}
