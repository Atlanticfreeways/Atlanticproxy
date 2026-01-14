package atlantic

import (
	"os"
	"os/exec"
	"testing"

	"github.com/songgao/water"
)

// Mocking helper for exec.Command
func fakeExecCommand(command string, args ...string) *exec.Cmd {
	cs := []string{"-test.run=TestHelperProcess", "--", command}
	cs = append(cs, args...)
	cmd := exec.Command(os.Args[0], cs...)
	cmd.Env = []string{"GO_WANT_HELPER_PROCESS=1"}
	return cmd
}

func TestHelperProcess(t *testing.T) {
	if os.Getenv("GO_WANT_HELPER_PROCESS") != "1" {
		return
	}
	// Exit with 0 to simulate success
	os.Exit(0)
}

func TestInterceptAllTraffic(t *testing.T) {
	// Mock exec.Command
	originalExecCommand := execCommand
	defer func() { execCommand = originalExecCommand }()
	execCommand = fakeExecCommand

	// Mock water.New
	originalNewWater := newWater
	defer func() { newWater = originalNewWater }()
	newWater = func(c water.Config) (*water.Interface, error) {
		return &water.Interface{}, nil
	}

	interceptor := NewAtlanticTrafficInterceptor()

	// Create a dummy tun interface manually to avoid nil pointer dereference if possible,
	// checking InterceptAllTraffic implementation logic.
	// We need to support the method calls inside.

	err := interceptor.InterceptAllTraffic()
	if err != nil {
		t.Fatalf("InterceptAllTraffic failed: %v", err)
	}

	if !interceptor.IsActive() {
		t.Error("Expected interceptor to be active")
	}
}

func TestStop(t *testing.T) {
	// Mock exec.Command
	originalExecCommand := execCommand
	defer func() { execCommand = originalExecCommand }()
	execCommand = fakeExecCommand

	interceptor := NewAtlanticTrafficInterceptor()
	interceptor.isActive = true // Pretend it's active

	err := interceptor.Stop()
	if err != nil {
		t.Fatalf("Stop failed: %v", err)
	}

	if interceptor.IsActive() {
		t.Error("Expected interceptor to be inactive")
	}
}

func TestCreateInterface_PlatformSpecific(t *testing.T) {
	// This test just ensures the method runs without crashing with mocked dependencies
	originalExecCommand := execCommand
	defer func() { execCommand = originalExecCommand }()
	execCommand = fakeExecCommand

	originalNewWater := newWater
	defer func() { newWater = originalNewWater }()
	newWater = func(c water.Config) (*water.Interface, error) {
		return &water.Interface{}, nil
	}

	tun := &TunInterface{}
	err := tun.CreateInterface("atlantic-test")
	if err != nil {
		t.Errorf("CreateInterface failed: %v", err)
	}
}
