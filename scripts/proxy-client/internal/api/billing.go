package api

import (
	"net/http"

	"github.com/atlanticproxy/proxy-client/internal/billing"
	"github.com/gin-gonic/gin"
)

// handleGetPlans returns all available plans
func (s *Server) handleGetPlans(c *gin.Context) {
	plans := billing.AvailablePlans()
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
