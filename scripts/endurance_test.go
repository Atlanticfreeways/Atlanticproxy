package main

import (
	"fmt"
	"net/http"
	"net/url"
	"os"
	"time"
)

const (
	ProxyURL     = "http://127.0.0.1:8080"
	TestURL      = "https://httpbin.org/ip"
	TestInterval = 5 * time.Second
	LogFile      = "endurance_test.csv"
)

func main() {
	proxyURL, _ := url.Parse(ProxyURL)
	transport := &http.Transport{Proxy: http.ProxyURL(proxyURL)}
	client := &http.Client{Transport: transport, Timeout: 10 * time.Second}

	file, err := os.OpenFile(LogFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Printf("Failed to open log file: %v\n", err)
		return
	}
	defer file.Close()

	if stat, _ := file.Stat(); stat.Size() == 0 {
		file.WriteString("timestamp,status,latency_ms,error\n")
	}

	fmt.Printf("Starting Endurance Test hitting %s via %s...\n", TestURL, ProxyURL)
	fmt.Printf("Logging results to %s\n", LogFile)

	for {
		start := time.Now()
		resp, err := client.Get(TestURL)
		latency := time.Since(start).Milliseconds()

		timestamp := time.Now().Format(time.RFC3339)
		status := "FAIL"
		errStr := ""

		if err == nil {
			if resp.StatusCode == 200 {
				status = "SUCCESS"
			} else {
				status = fmt.Sprintf("HTTP_%d", resp.StatusCode)
			}
			resp.Body.Close()
		} else {
			errStr = err.Error()
		}

		line := fmt.Sprintf("%s,%s,%d,%s\n", timestamp, status, latency, errStr)
		file.WriteString(line)

		fmt.Printf("[%s] %s | Latency: %dms | %s\n", timestamp, status, latency, errStr)

		time.Sleep(TestInterval)
	}
}
