# Atlantic Proxy - Implementation Code Examples

## Phase 1: Fix Database Connection

### Current Issue
Backend uses mock server because database connection times out.

### Solution: Update `backend/cmd/server/main.go`

```go
// BEFORE (Mock Server Fallback)
var db *sqlx.DB
ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
db, err := sqlx.ConnectContext(ctx, "postgres", dbURL)
cancel()

if err != nil {
    log.Printf("⚠️  Database connection failed: %v. Running with mock data fallback.", err)
    log.Println("🎭 Starting mock server for testing...")
    startMockServer()
    return
}

// AFTER (Real Database)
var db *sqlx.DB
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
db, err := sqlx.ConnectContext(ctx, "postgres", dbURL)
cancel()

if err != nil {
    log.Fatalf("❌ Database connection failed: %v", err)
}
defer db.Close()

// Verify connection
if err := db.Ping(); err != nil {
    log.Fatalf("❌ Database ping failed: %v", err)
}

log.Println("✅ Database connected successfully")
```

---

## Phase 2: Real Authentication

### Current Issue
`registerHandler` returns mock data without saving to database.

### Solution: Update `backend/cmd/server/handlers.go`

```go
// BEFORE (Mock)
func registerHandler(db *sqlx.DB, jwtSecret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        var req struct {
            Email    string `json:"email"`
            Password string `json:"password"`
        }
        c.BindJSON(&req)
        c.JSON(http.StatusOK, gin.H{
            "id":    1,
            "email": req.Email,
            "token": "mock-token-12345",
        })
    }
}

// AFTER (Real)
func registerHandler(db *sqlx.DB, jwtSecret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        var req struct {
            Email    string `json:"email" binding:"required,email"`
            Password string `json:"password" binding:"required,min=8"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        // Check if user exists
        var existingUser User
        err := db.Get(&existingUser, "SELECT id FROM users WHERE email = $1", req.Email)
        if err == nil {
            c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
            return
        }

        // Hash password
        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
            return
        }

        // Create user
        var userID int
        err = db.QueryRow(
            "INSERT INTO users (email, password_hash, subscription_tier, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id",
            req.Email, string(hashedPassword), "free",
        ).Scan(&userID)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
            return
        }

        // Generate JWT token
        token := jwt.NewWithClaims(jwt.SigningMethodHS256, Claims{
            UserID: userID,
            Email:  req.Email,
            RegisteredClaims: jwt.RegisteredClaims{
                ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
            },
        })

        tokenString, err := token.SignedString([]byte(jwtSecret))
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "id":    userID,
            "email": req.Email,
            "token": tokenString,
        })
    }
}
```

### Real Login Handler

```go
// BEFORE (Mock)
func loginHandler(db *sqlx.DB, jwtSecret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        var req struct {
            Email    string `json:"email"`
            Password string `json:"password"`
        }
        c.BindJSON(&req)
        c.JSON(http.StatusOK, gin.H{
            "id":    1,
            "email": req.Email,
            "token": "mock-token-12345",
        })
    }
}

