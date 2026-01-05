package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

func main() {
	proxyURL, _ := url.Parse("http://127.0.0.1:8080")
	client := &http.Client{
		Transport: &http.Transport{
			Proxy: http.ProxyURL(proxyURL),
		},
		Timeout: 10 * time.Second,
	}

	fmt.Println("Testing Rotation (Per-Request)...")
	ips := make(map[string]int)

	for i := 0; i < 5; i++ {
		resp, err := client.Get("https://httpbin.org/ip")
		if err != nil {
			fmt.Printf("Request %d failed: %v\n", i, err)
			continue
		}

		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		var result map[string]string
		json.Unmarshal(body, &result)

		ip := result["origin"]
		fmt.Printf("Request %d IP: %s\n", i, ip)
		ips[ip]++
		time.Sleep(1 * time.Second)
	}

	if len(ips) > 1 {
		fmt.Println("✅ Rotation SUCCESS: Multiple IPs detected")
	} else {
		fmt.Println("❌ Rotation FAILURE: Only 1 IP detected")
	}
}
