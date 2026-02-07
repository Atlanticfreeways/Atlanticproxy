# PWA Proxy Credentials System

**Goal:** PWA dashboard that generates proxy credentials users can use in any proxy client app

---

## 🎯 Architecture

```
User Device
    ↓
AtlanticProxy PWA (installed)
    ↓
Generates Proxy Credentials
    ↓
User copies credentials to:
    - Super Proxy app
    - Browser proxy settings
    - Scraping tools
    - Any SOCKS5/HTTP client
```

---

## 🔌 Supported Protocols

### **1. HTTP/HTTPS Proxy**
```
Format: http://username:password@proxy.atlanticproxy.com:8080
```

**Use in:**
- Browsers (Chrome, Firefox)
- cURL
- Python requests
- Any HTTP client

### **2. SOCKS5 Proxy**
```
Format: socks5://username:password@proxy.atlanticproxy.com:1080
```

**Use in:**
- Super Proxy app
- Telegram
- Discord
- SSH tunneling
- Any SOCKS5 client

### **3. Shadowsocks (Premium)**
```
Format: ss://method:password@proxy.atlanticproxy.com:8388
```

**Use in:**
- Shadowsocks clients
- V2Ray
- Clash
- Mobile VPN apps

---

## 🏗️ Implementation

### **Backend: Credential Generation**

```go
// internal/api/credentials.go
package api

type ProxyCredentials struct {
    UserID    string    `json:"user_id"`
    Username  string    `json:"username"`
    Password  string    `json:"password"`
    HTTP      string    `json:"http_proxy"`
    HTTPS     string    `json:"https_proxy"`
    SOCKS5    string    `json:"socks5_proxy"`
    SS        string    `json:"shadowsocks"`
    ExpiresAt time.Time `json:"expires_at"`
}

func (s *Server) handleGetCredentials(c *gin.Context) {
    userID := c.GetString("user_id")
    
    // Generate unique credentials per user
    creds := generateCredentials(userID)
    
    c.JSON(200, creds)
}

func generateCredentials(userID string) ProxyCredentials {
    // Generate unique username/password
    username := fmt.Sprintf("atlantic-%s", userID[:8])
    password := generateSecurePassword()
    
    // Build proxy URLs
    domain := "proxy.atlanticproxy.com"
    
    return ProxyCredentials{
        UserID:   userID,
        Username: username,
        Password: password,
        HTTP:     fmt.Sprintf("http://%s:%s@%s:8080", username, password, domain),
        HTTPS:    fmt.Sprintf("https://%s:%s@%s:8443", username, password, domain),
        SOCKS5:   fmt.Sprintf("socks5://%s:%s@%s:1080", username, password, domain),
        SS:       generateShadowsocksURI(username, password, domain),
        ExpiresAt: time.Now().Add(30 * 24 * time.Hour), // 30 days
    }
}
```

### **Frontend: PWA Credentials Page**

```typescript
// app/dashboard/credentials/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Credentials {
    username: string;
    password: string;
    http_proxy: string;
    https_proxy: string;
    socks5_proxy: string;
    shadowsocks: string;
    expires_at: string;
}

export default function CredentialsPage() {
    const [creds, setCreds] = useState<Credentials | null>(null);
    const [copied, setCopied] = useState('');

    useEffect(() => {
        loadCredentials();
    }, []);

    const loadCredentials = async () => {
        const data = await apiClient.getCredentials();
        setCreds(data);
    };

    const copy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(''), 2000);
    };

    if (!creds) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Proxy Credentials</h1>
                <p className="text-neutral-400 mt-1">
                    Use these credentials in any proxy client app
                </p>
            </div>

            {/* HTTP/HTTPS */}
            <Card className="bg-neutral-800 border-neutral-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                    HTTP/HTTPS Proxy
                </h2>
                <div className="space-y-3">
                    <div>
                        <div className="text-sm text-neutral-400 mb-1">HTTP Proxy</div>
                        <div className="flex gap-2">
                            <input
                                value={creds.http_proxy}
                                readOnly
                                className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white font-mono text-sm"
                            />
                            <Button
                                onClick={() => copy(creds.http_proxy, 'http')}
                                size="sm"
                            >
                                {copied === 'http' ? '✓ Copied' : 'Copy'}
                            </Button>
                        </div>
                    </div>
                    <div className="text-xs text-neutral-500">
                        Use in: Chrome, Firefox, cURL, Python requests
                    </div>
                </div>
            </Card>

            {/* SOCKS5 */}
            <Card className="bg-neutral-800 border-neutral-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                    SOCKS5 Proxy
                </h2>
                <div className="space-y-3">
                    <div>
                        <div className="text-sm text-neutral-400 mb-1">SOCKS5 URL</div>
                        <div className="flex gap-2">
                            <input
                                value={creds.socks5_proxy}
                                readOnly
                                className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white font-mono text-sm"
                            />
                            <Button
                                onClick={() => copy(creds.socks5_proxy, 'socks5')}
                                size="sm"
                            >
                                {copied === 'socks5' ? '✓ Copied' : 'Copy'}
                            </Button>
                        </div>
                    </div>
                    <div className="text-xs text-neutral-500">
                        Use in: Super Proxy, Telegram, SSH tunneling
                    </div>
                </div>
            </Card>

            {/* Shadowsocks */}
            <Card className="bg-neutral-800 border-neutral-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                    Shadowsocks (Premium)
                </h2>
                <div className="space-y-3">
                    <div>
                        <div className="text-sm text-neutral-400 mb-1">SS URI</div>
                        <div className="flex gap-2">
                            <input
                                value={creds.shadowsocks}
                                readOnly
                                className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white font-mono text-sm"
                            />
                            <Button
                                onClick={() => copy(creds.shadowsocks, 'ss')}
                                size="sm"
                            >
                                {copied === 'ss' ? '✓ Copied' : 'Copy'}
                            </Button>
                        </div>
                    </div>
                    <div className="text-xs text-neutral-500">
                        Use in: Shadowsocks clients, V2Ray, Clash
                    </div>
                </div>
            </Card>

            {/* Manual Config */}
            <Card className="bg-neutral-800 border-neutral-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                    Manual Configuration
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <div className="text-neutral-400">Username</div>
                        <div className="text-white font-mono">{creds.username}</div>
                    </div>
                    <div>
                        <div className="text-neutral-400">Password</div>
                        <div className="text-white font-mono">{creds.password}</div>
                    </div>
                    <div>
                        <div className="text-neutral-400">HTTP Port</div>
                        <div className="text-white font-mono">8080</div>
                    </div>
                    <div>
                        <div className="text-neutral-400">SOCKS5 Port</div>
                        <div className="text-white font-mono">1080</div>
                    </div>
                </div>
            </Card>

            {/* QR Code for Mobile */}
            <Card className="bg-neutral-800 border-neutral-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                    Mobile Setup
                </h2>
                <div className="flex items-center gap-4">
                    <div className="w-32 h-32 bg-white p-2 rounded">
                        {/* QR Code component */}
                        <QRCode value={creds.socks5_proxy} />
                    </div>
                    <div className="text-sm text-neutral-400">
                        Scan with Super Proxy or any SOCKS5 client
                    </div>
                </div>
            </Card>
        </div>
    );
}
```

