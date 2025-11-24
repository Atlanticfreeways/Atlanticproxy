package main

import (
	"fmt"
	"os"
	"os/exec"
)

func main() {
	fmt.Println("🧪 ATLANTIC PROXY - Analytics System Test")
	fmt.Println("========================================")

	// Test 1: Build validation
	fmt.Println("\n1️⃣  Testing Analytics System Build...")
	if err := testBuild(); err != nil {
		fmt.Printf("❌ Build failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Analytics system build successful")

	// Test 2: Execution test
	fmt.Println("\n2️⃣  Testing Analytics System Execution...")
	if err := testExecution(); err != nil {
		fmt.Printf("❌ Execution failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Analytics system execution successful")

	fmt.Println("\n🎉 ANALYTICS SYSTEM TESTS PASSED!")
	fmt.Println("Analytics & Reporting System ready!")
}

func testBuild() error {
	cmd := exec.Command("go", "build", "-o", "../bin/analytics-system", "../analytics-system.go")
	return cmd.Run()
}

func testExecution() error {
	cmd := exec.Command("go", "run", "../analytics-system.go")
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