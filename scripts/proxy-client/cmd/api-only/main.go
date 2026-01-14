package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/atlanticproxy/proxy-client/internal/adblock"
	"github.com/atlanticproxy/proxy-client/internal/api"
	"github.com/atlanticproxy/proxy-client/internal/billing"
	"github.com/atlanticproxy/proxy-client/internal/rotation"
	"github.com/atlanticproxy/proxy-client/internal/storage"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
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

	store, err := storage.NewStore()
	if err != nil {
		log.Printf("Failed to initialize storage: %v. Running in-memory mode if possible.", err)
	}

	// SEEDER: Ensure a default user exists for easy testing
	if store != nil {
		testEmail := "admin@atlantic.com"
		if _, err := store.GetUserByEmail(testEmail); err != nil {
			hashed, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
			userID := uuid.New().String()
			store.CreateUser(userID, testEmail, string(hashed))
			log.Printf("Seeded test user: %s (password: password123)", testEmail)
		}
	}

	// Initialize Minimal Managers for API functionality
	bm := billing.NewManager(store)
	am := rotation.NewAnalyticsManager()
	rm := rotation.NewManager(am)
	ab := adblock.NewEngine("US", store)

	server := api.NewServer(ab, nil, nil, nil, rm, am, bm, store)

	log.Println("Starting AtlanticProxy HTTP API Server...")
	if err := server.Start(ctx, ":8082"); err != nil {
		log.Fatal("API Server failed:", err)
	}
}