// AFTER (Real)
func loginHandler(db *sqlx.DB, jwtSecret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        var req struct {
            Email    string `json:"email" binding:"required,email"`
            Password string `json:"password" binding:"required"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        // Get user from database
        var user User
        err := db.Get(&user, "SELECT id, email, password_hash, subscription_tier FROM users WHERE email = $1", req.Email)
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
            return
        }

        // Verify password
        err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
            return
        }

        // Generate JWT token
        token := jwt.NewWithClaims(jwt.SigningMethodHS256, Claims{
            UserID: user.ID,
            Email:  user.Email,
            RegisteredClaims: jwt.RegisteredClaims{
                ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
            },
        })

        tokenString, err := token.SignedString([]byte(jwtSecret))
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "id":                 user.ID,
            "email":              user.Email,
            "subscription_tier":  user.SubscriptionTier,
            "token":              tokenString,
        })
    }
}
```

---

## Phase 3: Real Proxy Management

### Real Proxy Connect Handler

```go
// BEFORE (Mock)
func proxyConnectHandler(db *sqlx.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "status":    "connected",
            "client_id": "mock-client-123",
        })
    }
}

// AFTER (Real - with Oxylabs)
func proxyConnectHandler(db *sqlx.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get user ID from JWT
        userID := c.GetInt("user_id")

        // Generate unique client ID
        clientID := fmt.Sprintf("client_%d_%d", userID, time.Now().Unix())

        // Create connection in database
        var connID int
        err := db.QueryRow(
            "INSERT INTO proxy_connections (user_id, client_id, status, connected_at) VALUES ($1, $2, $3, NOW()) RETURNING id",
            userID, clientID, "active",
        ).Scan(&connID)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create connection"})
            return
        }

        // Get Oxylabs credentials from environment
        oxylabsUsername := os.Getenv("OXYLABS_USERNAME")
        oxylabsPassword := os.Getenv("OXYLABS_PASSWORD")

        c.JSON(http.StatusOK, gin.H{
            "status":    "connected",
            "client_id": clientID,
            "credentials": gin.H{
                "username": oxylabsUsername,
                "password": oxylabsPassword,
            },
        })
    }
}
```

### Real Proxy Status Handler

```go
// BEFORE (Mock)
func proxyStatusHandler(db *sqlx.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "status":     "connected",
            "ip":         "192.168.1.1",
            "location":   "US",
            "connected":  true,
        })
    }
}

// AFTER (Real)
func proxyStatusHandler(db *sqlx.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        userID := c.GetInt("user_id")

        // Get active connection
        var conn struct {
            ID          int       `db:"id"`
            Status      string    `db:"status"`
            ConnectedAt time.Time `db:"connected_at"`
        }

        err := db.Get(&conn,
            "SELECT id, status, connected_at FROM proxy_connections WHERE user_id = $1 AND status = 'active' ORDER BY connected_at DESC LIMIT 1",
            userID,
        )
        if err != nil {
            c.JSON(http.StatusOK, gin.H{
                "status":    "disconnected",
                "connected": false,
            })
            return
        }

        // Get usage stats
        var usage struct {
            BytesSent     int64 `db:"bytes_sent"`
            BytesReceived int64 `db:"bytes_received"`
            Requests      int   `db:"requests_count"`
        }

        db.Get(&usage,
            "SELECT COALESCE(SUM(bytes_sent), 0) as bytes_sent, COALESCE(SUM(bytes_received), 0) as bytes_received, COALESCE(SUM(requests_count), 0) as requests_count FROM proxy_usage WHERE user_id = $1",
            userID,
        )

        c.JSON(http.StatusOK, gin.H{
            "status":     "connected",
            "connected":  true,
            "uptime":     time.Since(conn.ConnectedAt).String(),
            "bytes_sent": usage.BytesSent,
            "bytes_received": usage.BytesReceived,
            "requests":   usage.Requests,
        })
    }
}
```

---

## Phase 4: Real Billing

### Real Billing Plans Handler

```go
// BEFORE (Mock)
func billingPlansHandler() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "plans": []gin.H{
                {"id": "free", "name": "Free", "price": 0},
                {"id": "pro", "name": "Pro", "price": 9.99},
                {"id": "enterprise", "name": "Enterprise", "price": 99.99},
            },
        })
    }
}

// AFTER (Real)
func billingPlansHandler(db *sqlx.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        type Plan struct {
            ID          string  `db:"id" json:"id"`
            Name        string  `db:"name" json:"name"`
            Price       float64 `db:"price" json:"price"`
            Bandwidth   int64   `db:"bandwidth" json:"bandwidth"`
            Connections int     `db:"connections" json:"connections"`
            Features    string  `db:"features" json:"features"`
        }

        var plans []Plan
        err := db.Select(&plans, "SELECT id, name, price, bandwidth, connections, features FROM billing_plans WHERE active = true ORDER BY price ASC")
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plans"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"plans": plans})
    }
}
```

### Real Paystack Integration

```go
// BEFORE (Mock)
func billingSubscribeHandler(db *sqlx.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "status":    "success",
            "message":   "Subscription created",
        })
    }
}

// AFTER (Real - with Paystack)
func billingSubscribeHandler(db *sqlx.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        userID := c.GetInt("user_id")

        var req struct {
            PlanID string `json:"plan_id" binding:"required"`
            Email  string `json:"email" binding:"required,email"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        // Get plan details
        var plan struct {
            Price float64 `db:"price"`
        }
        err := db.Get(&plan, "SELECT price FROM billing_plans WHERE id = $1", req.PlanID)
        if err != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "Plan not found"})
            return
        }

        // Initialize Paystack payment
        paystackSecretKey := os.Getenv("PAYSTACK_SECRET_KEY")
        
        // Create transaction record
        var txnID int
        err = db.QueryRow(
            "INSERT INTO billing_transactions (user_id, plan_id, amount, status, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id",
            userID, req.PlanID, plan.Price, "pending",
        ).Scan(&txnID)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaction"})
            return
        }

        // Call Paystack API
        paymentData := map[string]interface{}{
            "email":  req.Email,
            "amount": int(plan.Price * 100), // Convert to kobo
            "reference": fmt.Sprintf("txn_%d", txnID),
        }

        // Make request to Paystack
        client := &http.Client{}
        jsonData, _ := json.Marshal(paymentData)
        req2, _ := http.NewRequest("POST", "https://api.paystack.co/transaction/initialize", bytes.NewBuffer(jsonData))
        req2.Header.Set("Authorization", fmt.Sprintf("Bearer %s", paystackSecretKey))
        req2.Header.Set("Content-Type", "application/json")

        resp, err := client.Do(req2)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize payment"})
            return
        }
        defer resp.Body.Close()

        var paystackResp map[string]interface{}
        json.NewDecoder(resp.Body).Decode(&paystackResp)

        c.JSON(http.StatusOK, gin.H{
            "status":           "success",
            "authorization_url": paystackResp["data"].(map[string]interface{})["authorization_url"],
            "access_code":      paystackResp["data"].(map[string]interface{})["access_code"],
            "reference":        paystackResp["data"].(map[string]interface{})["reference"],
        })
    }
}
```

---

## Frontend: Update API Client

### Current Issue
`frontend/lib/api.ts` returns mock data.

### Solution: Update to handle real responses

```typescript
// BEFORE (Mock)
export const api = {
  async login(email: string, password: string) {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await handleResponse(res);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error('Network error. Please check if the backend is running.');
    }
  },
};

