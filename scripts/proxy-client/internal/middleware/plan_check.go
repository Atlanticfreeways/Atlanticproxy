package middleware

import (
	"net/http"

	"github.com/atlanticproxy/proxy-client/internal/billing"
	"github.com/gin-gonic/gin"
)

// PlanCheck middleware verifies user's plan allows the requested feature
func PlanCheck() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user from context (set by auth middleware)
		userInterface, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}
		
		user, ok := userInterface.(*billing.User)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user data"})
			c.Abort()
			return
		}
		
		// Check subscription status
		if err := billing.CheckSubscriptionActive(user); err != nil {
			c.JSON(http.StatusForbidden, gin.H{
				"error": err.Error(),
				"upgrade_required": true,
			})
			c.Abort()
			return
		}
		
		// Check data quota
		if err := billing.CheckDataQuota(user); err != nil {
			c.JSON(http.StatusForbidden, gin.H{
				"error": err.Error(),
				"quota_exceeded": true,
			})
			c.Abort()
			return
		}
		
		// Check credits for PAYG users
		if user.Plan == billing.PlanPAYG {
			if err := billing.CheckCredits(user); err != nil {
				c.JSON(http.StatusForbidden, gin.H{
					"error": err.Error(),
					"credits_required": true,
				})
				c.Abort()
				return
			}
		}
		
		c.Next()
	}
}

// RequirePersonalPlan middleware ensures user has Personal plan or higher
func RequirePersonalPlan() gin.HandlerFunc {
	return func(c *gin.Context) {
		userInterface, _ := c.Get("user")
		user := userInterface.(*billing.User)
		
		if user.Plan == billing.PlanStarter || user.Plan == billing.PlanPAYG {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "This feature requires Personal plan or higher",
				"upgrade_required": true,
				"current_plan": user.Plan,
			})
			c.Abort()
			return
		}
		
		c.Next()
	}
}
