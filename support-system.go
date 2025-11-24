package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

type SupportSystem struct {
	tickets   map[string]*Ticket
	referrals map[string]*Referral
	mutex     sync.RWMutex
}

type Ticket struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	Subject     string    `json:"subject"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	Priority    string    `json:"priority"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Messages    []Message `json:"messages"`
}

type Message struct {
	ID        string    `json:"id"`
	TicketID  string    `json:"ticket_id"`
	From      string    `json:"from"`
	Content   string    `json:"content"`
	Timestamp time.Time `json:"timestamp"`
}

type Referral struct {
	ID           string    `json:"id"`
	ReferrerID   string    `json:"referrer_id"`
	RefereeEmail string    `json:"referee_email"`
	Status       string    `json:"status"`
	Commission   float64   `json:"commission"`
	CreatedAt    time.Time `json:"created_at"`
	ConvertedAt  *time.Time `json:"converted_at,omitempty"`
}

type CreateTicketRequest struct {
	UserID      string `json:"user_id"`
	Subject     string `json:"subject"`
	Description string `json:"description"`
	Priority    string `json:"priority"`
}

type CreateReferralRequest struct {
	ReferrerID   string `json:"referrer_id"`
	RefereeEmail string `json:"referee_email"`
}

func NewSupportSystem() *SupportSystem {
	ss := &SupportSystem{
		tickets:   make(map[string]*Ticket),
		referrals: make(map[string]*Referral),
	}
	
	ss.createDemoData()
	return ss
}

func (ss *SupportSystem) createDemoData() {
	// Demo tickets
	tickets := []*Ticket{
		{
			ID:          "TKT-001",
			UserID:      "demo_user_1",
			Subject:     "Connection Issues",
			Description: "Having trouble connecting to proxies",
			Status:      "open",
			Priority:    "high",
			CreatedAt:   time.Now().Add(-2 * time.Hour),
			UpdatedAt:   time.Now().Add(-1 * time.Hour),
			Messages: []Message{
				{
					ID:        "MSG-001",
					TicketID:  "TKT-001",
					From:      "user",
					Content:   "I can't connect to any proxy servers",
					Timestamp: time.Now().Add(-2 * time.Hour),
				},
				{
					ID:        "MSG-002",
					TicketID:  "TKT-001",
					From:      "support",
					Content:   "We're investigating this issue. Please try switching providers.",
					Timestamp: time.Now().Add(-1 * time.Hour),
				},
			},
		},
		{
			ID:          "TKT-002",
			UserID:      "enterprise_user_1",
			Subject:     "API Integration Help",
			Description: "Need help with API integration",
			Status:      "resolved",
			Priority:    "medium",
			CreatedAt:   time.Now().Add(-24 * time.Hour),
			UpdatedAt:   time.Now().Add(-12 * time.Hour),
			Messages: []Message{
				{
					ID:        "MSG-003",
					TicketID:  "TKT-002",
					From:      "user",
					Content:   "How do I integrate with your API?",
					Timestamp: time.Now().Add(-24 * time.Hour),
				},
				{
					ID:        "MSG-004",
					TicketID:  "TKT-002",
					From:      "support",
					Content:   "Please check our API documentation at /docs/api",
					Timestamp: time.Now().Add(-12 * time.Hour),
				},
			},
		},
	}
	
	for _, ticket := range tickets {
		ss.tickets[ticket.ID] = ticket
	}
	
	// Demo referrals
	referrals := []*Referral{
		{
			ID:           "REF-001",
			ReferrerID:   "demo_user_1",
			RefereeEmail: "friend1@example.com",
			Status:       "converted",
			Commission:   15.99,
			CreatedAt:    time.Now().Add(-7 * 24 * time.Hour),
			ConvertedAt:  &[]time.Time{time.Now().Add(-5 * 24 * time.Hour)}[0],
		},
		{
			ID:           "REF-002",
			ReferrerID:   "demo_user_1",
			RefereeEmail: "friend2@example.com",
			Status:       "pending",
			Commission:   0,
			CreatedAt:    time.Now().Add(-3 * 24 * time.Hour),
		},
	}
	
	for _, referral := range referrals {
		ss.referrals[referral.ID] = referral
	}
	
	fmt.Printf("✅ Created %d demo tickets and %d referrals\n", len(tickets), len(referrals))
}

func (ss *SupportSystem) Start() error {
	fmt.Println("🎧 Starting Support & Referral System...")
	
	mux := http.NewServeMux()
	
	// Support endpoints
	mux.HandleFunc("/support/tickets", ss.handleTickets)
	mux.HandleFunc("/support/ticket", ss.handleTicket)
	mux.HandleFunc("/support/create-ticket", ss.handleCreateTicket)
	
	// Referral endpoints
	mux.HandleFunc("/referrals/create", ss.handleCreateReferral)
	mux.HandleFunc("/referrals/user", ss.handleUserReferrals)
	mux.HandleFunc("/referrals/stats", ss.handleReferralStats)
	
	server := &http.Server{
		Addr:    ":8083",
		Handler: ss.corsMiddleware(mux),
	}
	
	fmt.Println("🎧 Support system running on http://localhost:8083")
	return server.ListenAndServe()
}

func (ss *SupportSystem) handleTickets(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	
	ss.mutex.RLock()
	tickets := make([]*Ticket, 0)
	for _, ticket := range ss.tickets {
		if userID == "" || ticket.UserID == userID {
			tickets = append(tickets, ticket)
		}
	}
	ss.mutex.RUnlock()
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tickets)
}

