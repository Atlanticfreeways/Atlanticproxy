package main

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"time"
)

func main() {
	fmt.Println("🧪 ATLANTIC PROXY - Dashboard Test")
	fmt.Println("=================================")

	// Test 1: Build validation
	fmt.Println("\n1️⃣  Testing Dashboard Build...")
	if err := testBuild(); err != nil {
		fmt.Printf("❌ Build failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Dashboard build successful")

	// Test 2: Server startup
	fmt.Println("\n2️⃣  Testing Dashboard Server...")
	if err := testServer(); err != nil {
		fmt.Printf("❌ Server test failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Dashboard server functional")

	// Test 3: API endpoints
	fmt.Println("\n3️⃣  Testing API Endpoints...")
	if err := testAPI(); err != nil {
		fmt.Printf("❌ API test failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ API endpoints working")

	fmt.Println("\n🎉 DASHBOARD TESTS PASSED!")
	fmt.Println("Web Dashboard is ready!")
}

func testBuild() error {
	cmd := exec.Command("go", "build", "-o", "../bin/dashboard", "../dashboard.go")
	return cmd.Run()
}

func testServer() error {
	// Start dashboard in background
	cmd := exec.Command("go", "run", "../dashboard.go")
	cmd.Dir = ".."
	
	if err := cmd.Start(); err != nil {
		return err
	}
	
	// Wait for server to start
	time.Sleep(2 * time.Second)
	
	// Test if server is responding
	resp, err := http.Get("http://localhost:8080")
	if err != nil {
		cmd.Process.Kill()
		return err
	}
	resp.Body.Close()
	
	// Clean up
	cmd.Process.Kill()
	return nil
}

func testAPI() error {
	// Start dashboard in background
	cmd := exec.Command("go", "run", "../dashboard.go")
	cmd.Dir = ".."
	
	if err := cmd.Start(); err != nil {
		return err
	}
	
	// Wait for server to start
	time.Sleep(2 * time.Second)
	
	// Test stats API
	resp, err := http.Get("http://localhost:8080/api/stats")
	if err != nil {
		cmd.Process.Kill()
		return err
	}
	resp.Body.Close()
	
	// Clean up
	cmd.Process.Kill()
	return nil
}