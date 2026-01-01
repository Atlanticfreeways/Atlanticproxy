package billing

import (
	"testing"
)

func TestSubscriptionLifecycle(t *testing.T) {
	manager := NewManager(nil)

	// 1. Initial State (Starter)
	sub := manager.GetSubscription()
	if sub.PlanID != PlanStarter {
		t.Errorf("Expected initial plan to be Starter, got %s", sub.PlanID)
	}
	if sub.Status != "active" {
		t.Errorf("Expected active status, got %s", sub.Status)
	}

	// 2. Upgrade to Personal
	newSub, err := manager.Subscribe(PlanPersonal)
	if err != nil {
		t.Fatalf("Failed to subscribe to Personal: %v", err)
	}
	if newSub.PlanID != PlanPersonal {
		t.Errorf("Expected plan to be Personal, got %s", newSub.PlanID)
	}

	// Verify manager state updated
	currentSub := manager.GetSubscription()
	if currentSub.ID != newSub.ID {
		t.Error("Manager did not update subscription ID")
	}

	// 3. Cancel Subscription
	err = manager.CancelSubscription()
	if err != nil {
		t.Fatalf("Failed to cancel subscription: %v", err)
	}

	canceledSub := manager.GetSubscription()
	if canceledSub.AutoRenew {
		t.Error("Expected AutoRenew to be false after cancellation")
	}
	if canceledSub.Status != "canceled" {
		t.Errorf("Expected status to be canceled, got %s", canceledSub.Status)
	}
}

func TestQuotaEnforcement(t *testing.T) {
	manager := NewManager(nil)

	// Use Starter Plan (500MB Data, 1000 Requests, 5 Conns)
	// Reset usage for testing
	manager.Usage = NewUsageTracker()

	// 1. Test Request Limit
	// Set requests to 999
	manager.Usage.currentUsage.RequestsMade = 999
	if err := manager.CheckQuota(); err != nil {
		t.Errorf("Expected quota to be okay at 999 requests, got error: %v", err)
	}

	// Add one more (1000) - Limit is inclusive or exclusive?
	// Plan says limit is 1000. Usually means max allowed is 1000.
	// Logic: requests >= limit => error. So 1000 should error?
	// Let's check logic: if stats.RequestsMade >= plan.RequestLimit { return error }
	// So if 1000 >= 1000, it errors. This means we can DO 1000 requests?
	// Usually "Limit" means you can't exceed it. If I have made 1000 requests, I have reached the limit. Can I make the 1001st?
	// The check is usually performed BEFORE an action.
	// If I have made 999, I check quota. 999 < 1000. OK. I make request. Now 1000.
	// Next request: I have made 1000. 1000 >= 1000. Error.
	// So I can make exactly 1000 requests. Correct.

	manager.Usage.AddRequest() // Now 1000
	if err := manager.CheckQuota(); err == nil {
		t.Error("Expected error at 1000 requests (limit reached), got nil")
	}

	// 2. Test Data Limit (500MB)
	manager.Usage = NewUsageTracker() // Reset
	mb := int64(1024 * 1024)
	manager.Usage.AddData(499 * mb) // 499MB
	if err := manager.CheckQuota(); err != nil {
		t.Errorf("Expected quota okay at 499MB, got error: %v", err)
	}

	manager.Usage.AddData(1 * mb) // Now 500MB
	if err := manager.CheckQuota(); err == nil {
		t.Error("Expected error at 500MB (limit reached), got nil")
	}

	// 3. Test Concurrent Connections (Limit 5)
	manager.Usage = NewUsageTracker()
	manager.Usage.SetActiveConnections(4)
	if err := manager.CanAcceptConnection(); err != nil {
		t.Errorf("Expected connection allowed at 4 conns, got error: %v", err)
	}

	manager.Usage.SetActiveConnections(5)
	if err := manager.CanAcceptConnection(); err == nil {
		t.Error("Expected error at 5 connections (limit reached), got nil")
	}
}

func TestUnlimitedPlan(t *testing.T) {
	manager := NewManager(nil)

	// Upgrade to Enterprise (Unlimited)
	_, err := manager.Subscribe(PlanEnterprise)
	if err != nil {
		t.Fatal(err)
	}

	// Set insane usage
	manager.Usage.currentUsage.RequestsMade = 1000000
	manager.Usage.currentUsage.DataTransferred = 1000 * 1024 * 1024 * 1024 // 1TB
	manager.Usage.currentUsage.ActiveConnections = 500                     // Limit is 1000, wait Enterprise connections is 1000, not unlimited.
	// Enterprise Data/Reqs are -1 (Unlimited)

	if err := manager.CheckQuota(); err != nil {
		t.Errorf("Expected no error on unlimited plan, got: %v", err)
	}
}
