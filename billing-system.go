package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

type BillingSystem struct {
	subscriptions map[string]*Subscription
	usage         map[string]*UsageRecord
	plans         map[string]*Plan
	mutex         sync.RWMutex
}

type Subscription struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	PlanID    string    `json:"plan_id"`
	Status    string    `json:"status"`
	StartDate time.Time `json:"start_date"`
	EndDate   time.Time `json:"end_date"`
	Amount    float64   `json:"amount"`
}

type UsageRecord struct {
	UserID        string  `json:"user_id"`
	DataUsed      int64   `json:"data_used"`
	RequestCount  int64   `json:"request_count"`
	LastUpdated   time.Time `json:"last_updated"`
	MonthlyLimit  int64   `json:"monthly_limit"`
}

type Plan struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	DataLimit   int64   `json:"data_limit"`
	Features    []string `json:"features"`
}

func NewBillingSystem() *BillingSystem {
	bs := &BillingSystem{
		subscriptions: make(map[string]*Subscription),
		usage:         make(map[string]*UsageRecord),
		plans:         make(map[string]*Plan),
	}
	
	bs.initializePlans()
	bs.createDemoSubscriptions()
	return bs
}

func (bs *BillingSystem) initializePlans() {
	plans := []*Plan{
		{
			ID:        "basic",
			Name:      "Basic Plan",
			Price:     29.99,
			DataLimit: 50 * 1024 * 1024 * 1024, // 50GB
			Features:  []string{"Residential Proxies", "Basic Support", "5 Concurrent Sessions"},
		},
		{
			ID:        "professional",
			Name:      "Professional Plan",
			Price:     79.99,
			DataLimit: 200 * 1024 * 1024 * 1024, // 200GB
			Features:  []string{"All Proxy Types", "Priority Support", "20 Concurrent Sessions", "API Access"},
		},
		{
			ID:        "enterprise",
			Name:      "Enterprise Plan",
			Price:     199.99,
			DataLimit: 1024 * 1024 * 1024 * 1024, // 1TB
			Features:  []string{"Unlimited Proxies", "24/7 Support", "Unlimited Sessions", "Custom Integration", "White-label"},
		},
	}
	
	for _, plan := range plans {
		bs.plans[plan.ID] = plan
	}
	
	fmt.Printf("✅ Initialized %d billing plans\n", len(plans))
}

func (bs *BillingSystem) createDemoSubscriptions() {
	subscriptions := []*Subscription{
		{
			ID:        "sub_demo_001",
			UserID:    "demo_user_1",
			PlanID:    "professional",
			Status:    "active",
			StartDate: time.Now().AddDate(0, -1, 0),
			EndDate:   time.Now().AddDate(0, 1, 0),
			Amount:    79.99,
		},
		{
			ID:        "sub_enterprise_001",
			UserID:    "enterprise_user_1",
			PlanID:    "enterprise",
			Status:    "active",
			StartDate: time.Now().AddDate(0, -2, 0),
			EndDate:   time.Now().AddDate(0, 10, 0),
			Amount:    199.99,
		},
	}
	
	for _, sub := range subscriptions {
		bs.subscriptions[sub.ID] = sub
		
		// Create usage records
		bs.usage[sub.UserID] = &UsageRecord{
			UserID:       sub.UserID,
			DataUsed:     int64(float64(bs.plans[sub.PlanID].DataLimit) * 0.3), // 30% used
			RequestCount: 15000,
			LastUpdated:  time.Now(),
			MonthlyLimit: bs.plans[sub.PlanID].DataLimit,
		}
	}
	
	fmt.Printf("✅ Created %d demo subscriptions\n", len(subscriptions))
}

func (bs *BillingSystem) Start() error {
	fmt.Println("💳 Starting Billing System...")
	
	mux := http.NewServeMux()
	
	// Billing endpoints
	mux.HandleFunc("/billing/plans", bs.handlePlans)
	mux.HandleFunc("/billing/subscription", bs.handleSubscription)
	mux.HandleFunc("/billing/usage", bs.handleUsage)
	mux.HandleFunc("/billing/invoice", bs.handleInvoice)
	
	server := &http.Server{
		Addr:    ":8082",
		Handler: bs.corsMiddleware(mux),
	}
	
	fmt.Println("💳 Billing system running on http://localhost:8082")
	return server.ListenAndServe()
}

