//go:build windows
// +build windows

package interceptor

import (
	"context"
)

type Config struct {
	InterfaceName string
	TunIP         string
	TunNetmask    string
}

type TunInterceptor struct {
	config *Config
}

func NewTunInterceptor(config *Config) (*TunInterceptor, error) {
	if config == nil {
		config = &Config{
			InterfaceName: "wintun",
			TunIP:         "10.8.0.1",
			TunNetmask:    "255.255.255.0",
		}
	}
	return &TunInterceptor{config: config}, nil
}

func (t *TunInterceptor) Start(ctx context.Context) error {
	// Stub implementation for Windows compilation
	return nil
}

func (t *TunInterceptor) Stop() {
	// Stub implementation for Windows compilation
}
