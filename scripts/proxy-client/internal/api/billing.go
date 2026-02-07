package api

import (
	"fmt"
	"net/http"
	"time"

	"github.com/atlanticproxy/proxy-client/internal/billing"
	"github.com/atlanticproxy/proxy-client/internal/payment"
	"github.com/atlanticproxy/proxy-client/internal/validation"
	"github.com/gin-gonic/gin"
)

var paystackClient = payment.NewPaystackClient()

// handleGetPlans returns all available plans
func (s *Server) handleGetPlans(c *gin.Context) {
	plans := s.billingManager.GetAvailablePlans()
	c.JSON(http.StatusOK, gin.H{"plans": plans})
}

// handleGetSubscription returns the current user's subscription
func (s *Server) handleGetSubscription(c *gin.Context) {
	sub := s.billingManager.GetSubscription()
	plan, _ := billing.GetPlan(sub.PlanID)

	c.JSON(http.StatusOK, gin.H{
		"subscription": sub,
		"plan":         plan,
	})
}

// handleSubscribe updates the user's subscription
func (s *Server) handleSubscribe(c *gin.Context) {
	var req struct {
		PlanID billing.PlanType `json:"plan_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	sub, err := s.billingManager.Subscribe(req.PlanID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Subscription updated", "subscription": sub})
}

// handleCancelSubscription cancels the auto-renewal
func (s *Server) handleCancelSubscription(c *gin.Context) {
	err := s.billingManager.CancelSubscription()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Subscription canceled"})
}

// handleGetUsage returns the current usage statistics
func (s *Server) handleGetUsage(c *gin.Context) {
	stats := s.billingManager.Usage.GetStats()
	c.JSON(http.StatusOK, stats)
}

// handleCreateCheckoutSession creates a checkout session for a plan using selected method
func (s *Server) handleCreateCheckoutSession(c *gin.Context) {
	var req billing.CheckoutRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := s.billingManager.ProcessCheckout(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

// handleDownloadInvoice generates and downloads a PDF invoice
func (s *Server) handleDownloadInvoice(c *gin.Context) {
	id := c.Param("id")

	var data *billing.InvoiceData
	if id == "test" {
		// Mock Data for testing
		data = &billing.InvoiceData{
			ID:            "INV-TEST-001",
			Date:          time.Now(),
			CustomerName:  "Test User",
			CustomerEmail: "user@example.com",
			Currency:      "NGN",
			Symbol:        "₦",
			Items: []billing.InvoiceItem{
				{Description: "AtlanticProxy Starter Plan (Monthly)", Quantity: 1, Price: 13635.00, Amount: 13635.00},
			},
			Total: 13635.00,
		}
	} else {
		// Fetch transaction from database
		tx, err := s.store.GetTransaction(id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Invoice not found"})
			return
		}

		// Get user details
		user, err := s.store.GetUserByID(tx.UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user details"})
			return
		}

		// Get plan details
		plan, err := billing.GetPlan(billing.PlanType(tx.PlanID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plan details"})
			return
		}

		// Get currency symbol
		currencyCode := billing.CurrencyCode(tx.Currency)
		symbol := billing.GetCurrencySymbol(currencyCode)

		data = &billing.InvoiceData{
			ID:            "INV-" + tx.ID,
			Date:          tx.CreatedAt,
			CustomerName:  "", // Could add name field to users table
			CustomerEmail: user.Email,
			Currency:      tx.Currency,
			Symbol:        symbol,
			Items: []billing.InvoiceItem{
				{Description: plan.Name + " Plan (Monthly)", Quantity: 1, Price: tx.Amount, Amount: tx.Amount},
			},
			Total: tx.Amount,
		}
	}

	pdfBytes, err := billing.GenerateInvoicePDF(data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate invoice"})
		return
	}

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=invoice_%s.pdf", id))
	c.Data(http.StatusOK, "application/pdf", pdfBytes)
}

type TrialRequest struct {
	PaymentMethodID string `json:"payment_method_id"`
}

type BillingStatusResponse struct {
	Plan           string    `json:"plan"`
	Status         string    `json:"status"`
	NextBillingDate time.Time `json:"next_billing_date"`
	DataUsed       int64     `json:"data_used"`
	DataLimit      int64     `json:"data_limit"`
	DepositAmount  float64   `json:"deposit_amount"`
	DepositStatus  string    `json:"deposit_status"`
}

func (s *Server) handleStartTrial(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Validate email
	if err := validation.ValidateEmail(req.Email); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Initialize combined payment (deposit + first week)
	// Total: ₦13,080 ($7.99)
	ref := fmt.Sprintf("TRIAL-%d", time.Now().Unix())
	callbackURL := "http://localhost:3000/payment/callback"
	
	// Validate amount
	if err := validation.ValidateAmount(1308000, 1000000, 2000000); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid amount"})
		return
	}
	
	resp, err := paystackClient.InitializeTransaction(req.Email, 1308000, ref, callbackURL)
	if err != nil {
		s.logger.Errorf("Payment initialization failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Payment initialization failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"authorization_url": resp.Data.AuthorizationURL,
		"reference":         resp.Data.Reference,
	})
}

func (s *Server) handleGetBillingStatus(c *gin.Context) {
	stats := s.billingManager.Usage.GetStats()
	
	status := BillingStatusResponse{
		Plan:            "starter",
		Status:          "active",
		NextBillingDate: time.Now().Add(7 * 24 * time.Hour),
		DataUsed:        stats.TotalBytes,
		DataLimit:       10 * 1024 * 1024 * 1024,
		DepositAmount:   1.00,
		DepositStatus:   "held",
	}

	c.JSON(http.StatusOK, status)
}

func (s *Server) handleVerifyPayment(c *gin.Context) {
	reference := c.Query("reference")
	if reference == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Reference required"})
		return
	}

	// Validate reference
	if err := validation.ValidateReference(reference); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := paystackClient.VerifyTransaction(reference)
	if err != nil {
		s.logger.Errorf("Verification failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Verification failed"})
		return
	}

	if resp.Data.Status == "success" {
		// TODO: Update user subscription in database
		c.JSON(http.StatusOK, gin.H{
			"status": "success",
			"message": "Payment verified",
			"amount": resp.Data.Amount,
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"status": "failed",
			"message": "Payment not successful",
		})
	}
}