// AFTER (Real)
export const api = {
  async login(email: string, password: string) {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await handleResponse(res);
      
      // Store token
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      return {
        user: {
          id: data.id,
          email: data.email,
          subscription_tier: data.subscription_tier,
        },
        token: data.token,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error('Login failed. Please check your credentials.');
    }
  },
};
```

---

## Database Schema

### Create Tables

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Proxy connections table
CREATE TABLE proxy_connections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    client_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL,
    connected_at TIMESTAMP DEFAULT NOW(),
    disconnected_at TIMESTAMP
);

-- Proxy usage table
CREATE TABLE proxy_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bytes_sent BIGINT DEFAULT 0,
    bytes_received BIGINT DEFAULT 0,
    requests_count INTEGER DEFAULT 0,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Billing plans table
CREATE TABLE billing_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    bandwidth BIGINT NOT NULL,
    connections INTEGER NOT NULL,
    features TEXT,
    active BOOLEAN DEFAULT true
);

-- Billing transactions table
CREATE TABLE billing_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) REFERENCES billing_plans(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_proxy_connections_user_id ON proxy_connections(user_id);
CREATE INDEX idx_proxy_usage_user_id ON proxy_usage(user_id);
CREATE INDEX idx_billing_transactions_user_id ON billing_transactions(user_id);
```

---

## Testing

### Test Real Authentication

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get user (with token)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Next Steps

1. Start with Phase 1 (Database)
2. Follow the code examples above
3. Test each phase with curl
4. Update frontend to use real responses
5. Deploy to production

See `ENTERPRISE_READY_IMPLEMENTATION.md` for full details.
