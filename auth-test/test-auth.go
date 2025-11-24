package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"time"
)

func main() {
	fmt.Println("🧪 ATLANTIC PROXY - Authentication Test")
	fmt.Println("======================================")

	// Test 1: Build validation
	fmt.Println("\n1️⃣  Testing Auth System Build...")
	if err := testBuild(); err != nil {
		fmt.Printf("❌ Build failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Auth system build successful")

	// Test 2: Server startup and API
	fmt.Println("\n2️⃣  Testing Auth API...")
	if err := testAPI(); err != nil {
		fmt.Printf("❌ API test failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Auth API functional")

	fmt.Println("\n🎉 AUTHENTICATION TESTS PASSED!")
	fmt.Println("User Authentication & Account Management ready!")
}

func testBuild() error {
	cmd := exec.Command("go", "build", "-o", "../bin/auth-system", "../auth-system.go")
	return cmd.Run()
}

func testAPI() error {
	// Start auth system in background
	cmd := exec.Command("go", "run", "../auth-system.go")
	cmd.Dir = ".."
	
	if err := cmd.Start(); err != nil {
		return err
	}
	
	// Wait for server to start
	time.Sleep(2 * time.Second)
	
	// Test login
	loginData := map[string]string{
		"email":    "demo@atlanticproxy.com",
		"password": "demo123",
	}
	
	jsonData, _ := json.Marshal(loginData)
	resp, err := http.Post("http://localhost:8081/auth/login", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		cmd.Process.Kill()
		return err
	}
	resp.Body.Close()
	
	if resp.StatusCode != 200 {
		cmd.Process.Kill()
		return fmt.Errorf("login failed with status: %d", resp.StatusCode)
	}
	
	// Clean up
	cmd.Process.Kill()
	return nil
}