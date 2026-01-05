package geo

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type LocationInfo struct {
	IP       string  `json:"ip"`
	City     string  `json:"city"`
	Country  string  `json:"country"`
	ISP      string  `json:"isp"`
	ASN      string  `json:"asn"`
	Lat      float64 `json:"lat"`
	Lon      float64 `json:"lon"`
	Provider string  `json:"provider"`
}

type Resolver interface {
	Resolve(ctx context.Context) (*LocationInfo, error)
}

// IPInfoResolver uses ipinfo.io (needs token for high volume, but works for basic)
type IPInfoResolver struct{}

func (r *IPInfoResolver) Resolve(ctx context.Context) (*LocationInfo, error) {
	req, _ := http.NewRequestWithContext(ctx, "GET", "https://ipinfo.io/json", nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var data struct {
		IP      string `json:"ip"`
		City    string `json:"city"`
		Country string `json:"country"`
		Org     string `json:"org"`
		Loc     string `json:"loc"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	info := &LocationInfo{
		IP:       data.IP,
		City:     data.City,
		Country:  data.Country,
		ISP:      data.Org,
		Provider: "ipinfo.io",
	}
	fmt.Sscanf(data.Loc, "%f,%f", &info.Lat, &info.Lon)
	return info, nil
}

// IPAPIResolver uses ip-api.com (free, no key needed for low volume)
type IPAPIResolver struct{}

func (r *IPAPIResolver) Resolve(ctx context.Context) (*LocationInfo, error) {
	req, _ := http.NewRequestWithContext(ctx, "GET", "http://ip-api.com/json/", nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var data struct {
		Query   string  `json:"query"`
		City    string  `json:"city"`
		Country string  `json:"country"`
		Isp     string  `json:"isp"`
		As      string  `json:"as"`
		Lat     float64 `json:"lat"`
		Lon     float64 `json:"lon"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	return &LocationInfo{
		IP:       data.Query,
		City:     data.City,
		Country:  data.Country,
		ISP:      data.Isp,
		ASN:      data.As,
		Lat:      data.Lat,
		Lon:      data.Lon,
		Provider: "ip-api.com",
	}, nil
}

// MultiResolver implements fallback logic for stability
type MultiResolver struct {
	resolvers []Resolver
}

func NewMultiResolver() *MultiResolver {
	return &MultiResolver{
		resolvers: []Resolver{
			&IPAPIResolver{},
			&IPInfoResolver{},
		},
	}
}

func (m *MultiResolver) GetCurrentLocation(ctx context.Context) (*LocationInfo, error) {
	var lastErr error
	for _, r := range m.resolvers {
		ctxWithTimeout, cancel := context.WithTimeout(ctx, 5*time.Second)
		info, err := r.Resolve(ctxWithTimeout)
		cancel()
		if err == nil {
			return info, nil
		}
		lastErr = err
	}
	return nil, fmt.Errorf("all geo resolvers failed, last error: %v", lastErr)
}