func (ss *SupportSystem) handleTicket(w http.ResponseWriter, r *http.Request) {
	ticketID := r.URL.Query().Get("id")
	if ticketID == "" {
		http.Error(w, "Ticket ID required", http.StatusBadRequest)
		return
	}
	
	ss.mutex.RLock()
	ticket := ss.tickets[ticketID]
	ss.mutex.RUnlock()
	
	if ticket == nil {
		http.Error(w, "Ticket not found", http.StatusNotFound)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ticket)
}

func (ss *SupportSystem) handleCreateTicket(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	var req CreateTicketRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	
	ticketID := fmt.Sprintf("TKT-%d", time.Now().Unix())
	ticket := &Ticket{
		ID:          ticketID,
		UserID:      req.UserID,
		Subject:     req.Subject,
		Description: req.Description,
		Status:      "open",
		Priority:    req.Priority,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		Messages:    []Message{},
	}
	
	ss.mutex.Lock()
	ss.tickets[ticketID] = ticket
	ss.mutex.Unlock()
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ticket)
	
	fmt.Printf("🎫 New support ticket: %s - %s\n", ticketID, req.Subject)
}

func (ss *SupportSystem) handleCreateReferral(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	var req CreateReferralRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	
	referralID := fmt.Sprintf("REF-%d", time.Now().Unix())
	referral := &Referral{
		ID:           referralID,
		ReferrerID:   req.ReferrerID,
		RefereeEmail: req.RefereeEmail,
		Status:       "pending",
		Commission:   0,
		CreatedAt:    time.Now(),
	}
	
	ss.mutex.Lock()
	ss.referrals[referralID] = referral
	ss.mutex.Unlock()
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(referral)
	
	fmt.Printf("👥 New referral: %s referred %s\n", req.ReferrerID, req.RefereeEmail)
}

func (ss *SupportSystem) handleUserReferrals(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "User ID required", http.StatusBadRequest)
		return
	}
	
	ss.mutex.RLock()
	referrals := make([]*Referral, 0)
	for _, referral := range ss.referrals {
		if referral.ReferrerID == userID {
			referrals = append(referrals, referral)
		}
	}
	ss.mutex.RUnlock()
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(referrals)
}

func (ss *SupportSystem) handleReferralStats(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "User ID required", http.StatusBadRequest)
		return
	}
	
	ss.mutex.RLock()
	totalReferrals := 0
	convertedReferrals := 0
	totalCommission := 0.0
	
	for _, referral := range ss.referrals {
		if referral.ReferrerID == userID {
			totalReferrals++
			if referral.Status == "converted" {
				convertedReferrals++
				totalCommission += referral.Commission
			}
		}
	}
	ss.mutex.RUnlock()
	
	stats := map[string]interface{}{
		"user_id":             userID,
		"total_referrals":     totalReferrals,
		"converted_referrals": convertedReferrals,
		"pending_referrals":   totalReferrals - convertedReferrals,
		"total_commission":    totalCommission,
		"conversion_rate":     float64(convertedReferrals) / float64(totalReferrals) * 100,
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func (ss *SupportSystem) corsMiddleware(next http.Handler) http.Handler {
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

func (ss *SupportSystem) Status() string {
	ss.mutex.RLock()
	defer ss.mutex.RUnlock()
	
	status := "🎧 SUPPORT & REFERRAL SYSTEM STATUS\n"
	status += "===================================\n"
	
	// Ticket stats
	openTickets := 0
	resolvedTickets := 0
	for _, ticket := range ss.tickets {
		if ticket.Status == "open" {
			openTickets++
		} else if ticket.Status == "resolved" {
			resolvedTickets++
		}
	}
	
	// Referral stats
	pendingReferrals := 0
	convertedReferrals := 0
	totalCommission := 0.0
	
	for _, referral := range ss.referrals {
		if referral.Status == "pending" {
			pendingReferrals++
		} else if referral.Status == "converted" {
			convertedReferrals++
			totalCommission += referral.Commission
		}
	}
	
	status += fmt.Sprintf("Support Tickets:\n")
	status += fmt.Sprintf("  Open: %d\n", openTickets)
	status += fmt.Sprintf("  Resolved: %d\n", resolvedTickets)
	status += fmt.Sprintf("  Total: %d\n", len(ss.tickets))
	
	status += fmt.Sprintf("\nReferral Program:\n")
	status += fmt.Sprintf("  Pending: %d\n", pendingReferrals)
	status += fmt.Sprintf("  Converted: %d\n", convertedReferrals)
	status += fmt.Sprintf("  Total Commission: $%.2f\n", totalCommission)
	status += fmt.Sprintf("  Total Referrals: %d\n", len(ss.referrals))
	
	return status
}

func main() {
	support := NewSupportSystem()
	
	fmt.Println("🚀 Atlantic Proxy Support & Referral System")
	fmt.Println("Features:")
	fmt.Println("  📧 Support Ticket Management")
	fmt.Println("  👥 Referral Program (15-25% commission)")
	fmt.Println("  📊 Real-time Analytics")
	
	// Show status
	fmt.Printf("\n%s", support.Status())
	
	if err := support.Start(); err != nil {
		fmt.Printf("Support system error: %v\n", err)
	}
}