### **PWA Configuration**

```typescript
// app/manifest.json
{
  "name": "AtlanticProxy",
  "short_name": "AtlanticProxy",
  "description": "Premium Residential Proxy Service",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#0ea5e9",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

```typescript
// app/layout.tsx - Add PWA meta tags
<head>
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#0ea5e9" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black" />
  <link rel="apple-touch-icon" href="/icon-192.png" />
</head>
```

---

## 🔐 Authentication Flow

```
1. User logs into PWA
2. Backend generates unique credentials
3. Credentials tied to user's subscription
4. User copies credentials
5. Pastes into Super Proxy or any client
6. Client connects through AtlanticProxy servers
7. Backend validates credentials
8. Routes traffic through BrightData/Oxylabs
```

---

## 🌐 Proxy Server Architecture

```
User's Super Proxy App
    ↓
SOCKS5: atlantic-user123:pass@proxy.atlanticproxy.com:1080
    ↓
Your Proxy Server (validates credentials)
    ↓
Checks user's subscription/credits
    ↓
Routes through BrightData with user's settings
    ↓
Target Website
```

---

## 📱 User Experience

### **Step 1: Install PWA**
```
1. Visit atlanticproxy.com
2. Click "Install App" (browser prompt)
3. App installs to home screen
```

### **Step 2: Get Credentials**
```
1. Open AtlanticProxy app
2. Navigate to "Credentials" tab
3. See all proxy URLs
4. Copy desired format
```

### **Step 3: Use in Super Proxy**
```
1. Open Super Proxy app
2. Add new proxy
3. Paste SOCKS5 URL
4. Connect
5. All device traffic routes through AtlanticProxy
```

---

## ✅ Implementation Tasks

### **Backend (2 days)**
- [ ] Add credentials generation endpoint
- [ ] Implement credential validation middleware
- [ ] Set up proxy authentication server
- [ ] Configure SOCKS5/HTTP/SS protocols
- [ ] Link credentials to user subscriptions

### **Frontend (2 days)**
- [ ] Create credentials page
- [ ] Add copy-to-clipboard functionality
- [ ] Generate QR codes for mobile
- [ ] Add PWA manifest
- [ ] Implement service worker
- [ ] Add install prompt

### **Infrastructure (1 day)**
- [ ] Set up proxy.atlanticproxy.com domain
- [ ] Configure ports (8080, 1080, 8388)
- [ ] SSL certificates
- [ ] Load balancer
- [ ] DDoS protection

---

## 🎯 Protocols Summary

| Protocol | Port | Use Case | Format |
|----------|------|----------|--------|
| **HTTP** | 8080 | Web browsers, cURL | `http://user:pass@host:8080` |
| **HTTPS** | 8443 | Secure web traffic | `https://user:pass@host:8443` |
| **SOCKS5** | 1080 | Super Proxy, apps | `socks5://user:pass@host:1080` |
| **Shadowsocks** | 8388 | Mobile VPNs | `ss://method:pass@host:8388` |

---

## 🚀 Benefits

**For Users:**
- ✅ One PWA for all devices
- ✅ Works with any proxy client
- ✅ No need to install desktop app
- ✅ Credentials work everywhere
- ✅ Easy to share (QR code)

**For You:**
- ✅ Simpler than desktop app
- ✅ Cross-platform (iOS, Android, Desktop)
- ✅ Easy updates (just deploy)
- ✅ Lower development cost
- ✅ Standard protocols (compatible with everything)

---

**Ready to implement PWA + Credentials system?**
