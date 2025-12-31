package geo

import (
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
