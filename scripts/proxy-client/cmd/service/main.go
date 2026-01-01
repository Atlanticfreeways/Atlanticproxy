package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/atlanticproxy/proxy-client/internal/service"
)

func main() {
	if os.Getuid() != 0 {
		log.Fatal("AtlanticProxy Service must be run as root (sudo) to configure network interfaces.")
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	svc := service.New()

	// Handle shutdown signals
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sigChan
		log.Println("Shutdown signal received")
		cancel()
	}()

	log.Println("Starting AtlanticProxy Client Service...")
	if err := svc.Run(ctx); err != nil {
		log.Fatal("Service failed:", err)
	}
}
