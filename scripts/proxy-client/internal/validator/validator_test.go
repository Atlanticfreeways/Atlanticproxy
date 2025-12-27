package validator

import (
	"context"
	"testing"
	"time"
)

func TestLeakDetector_IPCheck(t *testing.T) {
	detector := NewLeakDetector("1.2.3.4", nil)

	// Test matching IP (stubbed to always match in current implementation)
	results, err := detector.RunFullCheck(context.Background())
	if err != nil {
		t.Fatalf("Check failed: %v", err)
	}

	for _, res := range results {
		if res.IsLeaking {
			t.Errorf("Detected leak where none expected: %v", res)
		}
	}
}

func TestTrafficProtector_Jitter(t *testing.T) {
	protector := NewTrafficProtector()

	start := time.Now()
	err := protector.AddJitter(context.Background())
	if err != nil {
		t.Fatalf("Jitter failed: %v", err)
	}
	duration := time.Since(start)

	if duration < protector.minDelay {
		t.Errorf("Jitter faster than min delay: %v < %v", duration, protector.minDelay)
	}
}
