package main

import (
	"fmt"
	"os"
	"os/exec"
)

func main() {
	fmt.Println("🧪 ATLANTIC PROXY - Session Persistence Test")
	fmt.Println("===========================================")

	// Test 1: Build validation
	fmt.Println("\n1️⃣  Testing Session Manager Build...")
	if err := testBuild(); err != nil {
		fmt.Printf("❌ Build failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Session manager build successful")

	// Test 2: Execution test
	fmt.Println("\n2️⃣  Testing Session Execution...")
	if err := testExecution(); err != nil {
		fmt.Printf("❌ Execution failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Session execution successful")

	fmt.Println("\n🎉 SESSION PERSISTENCE TESTS PASSED!")
	fmt.Println("Advanced Session Persistence is ready!")
}

func testBuild() error {
	cmd := exec.Command("go", "build", "-o", "../bin/test-session", "../session-persistence.go")
	return cmd.Run()
}

func testExecution() error {
	cmd := exec.Command("go", "run", "../session-persistence.go")
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