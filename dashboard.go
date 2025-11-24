package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"time"
)

type Dashboard struct {
	server *http.Server
	stats  *DashboardStats
}

type DashboardStats struct {
	ConnectionStatus string        `json:"connection_status"`
	CurrentProvider  string        `json:"current_provider"`
	Uptime          time.Duration `json:"uptime"`
	DataTransferred int64         `json:"data_transferred"`
	ActiveSessions  int           `json:"active_sessions"`
	ProviderHealth  []ProviderStatus `json:"provider_health"`
}

type ProviderStatus struct {
	Name    string `json:"name"`
	Status  string `json:"status"`
	Latency int    `json:"latency"`
}

func NewDashboard() *Dashboard {
	return &Dashboard{
		stats: &DashboardStats{
			ConnectionStatus: "Connected",
			CurrentProvider:  "oxylabs",
			Uptime:          time.Hour * 2,
			DataTransferred:  1024 * 1024 * 150, // 150MB
			ActiveSessions:   3,
			ProviderHealth: []ProviderStatus{
				{Name: "oxylabs", Status: "healthy", Latency: 120},
				{Name: "smartproxy", Status: "healthy", Latency: 145},
				{Name: "bright", Status: "degraded", Latency: 280},
				{Name: "proxy6", Status: "healthy", Latency: 95},
			},
		},
	}
}

func (d *Dashboard) Start() error {
	mux := http.NewServeMux()
	
	// Static routes
	mux.HandleFunc("/", d.handleDashboard)
	mux.HandleFunc("/api/stats", d.handleStats)
	mux.HandleFunc("/api/switch-provider", d.handleSwitchProvider)
	mux.HandleFunc("/api/toggle-killswitch", d.handleToggleKillswitch)
	
	d.server = &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}
	
	fmt.Println("🌐 Starting Atlantic Proxy Dashboard on http://localhost:8080")
	return d.server.ListenAndServe()
}

func (d *Dashboard) handleDashboard(w http.ResponseWriter, r *http.Request) {
	tmpl := `<!DOCTYPE html>
<html>
<head>
    <title>Atlantic Proxy Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-value { font-size: 2em; font-weight: bold; color: #27ae60; }
        .providers { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .provider { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee; }
        .status-healthy { color: #27ae60; }
        .status-degraded { color: #f39c12; }
        .status-unhealthy { color: #e74c3c; }
        .controls { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 20px; }
        button { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-right: 10px; }
        button:hover { background: #2980b9; }
        .killswitch { background: #e74c3c; }
        .killswitch:hover { background: #c0392b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌊 Atlantic Proxy Dashboard</h1>
            <p>Enterprise-Grade Always-On Proxy Platform</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Connection Status</h3>
                <div class="stat-value" id="connection-status">{{.ConnectionStatus}}</div>
            </div>
            <div class="stat-card">
                <h3>Current Provider</h3>
                <div class="stat-value" id="current-provider">{{.CurrentProvider}}</div>
            </div>
            <div class="stat-card">
                <h3>Uptime</h3>
                <div class="stat-value" id="uptime">{{.Uptime}}</div>
            </div>
            <div class="stat-card">
                <h3>Active Sessions</h3>
                <div class="stat-value" id="active-sessions">{{.ActiveSessions}}</div>
            </div>
        </div>
        
        <div class="providers">
            <h3>Provider Health Status</h3>
            <div id="provider-list">
                {{range .ProviderHealth}}
                <div class="provider">
                    <span>{{.Name}}</span>
                    <span class="status-{{.Status}}">{{.Status}} ({{.Latency}}ms)</span>
                </div>
                {{end}}
            </div>
        </div>
        
        <div class="controls">
            <h3>Controls</h3>
            <button onclick="switchProvider()">Switch Provider</button>
            <button onclick="toggleKillswitch()" class="killswitch">Toggle Kill Switch</button>
            <button onclick="refreshStats()">Refresh Stats</button>
        </div>
    </div>
    
    <script>
        function refreshStats() {
            fetch('/api/stats')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('connection-status').textContent = data.connection_status;
                    document.getElementById('current-provider').textContent = data.current_provider;
                    document.getElementById('uptime').textContent = formatDuration(data.uptime);
                    document.getElementById('active-sessions').textContent = data.active_sessions;
                    
                    const providerList = document.getElementById('provider-list');
                    providerList.innerHTML = '';
                    data.provider_health.forEach(provider => {
                        const div = document.createElement('div');
                        div.className = 'provider';
                        div.innerHTML = '<span>' + provider.name + '</span><span class="status-' + provider.status + '">' + provider.status + ' (' + provider.latency + 'ms)</span>';
                        providerList.appendChild(div);
                    });
                });
        }
        
        function switchProvider() {
            fetch('/api/switch-provider', {method: 'POST'})
                .then(() => refreshStats());
        }
        
        function toggleKillswitch() {
            fetch('/api/toggle-killswitch', {method: 'POST'})
                .then(() => refreshStats());
        }
        
        function formatDuration(ns) {
            const hours = Math.floor(ns / 3600000000000);
            const minutes = Math.floor((ns % 3600000000000) / 60000000000);
            return hours + 'h ' + minutes + 'm';
        }
        
        // Auto-refresh every 5 seconds
        setInterval(refreshStats, 5000);
    </script>
</body>
</html>`
	
	t, _ := template.New("dashboard").Parse(tmpl)
	t.Execute(w, d.stats)
}

func (d *Dashboard) handleStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(d.stats)
}

func (d *Dashboard) handleSwitchProvider(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	// Simulate provider switching
	providers := []string{"oxylabs", "smartproxy", "bright", "proxy6"}
	for i, p := range providers {
		if p == d.stats.CurrentProvider {
			d.stats.CurrentProvider = providers[(i+1)%len(providers)]
			break
		}
	}
	
	fmt.Printf("🔄 Provider switched to: %s\n", d.stats.CurrentProvider)
	w.WriteHeader(http.StatusOK)
}

func (d *Dashboard) handleToggleKillswitch(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	// Simulate kill switch toggle
	if d.stats.ConnectionStatus == "Connected" {
		d.stats.ConnectionStatus = "Kill Switch Active"
		fmt.Println("🛡️  Kill switch activated")
	} else {
		d.stats.ConnectionStatus = "Connected"
		fmt.Println("✅ Kill switch deactivated")
	}
	
	w.WriteHeader(http.StatusOK)
}

func main() {
	dashboard := NewDashboard()
	
	fmt.Println("🚀 Atlantic Proxy Dashboard Starting...")
	fmt.Println("📊 Real-time monitoring and control interface")
	
	if err := dashboard.Start(); err != nil {
		fmt.Printf("Dashboard error: %v\n", err)
	}
}