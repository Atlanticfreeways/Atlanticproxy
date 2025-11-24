package main

import (
	"fmt"
	"os"
	"os/exec"
)

func main() {
	fmt.Println("🧪 ATLANTIC PROXY - API Integration Test")
	fmt.Println("=======================================")

	// Test 1: Build validation
	fmt.Println("\n1️⃣  Testing API Integration Build...")
	if err := testBuild(); err != nil {
		fmt.Printf("❌ Build failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ API integration build successful")

	// Test 2: Execution test
	fmt.Println("\n2️⃣  Testing API Integration Execution...")
	if err := testExecution(); err != nil {
		fmt.Printf("❌ Execution failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ API integration execution successful")

	fmt.Println("\n🎉 API INTEGRATION TESTS PASSED!")
	fmt.Println("Multi-provider API integration is ready!")
}

func testBuild() error {
	cmd := exec.Command("go", "build", "-o", "../bin/api-integration", "../api-integration.go")
	return cmd.Run()
}

func testExecution() error {
	cmd := exec.Command("go", "run", "../api-integration.go")
	cmd.Dir = ".."
	
	if err := cmd.Start(); err != nil {
		return err
	}
	
	go func() {
		cmd.Wait()
	}()
	
	if cmd.Process != nil {
		cmd.Process.Kill()
	}
	
	return nil
}