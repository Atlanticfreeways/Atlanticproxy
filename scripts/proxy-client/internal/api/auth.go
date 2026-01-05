package api

import (
	"net/http"
	"time"

	"github.com/atlanticproxy/proxy-client/internal/storage"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token string        `json:"token"`
	User  *storage.User `json:"user"`
}

func (s *Server) handleRegister(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user exists
	if _, err := s.store.GetUserByEmail(req.Email); err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	}

	// Hash password
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create user
	user := &storage.User{
		ID:           uuid.New().String(),
		Email:        req.Email,
		PasswordHash: string(hashed),
		CreatedAt:    time.Now(),
	}

	if err := s.store.CreateUser(user.ID, user.Email, user.PasswordHash); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Create session
	session := &storage.Session{
		ID:        uuid.New().String(),
		UserID:    user.ID,
		Token:     uuid.New().String(),
		ExpiresAt: time.Now().Add(24 * time.Hour),
		CreatedAt: time.Now(),
	}

	if err := s.store.CreateSession(session.ID, session.UserID, session.Token, session.ExpiresAt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	// Set as active user for billing/proxy context
	// In a real multi-user server, we wouldn't do this globally, but for a local desktop app verify flow, this is correct.
	if s.billingManager != nil {
		s.billingManager.SetActiveUser(user.ID)
	}

	c.JSON(http.StatusCreated, AuthResponse{
		Token: session.Token,
		User:  user,
	})
}

func (s *Server) handleLogin(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if req.Email == "" || req.Password == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Please enter both email and password"})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
		}
		return
	}

	user, err := s.store.GetUserByEmail(req.Email)
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Note: In production compare hash properly
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Create session
	session := &storage.Session{
		ID:        uuid.New().String(),
		UserID:    user.ID,
		Token:     uuid.New().String(),
		ExpiresAt: time.Now().Add(24 * time.Hour),
		CreatedAt: time.Now(),
	}

	if err := s.store.CreateSession(session.ID, session.UserID, session.Token, session.ExpiresAt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	// Set as active user for billing/proxy context
	if s.billingManager != nil {
		s.billingManager.SetActiveUser(user.ID)
	}

	c.JSON(http.StatusOK, AuthResponse{
		Token: session.Token,
		User:  user,
	})
}

func (s *Server) handleMe(c *gin.Context) {
	// Middleware should place user in context
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (s *Server) handleLogout(c *gin.Context) {
	// Token should be available if middleware passed, but for logout we might extracting it again
	token := c.GetHeader("Authorization")
	if len(token) > 7 && token[:7] == "Bearer " {
		token = token[7:]
	}

	if token != "" {
		if err := s.store.DeleteSession(token); err != nil {
			s.logger.Warnf("Failed to delete session on logout: %v", err)
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func (s *Server) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
			return
		}

		if len(token) > 7 && token[:7] == "Bearer " {
			token = token[7:]
		}

		session, err := s.store.GetSession(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid session"})
			return
		}

		if session.ExpiresAt.Before(time.Now()) {
			s.store.DeleteSession(token)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Session expired"})
			return
		}

		user, err := s.store.GetUserByID(session.UserID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}

		c.Set("user", user)
		c.Next()
	}
}
