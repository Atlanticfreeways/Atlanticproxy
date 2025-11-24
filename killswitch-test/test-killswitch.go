package main

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"time"
)

func main() {
	fmt.Println("🧪 ATLANTIC PROXY - Enhanced Kill Switch Test")
	fmt.Println("============================================")

	// Test 1: Basic functionality
	fmt.Println("\n1️⃣  Testing Kill Switch Activation...")
	if err := testKillSwitchActivation(); err != nil {
		fmt.Printf("❌ Kill switch activation failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Kill switch activation successful")

	// Test 2: Traffic blocking verification
	fmt.Println("\n2️⃣  Testing Traffic Blocking...")
	if err := testTrafficBlocking(); err != nil {
		fmt.Printf("❌ Traffic blocking test failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Traffic successfully blocked")

	// Test 3: Kill switch deactivation
	fmt.Println("\n3️⃣  Testing Kill Switch Deactivation...")
	if err := testKillSwitchDeactivation(); err != nil {
		fmt.Printf("❌ Kill switch deactivation failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Kill switch deactivation successful")

	// Test 4: Traffic restoration
	fmt.Println("\n4️⃣  Testing Traffic Restoration...")
	if err := testTrafficRestoration(); err != nil {
		fmt.Printf("❌ Traffic restoration failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Traffic successfully restored")

	fmt.Println("\n🎉 ALL TESTS PASSED!")
	fmt.Println("Enhanced Kill Switch is working perfectly!")
}

func testKillSwitchActivation() error {
	cmd := exec.Command("go", "run", "../enhanced-killswitch.go", "activate")
	return cmd.Run()
}

func testTrafficBlocking() error {
	// Try to make HTTP request - should fail when kill switch is active
	client := &http.Client{Timeout: 3 * time.Second}
	_, err := client.Get("http://httpbin.org/ip")
	
	// We expect this to fail when kill switch is active
	if err == nil {
		return fmt.Errorf("traffic was not blocked - kill switch may not be working")
	}
	
	return nil
}

func testKillSwitchDeactivation() error {
	cmd := exec.Command("go", "run", "../enhanced-killswitch.go", "deactivate")
	return cmd.Run()
}

func testTrafficRestoration() error {
	// Wait a moment for traffic to be restored
	time.Sleep(2 * time.Second)
	
	// Try to make HTTP request - should succeed when kill switch is deactivated
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get("http://httpbin.org/ip")
	if err != nil {
		return fmt.Errorf("traffic was not restored: %v", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != 200 {
		return fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}
	
	return nil
}

func init() {
	// Check if we have necessary permissions
	if runtime.GOOS != "windows" && os.Geteuid() != 0 {
		fmt.Println("⚠️  Warning: Kill switch tests require root privileges")
		fmt.Println("Run with: sudo go run test-killswitch.go")
	}
}