func (bs *BillingSystem) handlePlans(w http.ResponseWriter, r *http.Request) {
	bs.mutex.RLock()
	plans := make([]*Plan, 0, len(bs.plans))
	for _, plan := range bs.plans {
		plans = append(plans, plan)
	}
	bs.mutex.RUnlock()
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(plans)
}

func (bs *BillingSystem) handleSubscription(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "User ID required", http.StatusBadRequest)
		return
	}
	
	bs.mutex.RLock()
	var userSub *Subscription
	for _, sub := range bs.subscriptions {
		if sub.UserID == userID {
			userSub = sub
			break
		}
	}
	bs.mutex.RUnlock()
	
	if userSub == nil {
		http.Error(w, "Subscription not found", http.StatusNotFound)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userSub)
}

func (bs *BillingSystem) handleUsage(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "User ID required", http.StatusBadRequest)
		return
	}
	
	bs.mutex.RLock()
	usage := bs.usage[userID]
	bs.mutex.RUnlock()
	
	if usage == nil {
		http.Error(w, "Usage record not found", http.StatusNotFound)
		return
	}
	
	// Calculate usage percentage
	usagePercent := float64(usage.DataUsed) / float64(usage.MonthlyLimit) * 100
	
	response := map[string]interface{}{
		"user_id":        usage.UserID,
		"data_used":      usage.DataUsed,
		"data_used_gb":   float64(usage.DataUsed) / (1024 * 1024 * 1024),
		"monthly_limit":  usage.MonthlyLimit,
		"limit_gb":       float64(usage.MonthlyLimit) / (1024 * 1024 * 1024),
		"usage_percent":  usagePercent,
		"request_count":  usage.RequestCount,
		"last_updated":   usage.LastUpdated,
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (bs *BillingSystem) handleInvoice(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "User ID required", http.StatusBadRequest)
		return
	}
	
	// Generate mock invoice
	invoice := map[string]interface{}{
		"invoice_id":   fmt.Sprintf("INV-%s-%d", userID, time.Now().Unix()),
		"user_id":      userID,
		"amount":       79.99,
		"currency":     "USD",
		"status":       "paid",
		"issued_date":  time.Now().Format("2006-01-02"),
		"due_date":     time.Now().AddDate(0, 1, 0).Format("2006-01-02"),
		"description":  "Atlantic Proxy Professional Plan - Monthly Subscription",
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(invoice)
}

func (bs *BillingSystem) corsMiddleware(next http.Handler) http.Handler {
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

func (bs *BillingSystem) Status() string {
	bs.mutex.RLock()
	defer bs.mutex.RUnlock()
	
	status := "💳 BILLING SYSTEM STATUS\n"
	status += "=======================\n"
	
	activeSubscriptions := 0
	totalRevenue := 0.0
	
	for _, sub := range bs.subscriptions {
		if sub.Status == "active" {
			activeSubscriptions++
			totalRevenue += sub.Amount
		}
	}
	
	status += fmt.Sprintf("Total Plans: %d\n", len(bs.plans))
	status += fmt.Sprintf("Active Subscriptions: %d\n", activeSubscriptions)
	status += fmt.Sprintf("Monthly Revenue: $%.2f\n", totalRevenue)
	status += fmt.Sprintf("Usage Records: %d\n", len(bs.usage))
	
	return status
}

func main() {
	billing := NewBillingSystem()
	
	fmt.Println("🚀 Atlantic Proxy Billing System")
	fmt.Println("Available Plans:")
	fmt.Println("  Basic: $29.99/month (50GB)")
	fmt.Println("  Professional: $79.99/month (200GB)")
	fmt.Println("  Enterprise: $199.99/month (1TB)")
	
	// Show status
	fmt.Printf("\n%s", billing.Status())
	
	if err := billing.Start(); err != nil {
		fmt.Printf("Billing system error: %v\n", err)
	}
}