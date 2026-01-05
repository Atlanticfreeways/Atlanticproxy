package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

const (
	apiURL   = "http://127.0.0.1:8082"
	proxyURL = "http://127.0.0.1:8080"
)

type RotationConfig struct {
	Mode    string `json:"mode"`
	Country string `json:"country,omitempty"`
	City    string `json:"city,omitempty"`
	State   string `json:"state,omitempty"`
}

func main() {
	fmt.Println("🚀 Starting Rotation End-to-End Test")

	// Helper client for API
	apiClient := &http.Client{Timeout: 5 * time.Second}

	// Helper client for Proxy
	proxyUrl, _ := url.Parse(proxyURL)
	proxyClient := &http.Client{
		Transport: &http.Transport{
			Proxy:           http.ProxyURL(proxyUrl),
			TLSClientConfig: nil, // If needed in future
		},
		Timeout: 30 * time.Second,
	}

	// 1. Test Per-Request Rotation
	fmt.Println("\n🧪 Test 1: Per-Request Rotation")
	setMode(apiClient, "per-request", "")

	ips := make(map[string]int)
	for i := 1; i <= 5; i++ {
		ip := getIP(proxyClient)
		if ip == "" {
			continue
		}
		fmt.Printf("   Request %d: %s\n", i, ip)
		ips[ip]++
		time.Sleep(500 * time.Millisecond)
	}

	if len(ips) > 1 {
		fmt.Println("   ✅ PASS: Multiple IPs detected")
	} else {
		fmt.Println("   ❌ FAIL: Only 1 IP detected (might be unlucky, but unlikely for 5 reqs)")
	}

	// 2. Test Sticky Session
	fmt.Println("\n🧪 Test 2: Sticky Session (1min)")
	setMode(apiClient, "sticky-1min", "")
	// Force new session to start clean
	forceRotation(apiClient)

	firstIP := ""
	failSticky := false
	for i := 1; i <= 5; i++ {
		ip := getIP(proxyClient)
		if ip == "" {
			continue
		}
		fmt.Printf("   Request %d: %s\n", i, ip)

		if i == 1 {
			firstIP = ip
		} else {
			if ip != firstIP {
				failSticky = true
				fmt.Printf("   ❌ Mismatch! Expected %s, got %s\n", firstIP, ip)
			}
		}
		time.Sleep(500 * time.Millisecond)
	}

	if !failSticky && firstIP != "" {
		fmt.Println("   ✅ PASS: IP remained sticky")
	} else {
		fmt.Println("   ❌ FAIL: IP changed during sticky session")
	}

	// Test Force Rotation
	fmt.Println("   ... Testing Force Rotation")
	forceRotation(apiClient)
	newIP := getIP(proxyClient)
	fmt.Printf("   Post-Force IP: %s\n", newIP)
	if newIP != firstIP {
		fmt.Println("   ✅ PASS: Force rotation changed IP")
	} else {
		fmt.Println("   ⚠️ WARN: IP same after force rotation (could be coincidence)")
	}

	// 3. Test Geo Targeting (US)
	fmt.Println("\n🧪 Test 3: Geographic Targeting (US)")
	setMode(apiClient, "sticky-10min", "US") // Use sticky to ensure we keep the US session
	forceRotation(apiClient)

	geo := getGeo(proxyClient)
	fmt.Printf("   Detected Country: %s\n", geo)
	if geo == "US" || geo == "United States" {
		fmt.Println("   ✅ PASS: Correct country detected")
	} else {
		fmt.Printf("   ❌ FAIL: Expected US, got %s\n", geo)
	}

	// 4. Test Geo Targeting (DE)
	fmt.Println("\n🧪 Test 4: Geographic Targeting (DE)")
	setMode(apiClient, "sticky-10min", "DE")
	forceRotation(apiClient)

	geoDE := getGeo(proxyClient)
	fmt.Printf("   Detected Country: %s\n", geoDE)
	if geoDE == "DE" || geoDE == "Germany" {
		fmt.Println("   ✅ PASS: Correct country detected")
	} else {
		fmt.Printf("   ❌ FAIL: Expected DE, got %s\n", geoDE)
	}

	fmt.Println("\n🏁 Tests Completed")
}

func setMode(client *http.Client, mode, country string) {
	cfg := RotationConfig{
		Mode:    mode,
		Country: country,
	}
	data, _ := json.Marshal(cfg)

	// Create request
	req, _ := http.NewRequest("POST", apiURL+"/api/rotation/config", bytes.NewBuffer(data))
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("   🔥 API Error: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Printf("   🔥 API Failed: Status %d\n", resp.StatusCode)
	}
}

func forceRotation(client *http.Client) {
	req, _ := http.NewRequest("POST", apiURL+"/api/rotation/session/new", nil)
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("   🔥 API Error: %v\n", err)
		return
	}
	defer resp.Body.Close()
}

func getIP(client *http.Client) string {
	resp, err := client.Get("http://ip-api.com/json/?fields=query") // simpler endpoint
	if err != nil {
		fmt.Printf("   ⚠️ Proxy Error: %v\n", err)
		return ""
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		fmt.Printf("   ⚠️ Proxy Status: %d, Body: %s\n", resp.StatusCode, string(body))
		return ""
	}

	var res map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&res)
	if ip, ok := res["query"].(string); ok {
		return ip
	}
	fmt.Println("   ⚠️ Proxy: JSON parse failed or missing 'query'")
	return ""
}

func getGeo(client *http.Client) string {
	resp, err := client.Get("http://ip-api.com/json/?fields=countryCode")
	if err != nil {
		fmt.Printf("   ⚠️ Proxy Error: %v\n", err)
		return ""
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		fmt.Printf("   ⚠️ Proxy Status: %d, Body: %s\n", resp.StatusCode, string(body))
		return ""
	}

	var res map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&res)
	if cc, ok := res["countryCode"].(string); ok {
		return cc
	}
	fmt.Println("   ⚠️ Proxy: JSON parse failed or missing 'countryCode'")
	return ""
}
