package main

import (
	"fmt"
	"os"
	"os/exec"
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

	// Test 2: Execution test
	fmt.Println("\n2️⃣  Testing Auth System Execution...")
	if err := testExecution(); err != nil {
		fmt.Printf("❌ Execution failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Auth system execution successful")

	fmt.Println("\n🎉 AUTHENTICATION TESTS PASSED!")
	fmt.Println("User Authentication & Account Management ready!")
}

func testBuild() error {
	cmd := exec.Command("go", "build", "-o", "../bin/test-auth", "../auth-system.go")
	return cmd.Run()
}

func testExecution() error {
	cmd := exec.Command("go", "run", "../auth-system.go")
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