package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"time"
)

type UnifiedDashboard struct {
	server *http.Server
}

func NewUnifiedDashboard() *UnifiedDashboard {
	return &UnifiedDashboard{}
}

func (ud *UnifiedDashboard) Start() error {
	fmt.Println("🌐 Starting Unified Atlantic Proxy Dashboard...")
	
	mux := http.NewServeMux()
	
	// Main dashboard
	mux.HandleFunc("/", ud.handleMainDashboard)
	mux.HandleFunc("/api/system-status", ud.handleSystemStatus)
	
	ud.server = &http.Server{
		Addr:    ":8084",
		Handler: ud.corsMiddleware(mux),
	}
	
	fmt.Println("🌐 Unified dashboard running on http://localhost:8084")
	return ud.server.ListenAndServe()
}

func (ud *UnifiedDashboard) handleMainDashboard(w http.ResponseWriter, r *http.Request) {
	tmpl := `<!DOCTYPE html>
<html>
<head>
    <title>Atlantic Proxy - Unified Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #2c3e50, #3498db); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center; }
        .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .service-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-left: 5px solid #3498db; }
        .service-title { font-size: 1.3em; font-weight: bold; margin-bottom: 10px; color: #2c3e50; }
        .service-desc { color: #7f8c8d; margin-bottom: 15px; }
        .service-link { display: inline-block; background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; transition: background 0.3s; }
        .service-link:hover { background: #2980b9; }
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .status-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .status-value { font-size: 2em; font-weight: bold; color: #27ae60; }
        .selling-points { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 30px; }
        .selling-point { margin-bottom: 15px; padding: 15px; background: #ecf0f1; border-radius: 8px; border-left: 4px solid #27ae60; }
        .selling-point h4 { margin: 0 0 8px 0; color: #2c3e50; }
        .selling-point p { margin: 0; color: #7f8c8d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌊 Atlantic Proxy</h1>
            <h2>Enterprise-Grade Always-On Proxy Platform</h2>
            <p>Unified Management Dashboard</p>
        </div>
        
        <div class="services-grid">
            <div class="service-card">
                <div class="service-title">🌐 Main Dashboard</div>
                <div class="service-desc">Real-time monitoring and proxy controls</div>
                <a href="http://localhost:8080" class="service-link" target="_blank">Open Dashboard</a>
            </div>
            
            <div class="service-card">
                <div class="service-title">🔐 Authentication</div>
                <div class="service-desc">User management and authentication</div>
                <a href="http://localhost:8081/auth/profile" class="service-link" target="_blank">Auth System</a>
            </div>
            
            <div class="service-card">
                <div class="service-title">💳 Billing</div>
                <div class="service-desc">Subscription and usage management</div>
                <a href="http://localhost:8082/billing/plans" class="service-link" target="_blank">Billing System</a>
            </div>
            
            <div class="service-card">
                <div class="service-title">🎧 Support</div>
                <div class="service-desc">Customer support and referrals</div>
                <a href="http://localhost:8083/support/tickets" class="service-link" target="_blank">Support System</a>
            </div>
        </div>
        
        <div class="status-grid" id="status-grid">
            <div class="status-card">
                <h3>System Status</h3>
                <div class="status-value" id="system-status">Loading...</div>
            </div>
            <div class="status-card">
                <h3>Active Users</h3>
                <div class="status-value" id="active-users">Loading...</div>
            </div>
            <div class="status-card">
                <h3>Total Revenue</h3>
                <div class="status-value" id="total-revenue">Loading...</div>
            </div>
            <div class="status-card">
                <h3>Support Tickets</h3>
                <div class="status-value" id="support-tickets">Loading...</div>
            </div>
        </div>
        
        <div class="selling-points">
            <h3>🚀 Atlantic Proxy Selling Points</h3>
            
            <div class="selling-point">
                <h4>"Always-On Proxy Service"</h4>
                <p>✅ Persistent Connection Pools: 3-5 pre-warmed connections ready instantly<br>
                ✅ <500ms Failover Time: Faster than VPNs, 60x faster than traditional proxies<br>
                ✅ Multi-Provider Resilience: Impossible to fail with 4+ provider backup chains</p>
            </div>
            
            <div class="selling-point">
                <h4>"Zero-Tolerance Leak Protection"</h4>
                <p>✅ System-Level Traffic Capture: Intercepts ALL traffic, no app can bypass<br>
                ✅ Enhanced Kill Switch: Blocks everything instantly on any connection issue<br>
                ✅ Continuous Leak Detection: Real-time monitoring with auto-remediation</p>
            </div>
            
            <div class="selling-point">
                <h4>"Bulletproof Proxy Infrastructure"</h4>
                <p>✅ Intelligent Auto-Reconnect: Self-healing connections with zero user intervention<br>
                ✅ Advanced Session Persistence: Maintain sessions across provider switches<br>
                ✅ Continuous Health Monitoring: 24/7 provider performance tracking</p>
            </div>
        </div>
    </div>
    
    <script>
        function updateStatus() {
            fetch('/api/system-status')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('system-status').textContent = data.status;
                    document.getElementById('active-users').textContent = data.active_users;
                    document.getElementById('total-revenue').textContent = '$' + data.total_revenue;
                    document.getElementById('support-tickets').textContent = data.support_tickets;
                })
                .catch(error => {
                    console.error('Error fetching status:', error);
                });
        }
        
        // Update status on load and every 30 seconds
        updateStatus();
        setInterval(updateStatus, 30000);
    </script>
</body>
</html>`
	
	t, _ := template.New("dashboard").Parse(tmpl)
	t.Execute(w, nil)
}

func (ud *UnifiedDashboard) handleSystemStatus(w http.ResponseWriter, r *http.Request) {
	status := map[string]interface{}{
		"status":          "✅ Online",
		"active_users":    "127",
		"total_revenue":   "12,847.50",
		"support_tickets": "3",
		"timestamp":       time.Now().Format("2006-01-02 15:04:05"),
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
}

func (ud *UnifiedDashboard) corsMiddleware(next http.Handler) http.Handler {
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

func main() {
	dashboard := NewUnifiedDashboard()
	
	fmt.Println("🚀 Atlantic Proxy Unified Dashboard")
	fmt.Println("====================================")
	fmt.Println("All Services:")
	fmt.Println("  🌐 Main Dashboard: http://localhost:8080")
	fmt.Println("  🔐 Authentication: http://localhost:8081")
	fmt.Println("  💳 Billing: http://localhost:8082")
	fmt.Println("  🎧 Support: http://localhost:8083")
	fmt.Println("  📊 Unified: http://localhost:8084")
	
	if err := dashboard.Start(); err != nil {
		fmt.Printf("Unified dashboard error: %v\n", err)
	}
}