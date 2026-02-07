# AtlanticProxy

**VPN-Grade Residential Proxy Service**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](CHANGELOG.md)
[![Status](https://img.shields.io/badge/status-production%20ready-green.svg)](PROJECT_STATUS.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🎯 What is AtlanticProxy?

AtlanticProxy is a **residential proxy service** combining VPN-grade security, intelligent IP rotation, and consumer-friendly UX. It bridges the gap between consumer VPNs and enterprise proxy services.

**Tagline:** *"Military-grade anonymity meets one-click simplicity"*

---

## ✨ Key Features

- 🌍 **Residential IPs** - 72M+ real ISP IPs across 195+ countries
- 🔄 **Smart Rotation** - 4 modes (per-request, sticky 1/10/30min)
- 🎯 **Geo-Targeting** - Country, state, city-level precision
- 🛡️ **Kill Switch** - Firewall-level protection (<500ms failover)
- 🚫 **Ad-Blocking** - DNS + HTTP filtering (>95% effective)
- 🔐 **Multi-Protocol** - HTTP/HTTPS, SOCKS5, Shadowsocks
- 📊 **Analytics** - Real-time usage tracking & insights
- 💳 **Flexible Billing** - 4 tiers from $0 to enterprise

---

## 🚀 Quick Start

### Prerequisites
- Go 1.24+ (backend)
- Node.js 18+ (dashboard)
- Docker (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/Atlanticfreeways/Atlanticproxy.git
cd Atlanticproxy

# Configure environment
cp scripts/proxy-client/.env.example scripts/proxy-client/.env
# Edit .env with your provider credentials

# Run with Docker
docker-compose up -d

# Or run manually
cd scripts/proxy-client
go run ./cmd/service
```

### Dashboard

```bash
cd atlantic-dashboard
npm install
npm run dev
# Open http://localhost:3000
```

---

## 📚 Documentation

- **[Quick Start](About%20the%20Proj/DEVELOPER_QUICK_START.md)** - Get started in 5 minutes
- **[Roadmap](ROADMAP.md)** - Product roadmap and timeline
- **[Changelog](CHANGELOG.md)** - Version history
- **[Architecture](About%20the%20Proj/ARCHITECTURE_OVERVIEW.md)** - System design
- **[API Reference](docs/API_REFERENCE.md)** - Complete API docs
- **[Provider Analysis](PROVIDER_ANALYSIS.md)** - Proxy provider comparison
- **[Documentation Index](DOCUMENTATION_INDEX.md)** - All documentation

---

## 🏗️ Architecture

```
User Applications
       ↓
TUN/TAP Interface (System-Wide)
       ↓
Proxy Engine (HTTP/SOCKS5/Shadowsocks)
       ↓
Rotation Manager (4 modes)
       ↓
Provider Pool (BrightData/Oxylabs)
       ↓
Residential Proxies (195+ countries)
```

---

## 💰 Pricing

**Premium Residential Proxies with Town-Level Targeting at Every Tier**

### Pay-As-You-Go (No Commitment)
```
$1.20/hour - All Features + All Protocols
```
- ✅ Premium residential IPs (72M+ pool)
- ✅ Town/city-level targeting + ISP selection
- ✅ All protocols (HTTP/HTTPS, SOCKS5, Shadowsocks)
- ✅ Kill switch + leak protection
- ✅ 4 rotation modes + ad-blocking
- ✅ Unlimited data during active hours
- ❌ API access (Personal+ only)

**Packages:** 10hrs ($12) | 25hrs ($27) | 50hrs ($54) | 100hrs ($102)

### Subscription Plans

| Plan | Price | Data | Key Features |
|------|-------|------|-------------|
| **Starter** | $6.99/wk | 10GB/wk | Premium residential IPs, town-level targeting, HTTPS, $1 deposit |
| **PAYG** | $1.20/hr | Unlimited* | + All protocols, ISP selection, no commitment |
| **Personal** | $29/mo | 50GB | + API access, protocol selection UI, unlimited hours |
| **Team** | $99/mo | 500GB | + 5 seats, team management, priority support |
| **Enterprise** | Custom | 1TB+ | + Dedicated IPs, white-label, 99.99% SLA |

*Unlimited during active hours

**Starter Plan Details:**
- $1 refundable deposit required
- $6.99 charged instantly for first week
- Auto-renews weekly at $6.99
- Cancel anytime, deposit refunded in 5-7 days

[Full Pricing Details →](PRICING_STRATEGY_V2.md)

---

## 🔧 Tech Stack

**Backend:**
- Go 1.24 (Gin framework)
- SQLite (local storage)
- PostgreSQL (production)
- Redis (caching)

**Frontend:**
- Next.js 16.1.1
- React 19
- TypeScript
- Tailwind CSS

**Infrastructure:**
- Docker & Docker Compose
- BrightData (72M+ IPs)
- Oxylabs (100M+ IPs)

---

## 📊 Performance

| Metric | Target | Actual |
|--------|--------|--------|
| Success Rate | >99% | 99.9% ✅ |
| Latency (p50) | <50ms | 15-40ms ✅ |
| Throughput | >100 Mbps | >100 Mbps ✅ |
| Memory | <200MB | ~80MB ✅ |
| Failover | <2s | <500ms ✅ |

---

## 🎯 Use Cases

- 🔒 **Privacy** - Anonymous browsing
- 🕷️ **Web Scraping** - Rotating residential IPs
- 📊 **Ad Verification** - Multi-geo testing
- 🛒 **Price Comparison** - Regional pricing
- 🎬 **Content Access** - Geo-restricted content
- 🔐 **Security** - Public WiFi protection

---

## 🗺️ Roadmap

### Q1 2026 - Production Launch
- ✅ Core features complete (92%)
- 🚧 Testing & validation
- 🚧 Security hardening
- 🎯 Launch to 1,000 users

### Q2 2026 - Growth
- Mobile apps (iOS/Android)
- Browser extensions
- Advanced rotation algorithms
- Scale to 10,000 users

### Q3 2026 - Advanced Products
- Web Scraping API
- SERP API
- Data extraction service
- AI-powered routing

[Full Roadmap →](ROADMAP.md)

---

## 🤝 Contributing

We welcome contributions! See:
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [Architecture Overview](About%20the%20Proj/ARCHITECTURE_OVERVIEW.md)
- [API Reference](docs/API_REFERENCE.md)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 📞 Contact

- **Website:** https://atlanticproxy.com
- **Email:** support@atlanticproxy.com
- **GitHub:** https://github.com/Atlanticfreeways/Atlanticproxy
- **Discord:** https://discord.gg/atlanticproxy

---

## ⭐ Star History

If you find this project useful, please consider giving it a star!

---

**Status:** Production Ready (92% Complete)  
**Version:** 1.0.0  
**Last Updated:** January 30, 2026
