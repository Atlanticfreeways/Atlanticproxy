package handlers

import (
	"net/http"
	"strconv"

	"atlanticproxy/backend/internal/models"
	"atlanticproxy/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type BillingHandler struct {
	billingService *services.BillingService
}

func NewBillingHandler(billingService *services.BillingService) *BillingHandler {
	return &BillingHandler{
		billingService: billingService,
	}
}

// CalculatePrice calculates final price based on customization
// POST /api/billing/calculate-price
func (h *BillingHandler) CalculatePrice(c *gin.Context) {
	var req struct {
		PlanID       string `json:"planId" binding:"required"`
		Protocol     string `json:"protocol" binding:"required,oneof=http https socks5"`
		ISPTier      string `json:"ispTier" binding:"required,oneof=budget standard premium"`
		BillingCycle string `json:"billingCycle" binding:"required,oneof=monthly annual"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	price, breakdown, err := h.billingService.CalculatePrice(
		req.PlanID,
		req.Protocol,
		req.ISPTier,
		req.BillingCycle,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"totalPrice": price,
		"breakdown": gin.H{
			"basePrice":            breakdown["basePrice"],
			"protocolAdjustment":   breakdown["protocolAdjustment"],
			"ispTierAdjustment":    breakdown["ispTierAdjustment"],
			"billingDiscount":      breakdown["billingDiscount"],
		},
	})
}

// Checkout processes subscription purchase
// POST /api/billing/checkout
func (h *BillingHandler) Checkout(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req struct {
		PlanID          string `json:"planId" binding:"required"`
		Protocol        string `json:"protocol" binding:"required"`
		ISPTier         string `json:"ispTier" binding:"required"`
		BillingCycle    string `json:"billingCycle" binding:"required"`
		PaymentMethodID string `json:"paymentMethodId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := h.billingService.ProcessCheckout(
		userID,
		req.PlanID,
		req.Protocol,
		req.ISPTier,
		req.BillingCycle,
		req.PaymentMethodID,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"orderId": order.ID,
		"status":  order.Status,
	})
}

// GetPaymentMethods retrieves user's payment methods
// GET /api/billing/payment-methods
func (h *BillingHandler) GetPaymentMethods(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	methods, err := h.billingService.GetPaymentMethods(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, methods)
}

// AddPaymentMethod adds a new payment method
// POST /api/billing/payment-methods
func (h *BillingHandler) AddPaymentMethod(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req struct {
		Type       string `json:"type" binding:"required,oneof=card paypal crypto"`
		Name       string `json:"name" binding:"required"`
		LastFour   string `json:"lastFour"`
		ExpiryDate string `json:"expiryDate"`
		IsDefault  bool   `json:"isDefault"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	method, err := h.billingService.AddPaymentMethod(userID, &models.PaymentMethod{
		Type:       req.Type,
		Name:       req.Name,
		LastFour:   req.LastFour,
		ExpiryDate: req.ExpiryDate,
		IsDefault:  req.IsDefault,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, method)
}

// DeletePaymentMethod deletes a payment method
// DELETE /api/billing/payment-methods/:id
func (h *BillingHandler) DeletePaymentMethod(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	methodID := c.Param("id")
	if err := h.billingService.DeletePaymentMethod(userID, methodID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// SetDefaultPaymentMethod sets a payment method as default
// PUT /api/billing/payment-methods/:id/default
func (h *BillingHandler) SetDefaultPaymentMethod(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	methodID := c.Param("id")
	if err := h.billingService.SetDefaultPaymentMethod(userID, methodID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// GetInvoices retrieves user's invoices
// GET /api/billing/invoices?status=paid&limit=10
func (h *BillingHandler) GetInvoices(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	status := c.DefaultQuery("status", "")
	limitStr := c.DefaultQuery("limit", "10")
	limit, _ := strconv.Atoi(limitStr)

	invoices, err := h.billingService.GetInvoices(userID, status, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, invoices)
}

// DownloadInvoice downloads an invoice as PDF
// GET /api/billing/invoices/:id/download
func (h *BillingHandler) DownloadInvoice(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	invoiceID := c.Param("id")
	pdfData, err := h.billingService.GenerateInvoicePDF(userID, invoiceID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", "attachment; filename=invoice-"+invoiceID+".pdf")
	c.Data(http.StatusOK, "application/pdf", pdfData)
}

// GetCostAnalysis retrieves cost analysis data
// GET /api/billing/cost-analysis?period=month
func (h *BillingHandler) GetCostAnalysis(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	period := c.DefaultQuery("period", "month")
	analysis, err := h.billingService.GetCostAnalysis(userID, period)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, analysis)
}
