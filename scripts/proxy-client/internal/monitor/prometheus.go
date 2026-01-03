package monitor

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	ActiveConnections = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "atlantic_proxy_active_connections",
		Help: "The total number of active proxy connections",
	})

	ProcessedBytes = promauto.NewCounter(prometheus.CounterOpts{
		Name: "atlantic_proxy_processed_bytes_total",
		Help: "The total number of bytes processed by the proxy",
	})

	RequestDuration = promauto.NewHistogram(prometheus.HistogramOpts{
		Name:    "atlantic_proxy_request_duration_seconds",
		Help:    "Histogram of request durations in seconds",
		Buckets: prometheus.DefBuckets,
	})

	RotationSuccess = promauto.NewCounter(prometheus.CounterOpts{
		Name: "atlantic_proxy_rotation_success_total",
		Help: "Total number of successful proxy rotations",
	})

	RotationFailure = promauto.NewCounter(prometheus.CounterOpts{
		Name: "atlantic_proxy_rotation_failure_total",
		Help: "Total number of failed proxy rotations",
	})
)
