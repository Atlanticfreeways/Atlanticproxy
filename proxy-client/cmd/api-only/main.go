package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/atlanticproxy/proxy-client/internal/api"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sigChan
		log.Println("Shutdown signal received")
		cancel()
	}()

	server := api.NewServer()
	
	log.Println("Starting AtlanticProxy HTTP API Server...")
	if err := server.Start(ctx); err != nil {
		log.Fatal("API Server failed:", err)
	}
}