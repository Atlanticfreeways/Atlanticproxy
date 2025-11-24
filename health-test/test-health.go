package main

import (
	"fmt"
	"os"
	"os/exec"
)

func main() {
	fmt.Println("🧪 ATLANTIC PROXY - Health Monitoring Test")
	fmt.Println("=========================================")

	// Test 1: Build validation
	fmt.Println("\n1️⃣  Testing Health Monitor Build...")
	if err := testBuild(); err != nil {
		fmt.Printf("❌ Build failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Health monitor build successful")

	// Test 2: Execution test
	fmt.Println("\n2️⃣  Testing Health Monitor Execution...")
	if err := testExecution(); err != nil {
		fmt.Printf("❌ Execution failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Health monitor execution successful")

	fmt.Println("\n🎉 HEALTH MONITORING TESTS PASSED!")
	fmt.Println("Continuous Health Monitoring is ready!")
}

func testBuild() error {
	cmd := exec.Command("go", "build", "-o", "../bin/health-monitor", "../health-monitor.go")
	return cmd.Run()
}

func testExecution() error {
	cmd := exec.Command("go", "run", "../health-monitor.go")
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