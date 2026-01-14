package validator

import (
	"context"
	"math/rand"
	"time"
)

type TrafficProtector struct {
	jitterEnabled bool
	minDelay      time.Duration
	maxDelay      time.Duration
}

func NewTrafficProtector() *TrafficProtector {
	return &TrafficProtector{
		jitterEnabled: true,
		minDelay:      10 * time.Millisecond,
		maxDelay:      50 * time.Millisecond,
	}
}

// AddJitter introduces random latency to defeat timing analysis
func (p *TrafficProtector) AddJitter(ctx context.Context) error {
	if !p.jitterEnabled {
		return nil
	}

	// Calculate random delay
	delta := int64(p.maxDelay - p.minDelay)
	if delta <= 0 {
		return nil
	}

	delay := p.minDelay + time.Duration(rand.Int63n(delta))

	timer := time.NewTimer(delay)
	select {
	case <-ctx.Done():
		timer.Stop()
		return ctx.Err()
	case <-timer.C:
		return nil
	}
}

// ShapeTraffic simulates user activity patterns (padding, bursts)
func (p *TrafficProtector) ShapeTraffic(packet []byte) []byte {
	// In strict mode, we might pad packets to uniform sizes
	// For now, return as is
	return packet
}
