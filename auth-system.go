package main

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

type AuthSystem struct {
	users    map[string]*User
	sessions map[string]*Session
	mutex    sync.RWMutex
}

type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Plan         string    `json:"plan"`
	CreatedAt    time.Time `json:"created_at"`
	LastLogin    time.Time `json:"last_login"`
	Active       bool      `json:"active"`
}

type Session struct {
	Token     string    `json:"token"`
	UserID    string    `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Plan     string `json:"plan"`
}

func NewAuthSystem() *AuthSystem {
	auth := &AuthSystem{
		users:    make(map[string]*User),
		sessions: make(map[string]*Session),
	}
	
	// Create demo users
	auth.createDemoUsers()
	return auth
}

func (as *AuthSystem) createDemoUsers() {
	users := []struct {
		email    string
		password string
		plan     string
	}{
		{"demo@atlanticproxy.com", "demo123", "professional"},
		{"enterprise@atlanticproxy.com", "enterprise123", "enterprise"},
		{"basic@atlanticproxy.com", "basic123", "basic"},
	}
	
	for _, u := range users {
		userID := as.generateID()
		passwordHash := as.hashPassword(u.password)
		
		as.users[userID] = &User{
			ID:           userID,
			Email:        u.email,
			PasswordHash: passwordHash,
			Plan:         u.plan,
			CreatedAt:    time.Now(),
			Active:       true,
		}
	}
	
	fmt.Printf("✅ Created %d demo users\n", len(users))
}

func (as *AuthSystem) Start() error {
	fmt.Println("🔐 Starting Authentication System...")
	
	mux := http.NewServeMux()
	
	// Auth endpoints
	mux.HandleFunc("/auth/login", as.handleLogin)
	mux.HandleFunc("/auth/register", as.handleRegister)
	mux.HandleFunc("/auth/logout", as.handleLogout)
	mux.HandleFunc("/auth/profile", as.handleProfile)
	mux.HandleFunc("/auth/users", as.handleUsers)
	
	server := &http.Server{
		Addr:    ":8081",
		Handler: as.corsMiddleware(mux),
	}
	
	fmt.Println("🔐 Auth system running on http://localhost:8081")
	return server.ListenAndServe()
}

func (as *AuthSystem) handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	
	user := as.findUserByEmail(req.Email)
	if user == nil || !as.verifyPassword(req.Password, user.PasswordHash) {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}
	
	// Create session
	session := &Session{
		Token:     as.generateToken(),
		UserID:    user.ID,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}
	
	as.mutex.Lock()
	as.sessions[session.Token] = session
	user.LastLogin = time.Now()
	as.mutex.Unlock()
	
	response := map[string]interface{}{
		"token": session.Token,
		"user":  user,
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	
	fmt.Printf("🔑 User logged in: %s (%s)\n", user.Email, user.Plan)
}

func (as *AuthSystem) handleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	
	// Check if user exists
	if as.findUserByEmail(req.Email) != nil {
		http.Error(w, "User already exists", http.StatusConflict)
		return
	}
	
	// Create user
	userID := as.generateID()
	user := &User{
		ID:           userID,
		Email:        req.Email,
		PasswordHash: as.hashPassword(req.Password),
		Plan:         req.Plan,
		CreatedAt:    time.Now(),
		Active:       true,
	}
	
	as.mutex.Lock()
	as.users[userID] = user
	as.mutex.Unlock()
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User created successfully",
		"user":    user,
	})
	
	fmt.Printf("👤 New user registered: %s (%s)\n", user.Email, user.Plan)
}

func (as *AuthSystem) handleLogout(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	token := r.Header.Get("Authorization")
	if token == "" {
		http.Error(w, "No token provided", http.StatusUnauthorized)
		return
	}
	
	token = strings.TrimPrefix(token, "Bearer ")
	
	as.mutex.Lock()
	delete(as.sessions, token)
	as.mutex.Unlock()
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
}

func (as *AuthSystem) handleProfile(w http.ResponseWriter, r *http.Request) {
	user := as.authenticateRequest(r)
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (as *AuthSystem) handleUsers(w http.ResponseWriter, r *http.Request) {
	user := as.authenticateRequest(r)
	if user == nil || user.Plan != "enterprise" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	
	as.mutex.RLock()
	users := make([]*User, 0, len(as.users))
	for _, u := range as.users {
		users = append(users, u)
	}
	as.mutex.RUnlock()
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func (as *AuthSystem) authenticateRequest(r *http.Request) *User {
	token := r.Header.Get("Authorization")
	if token == "" {
		return nil
	}
	
	token = strings.TrimPrefix(token, "Bearer ")
	
	as.mutex.RLock()
	session, exists := as.sessions[token]
	as.mutex.RUnlock()
	
	if !exists || time.Now().After(session.ExpiresAt) {
		return nil
	}
	
	as.mutex.RLock()
	user := as.users[session.UserID]
	as.mutex.RUnlock()
	
	return user
}

func (as *AuthSystem) findUserByEmail(email string) *User {
	as.mutex.RLock()
	defer as.mutex.RUnlock()
	
	for _, user := range as.users {
		if user.Email == email {
			return user
		}
	}
	return nil
}

func (as *AuthSystem) hashPassword(password string) string {
	hash := sha256.Sum256([]byte(password + "atlantic_salt"))
	return hex.EncodeToString(hash[:])
}

func (as *AuthSystem) verifyPassword(password, hash string) bool {
	return as.hashPassword(password) == hash
}

func (as *AuthSystem) generateID() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func (as *AuthSystem) generateToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func (as *AuthSystem) corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		next.ServeHTTP(w, r)
	})
}

func (as *AuthSystem) Status() string {
	as.mutex.RLock()
	defer as.mutex.RUnlock()
	
	status := "🔐 AUTHENTICATION SYSTEM STATUS\n"
	status += "===============================\n"
	
	planCounts := make(map[string]int)
	activeUsers := 0
	
	for _, user := range as.users {
		planCounts[user.Plan]++
		if user.Active {
			activeUsers++
		}
	}
	
	status += fmt.Sprintf("Total Users: %d\n", len(as.users))
	status += fmt.Sprintf("Active Users: %d\n", activeUsers)
	status += fmt.Sprintf("Active Sessions: %d\n", len(as.sessions))
	status += "\nPlan Distribution:\n"
	
	for plan, count := range planCounts {
		status += fmt.Sprintf("  %s: %d users\n", plan, count)
	}
	
	return status
}

func main() {
	auth := NewAuthSystem()
	
	fmt.Println("🚀 Atlantic Proxy Authentication System")
	fmt.Println("Demo Users:")
	fmt.Println("  demo@atlanticproxy.com / demo123 (professional)")
	fmt.Println("  enterprise@atlanticproxy.com / enterprise123 (enterprise)")
	fmt.Println("  basic@atlanticproxy.com / basic123 (basic)")
	
	// Show status
	fmt.Printf("\n%s", auth.Status())
	
	if err := auth.Start(); err != nil {
		fmt.Printf("Auth system error: %v\n", err)
	}
}