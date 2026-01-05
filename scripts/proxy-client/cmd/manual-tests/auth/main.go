package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

const baseURL = "http://localhost:8082"

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  struct {
		ID    string `json:"id"`
		Email string `json:"email"`
	} `json:"user"`
}

func main() {
	fmt.Println("Starting Auth Validation...")

	email := fmt.Sprintf("test%d@example.com", time.Now().Unix())
	password := "password123"

	// 1. Register
	fmt.Printf("\n1. Registering user %s...\n", email)
	token, err := register(email, password)
	if err != nil {
		fmt.Printf("❌ Registration failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Registration successful")

	// 2. Login
	fmt.Println("\n2. Logging in...")
	token2, err := login(email, password)
	if err != nil {
		fmt.Printf("❌ Login failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Login successful")
	fmt.Printf("Token: %s...\n", token2[:10])

	if token != token2 {
		fmt.Println("ℹ️ Note: Registration and Login returned different tokens (expected if session creation logic generates new token each time)")
	}

	// 3. Get Me
	fmt.Println("\n3. Getting User Info (Protected Route)...")
	if err := getMe(token2); err != nil {
		fmt.Printf("❌ Get Me failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Get Me successful")

	// 4. Logout
	fmt.Println("\n4. Logging out...")
	if err := logout(token2); err != nil {
		fmt.Printf("❌ Logout failed: %v\n", err)
		// Don't exit, try to verify if token is invalid
	} else {
		fmt.Println("✅ Logout successful")
	}

	// 5. Get Me (Should fail)
	fmt.Println("\n5. Verifying Token Invalidated...")
	if err := getMe(token2); err == nil {
		fmt.Println("❌ Token still valid after logout!")
		os.Exit(1)
	} else {
		fmt.Println("✅ Token successfully invalidated")
	}

	fmt.Println("\n🎉 All Auth Tests Passed!")
}

func register(email, password string) (string, error) {
	reqBody, _ := json.Marshal(RegisterRequest{Email: email, Password: password})
	resp, err := http.Post(baseURL+"/api/auth/register", "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("status %d: %s", resp.StatusCode, string(body))
	}

	var authResp AuthResponse
	if err := json.NewDecoder(resp.Body).Decode(&authResp); err != nil {
		return "", err
	}
	return authResp.Token, nil
}

func login(email, password string) (string, error) {
	reqBody, _ := json.Marshal(LoginRequest{Email: email, Password: password})
	resp, err := http.Post(baseURL+"/api/auth/login", "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("status %d: %s", resp.StatusCode, string(body))
	}

	var authResp AuthResponse
	if err := json.NewDecoder(resp.Body).Decode(&authResp); err != nil {
		return "", err
	}
	return authResp.Token, nil
}

func getMe(token string) error {
	req, _ := http.NewRequest("GET", baseURL+"/api/auth/me", nil)
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("status %d", resp.StatusCode)
	}
	return nil
}

func logout(token string) error {
	req, _ := http.NewRequest("POST", baseURL+"/api/auth/logout", nil)
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("status %d", resp.StatusCode)
	}
	return nil
}
