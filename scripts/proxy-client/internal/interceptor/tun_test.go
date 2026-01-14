package interceptor

import (
	"fmt"
	"testing"

	"github.com/songgao/water"
)

func TestNewTunInterceptor(t *testing.T) {
	// Mock water.New
	originalNewWater := newWater
	defer func() { newWater = originalNewWater }()

	newWater = func(c water.Config) (*water.Interface, error) {
		// Return a dummy interface or just nil/error for now since we can't easily create a water.Interface without OS calls
		// However, the function returns *water.Interface which is a struct, not an interface.
		// We can't easily create a valid *water.Interface without a real file descriptor.
		// So we will simulate an error to verify it's called, or we rely on the fact that we are mocking the constructor.
		return &water.Interface{}, nil
	}

	config := &Config{
		InterfaceName: "utun9",
		TunIP:         "10.8.0.1",
		TunNetmask:    "255.255.255.0",
	}

	interceptor, err := NewTunInterceptor(config)
	if err != nil {
		t.Fatalf("Failed to create TUN interceptor: %v", err)
	}

	if interceptor == nil {
		t.Fatal("Interceptor should not be nil")
	}

	if interceptor.config.InterfaceName != "utun9" {
		t.Errorf("Expected InterfaceName utun9, got %s", interceptor.config.InterfaceName)
	}
}

func TestNewTunInterceptor_Error(t *testing.T) {
	// Mock water.New to return error
	originalNewWater := newWater
	defer func() { newWater = originalNewWater }()

	newWater = func(c water.Config) (*water.Interface, error) {
		return nil, fmt.Errorf("mock error")
	}

	config := &Config{InterfaceName: "utun9"}
	_, err := NewTunInterceptor(config)
	if err == nil {
		t.Fatal("Expected error, got nil")
	}
	if err.Error() != "failed to create TUN interface after retries: mock error" {
		t.Errorf("Expected 'failed to create TUN interface after retries: mock error', got '%v'", err)
	}
}
