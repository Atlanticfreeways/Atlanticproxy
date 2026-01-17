# AtlanticProxy Client - VPN-Grade Standby Proxy

A transparent proxy client that provides VPN-like always-on connectivity through Oxylabs proxy infrastructure.

## 🎯 Core Features

- **System-level traffic interception** - Captures ALL network traffic via TUN interface
- **Kill switch protection** - Blocks traffic if proxy fails
- **Automatic failover** - <2 second recovery from proxy failures
- **Network change adaptation** - Survives WiFi/cellular switching
- **Continuous anonymity verification** - Real-time leak detection
- **Zero configuration** - Works transparently with all applications

## 🚀 Quick Start

### Prerequisites
- Linux/macOS with root privileges
- Go 1.21+ (for building from source)
- Oxylabs proxy credentials

### Installation

```bash
# Clone repository
git clone https://github.com/atlanticproxy/proxy-client
cd proxy-client

# Set up development environment
make dev-setup

# Build for local platform
make build-local

# Install as system service
make install-service

# Configure credentials
sudo mkdir -p /etc/atlanticproxy
echo "OXYLABS_USERNAME=your_username" | sudo tee -a /etc/atlanticproxy/config.env
echo "OXYLABS_PASSWORD=your_password" | sudo tee -a /etc/atlanticproxy/config.env

# Start service
sudo systemctl start atlantic-proxy
```

### Manual Run (Development)
```bash
# Set environment variables
export OXYLABS_USERNAME=your_username
export OXYLABS_PASSWORD=your_password

# Run with root privileges
sudo make run
```

## 🔧 Configuration

### Environment Variables
```bash
OXYLABS_USERNAME=your_oxylabs_username
OXYLABS_PASSWORD=your_oxylabs_password

# Bright Data (New)
BRIGHTDATA_USERNAME=brd-customer-YOUR_USERNAME
BRIGHTDATA_PASSWORD=YOUR_PASSWORD
PROVIDER_TYPE=brightdata
```

### Bright Data Features
- **Residential proxies** (195+ countries)
- **Automatic IP rotation**
- **Sticky sessions** (1min, 10min, 30min)
- **City-level targeting**
- **High success rate** (>99%)

### Configuration File
Create `/etc/atlanticproxy/config.yaml`:
```yaml
interceptor:
  interface_name: "atlantic-tun0"
  tun_ip: "10.8.0.1"
  tun_netmask: "255.255.255.0"

proxy:
  oxylabs_username: "${OXYLABS_USERNAME}"
  oxylabs_password: "${OXYLABS_PASSWORD}"
  listen_addr: "127.0.0.1:8080"
  health_check_url: "https://httpbin.org/ip"

killswitch:
  enabled: true
  whitelist:
    - "127.0.0.1"
    - "localhost"
    - "10.0.0.0/8"
    - "192.168.0.0/16"

monitor:
  check_interval: 5
```

## 🛠️ Development

### Build Commands
```bash
make build          # Build for all platforms
make build-local     # Build for current platform
make test           # Run tests
make clean          # Clean build artifacts
```

### Service Management
```bash
make install-service    # Install systemd service
make uninstall-service  # Remove systemd service
make logs              # View service logs
```

## 🔍 How It Works

### 1. Traffic Interception
- Creates TUN interface `atlantic-tun0`
- Configures routing to capture all traffic
- Processes packets at network layer

### 2. Proxy Routing
- Routes traffic through Oxylabs endpoints
- Load balances across multiple proxy servers
- Maintains persistent connection pools

### 3. Kill Switch Protection
- Uses iptables to block traffic on proxy failure
- Whitelists essential system traffic
- Automatically restores connection when proxy recovers

### 4. Network Monitoring
- Detects network interface changes
- Adapts to WiFi/cellular switching
- Preserves connection state during transitions

## 📊 Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Applications  │    │  TUN Interface   │    │  Proxy Engine   │
│                 │───▶│  atlantic-tun0   │───▶│  Oxylabs Pool   │
│  (Chrome, etc.) │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                       ┌──────────────────┐    ┌─────────────────┐
                       │  Kill Switch     │    │ Network Monitor │
                       │  Guardian        │    │                 │
                       └──────────────────┘    └─────────────────┘
```

## 🔒 Security Features

- **Root privilege management** - Secure privilege escalation
- **Kill switch protection** - No traffic leaks on failure
- **Anonymity verification** - Continuous IP leak detection
- **Secure configuration** - Encrypted credential storage

## 📈 Performance

- **<20ms latency overhead** - Optimized packet processing
- **>90% speed retention** - Efficient proxy routing
- **<2 second failover** - Instant proxy switching
- **<50MB memory usage** - Lightweight system service

## 🐛 Troubleshooting

### Check Service Status
```bash
sudo systemctl status atlantic-proxy
sudo journalctl -u atlantic-proxy -f
```

### Verify TUN Interface
```bash
ip addr show atlantic-tun0
ip route show table 100
```

### Test Proxy Connectivity
```bash
curl --proxy http://username:password@pr.oxylabs.io:7777 https://httpbin.org/ip
```

### Common Issues

1. **Permission denied** - Ensure running with root privileges
2. **TUN interface creation failed** - Check if TUN/TAP kernel module is loaded
3. **Proxy authentication failed** - Verify Oxylabs credentials
4. **Kill switch blocking traffic** - Check iptables rules

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📞 Support

- GitHub Issues: https://github.com/atlanticproxy/proxy-client/issues
- Documentation: https://docs.atlanticproxy.com
- Email: support@atlanticproxy.com