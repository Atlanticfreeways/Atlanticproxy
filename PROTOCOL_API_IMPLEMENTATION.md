# Protocol Selection & API Access Implementation

**Time:** 3-4 hours | **Priority:** HIGH  
**Plans:** Personal, Team, Enterprise only

---

## Overview

**Protocol Selection:** UI to choose HTTP/HTTPS, SOCKS5, or Shadowsocks per session  
**API Access:** Generate credentials and API keys for external app integration

---

## Backend Implementation (90 min)

### Task 1: Add Protocol Selection Endpoint
**File:** `scripts/proxy-client/internal/api/server.go`

```go
// Add to setupRoutes()
router.POST("/api/protocol/select", s.handleSelectProtocol)
router.GET("/api/credentials", s.handleGetCredentials)
router.POST("/api/credentials/regenerate", s.handleRegenerateCredentials)
```

### Task 2: Protocol Selection Handler
**File:** `scripts/proxy-client/internal/api/protocol.go` (new file)

```go
package api

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

type ProtocolConfig struct {
    Protocol string `json:"protocol"` // "http", "socks5", "shadowsocks"
    Port     int    `json:"port"`
}

type Credentials struct {
    HTTP        CredentialSet `json:"http"`
    SOCKS5      CredentialSet `json:"socks5"`
    Shadowsocks CredentialSet `json:"shadowsocks"`
}

type CredentialSet struct {
    Host     string `json:"host"`
    Port     int    `json:"port"`
    Username string `json:"username"`
    Password string `json:"password"`
    Method   string `json:"method,omitempty"` // For Shadowsocks
}

func (s *Server) handleSelectProtocol(c *gin.Context) {
    var req ProtocolConfig
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Validate protocol
    validProtocols := map[string]int{
        "http":        8080,
        "socks5":      1080,
        "shadowsocks": 8388,
    }

    port, valid := validProtocols[req.Protocol]
    if !valid {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid protocol"})
        return
    }

    // Store selected protocol in session/config
    s.config.ActiveProtocol = req.Protocol
    s.config.ActivePort = port

    c.JSON(http.StatusOK, gin.H{
        "protocol": req.Protocol,
        "port":     port,
        "status":   "active",
    })
}

func (s *Server) handleGetCredentials(c *gin.Context) {
    creds := Credentials{
        HTTP: CredentialSet{
            Host:     "proxy.atlanticproxy.com",
            Port:     8080,
            Username: s.config.Username,
            Password: s.config.Password,
        },
        SOCKS5: CredentialSet{
            Host:     "proxy.atlanticproxy.com",
            Port:     1080,
            Username: s.config.Username,
            Password: s.config.Password,
        },
        Shadowsocks: CredentialSet{
            Host:     "proxy.atlanticproxy.com",
            Port:     8388,
            Username: s.config.Username,
            Password: s.config.Password,
            Method:   "aes-256-gcm",
        },
    }

    c.JSON(http.StatusOK, creds)
}

func (s *Server) handleRegenerateCredentials(c *gin.Context) {
    // Generate new password
    newPassword := generateSecurePassword(32)
    s.config.Password = newPassword

    c.JSON(http.StatusOK, gin.H{
        "message":  "Credentials regenerated",
        "password": newPassword,
    })
}

func generateSecurePassword(length int) string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    // Implementation omitted for brevity
    return "generated_password_here"
}
```

---

## Frontend Implementation (120 min)

### Task 3: Add API Methods
**File:** `atlantic-dashboard/lib/api.ts`

```typescript
export interface ProtocolConfig {
    protocol: 'http' | 'socks5' | 'shadowsocks';
    port: number;
    status: string;
}

export interface CredentialSet {
    host: string;
    port: number;
    username: string;
    password: string;
    method?: string;
}

export interface Credentials {
    http: CredentialSet;
    socks5: CredentialSet;
    shadowsocks: CredentialSet;
}

// Add to ApiClient class
async selectProtocol(protocol: string): Promise<ProtocolConfig> {
    const response = await this.request('/api/protocol/select', {
        method: 'POST',
        body: JSON.stringify({ protocol }),
    });
    if (!response.ok) throw new Error('Failed to select protocol');
    return response.json();
}

async getCredentials(): Promise<Credentials> {
    const response = await this.request('/api/credentials');
    if (!response.ok) throw new Error('Failed to fetch credentials');
    return response.json();
}

async regenerateCredentials(): Promise<{ password: string }> {
    const response = await this.request('/api/credentials/regenerate', {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to regenerate credentials');
    return response.json();
}
```

### Task 4: Create Protocol Selection Page
**File:** `atlantic-dashboard/app/dashboard/protocol/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { apiClient, ProtocolConfig } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProtocolPage() {
    const [selected, setSelected] = useState<string>('http');
    const [loading, setLoading] = useState(false);

    const protocols = [
        {
            id: 'http',
            name: 'HTTP/HTTPS',
            icon: '🌐',
            port: 8080,
            description: 'Best for web browsing and REST APIs',
            useCases: ['Web scraping', 'API requests', 'Browser automation'],
        },
        {
            id: 'socks5',
            name: 'SOCKS5',
            icon: '🔌',
            port: 1080,
            description: 'System-wide proxy for any application',
            useCases: ['Gaming', 'Telegram', 'System-wide routing'],
        },
        {
            id: 'shadowsocks',
            name: 'Shadowsocks',
            icon: '🛡️',
            port: 8388,
            description: 'Encrypted proxy for censorship bypass',
            useCases: ['VPN alternative', 'Mobile apps', 'Censorship bypass'],
        },
    ];

    const handleSelect = async (protocol: string) => {
        setLoading(true);
        try {
            await apiClient.selectProtocol(protocol);
            setSelected(protocol);
        } catch (error) {
            console.error('Failed to select protocol:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Protocol Selection</h1>
                <p className="text-neutral-400 mt-1">Choose your proxy protocol</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {protocols.map((protocol) => (
                    <Card
                        key={protocol.id}
                        className={`p-6 cursor-pointer transition-all ${
                            selected === protocol.id
                                ? 'bg-sky-500/20 border-sky-500'
                                : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
                        }`}
                        onClick={() => handleSelect(protocol.id)}
                    >
                        <div className="text-4xl mb-3">{protocol.icon}</div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {protocol.name}
                        </h3>
                        <p className="text-sm text-neutral-400 mb-4">
                            {protocol.description}
                        </p>
                        <div className="text-xs text-neutral-500 mb-4">
                            Port: {protocol.port}
                        </div>
                        <div className="space-y-1">
                            {protocol.useCases.map((useCase, i) => (
                                <div key={i} className="text-xs text-neutral-400">
                                    • {useCase}
                                </div>
                            ))}
                        </div>
                        {selected === protocol.id && (
                            <div className="mt-4 text-sm text-sky-400 font-medium">
                                ✓ Active
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            <Card className="bg-neutral-800 border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                    💡 Protocol Guide
                </h3>
                <div className="space-y-2 text-sm text-neutral-400">
                    <p>
                        <strong className="text-white">HTTP/HTTPS:</strong> Use for web
                        scraping, API calls, and browser-based automation.
                    </p>
                    <p>
                        <strong className="text-white">SOCKS5:</strong> Use for
                        system-wide proxy, gaming, or applications that don't support
                        HTTP proxies.
                    </p>
                    <p>
                        <strong className="text-white">Shadowsocks:</strong> Use for
                        mobile VPN, censorship bypass, or when you need encrypted proxy
                        connections.
                    </p>
                </div>
            </Card>
        </div>
    );
}
```

### Task 5: Create API Credentials Page
**File:** `atlantic-dashboard/app/dashboard/api/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { apiClient, Credentials } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function APIPage() {
    const [credentials, setCredentials] = useState<Credentials | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        loadCredentials();
    }, []);

    const loadCredentials = async () => {
        try {
            const data = await apiClient.getCredentials();
            setCredentials(data);
        } catch (error) {
            console.error('Failed to load credentials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        if (!confirm('Regenerate credentials? Old credentials will stop working.')) return;
        try {
            await apiClient.regenerateCredentials();
            await loadCredentials();
        } catch (error) {
            console.error('Failed to regenerate:', error);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

    if (loading || !credentials) {
        return <div className="flex items-center justify-center h-96">
            <div className="animate-pulse text-neutral-400">Loading...</div>
        </div>;
    }

    const protocols = [
        { name: 'HTTP/HTTPS', data: credentials.http, icon: '🌐' },
        { name: 'SOCKS5', data: credentials.socks5, icon: '🔌' },
        { name: 'Shadowsocks', data: credentials.shadowsocks, icon: '🛡️' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">API Credentials</h1>
                    <p className="text-neutral-400 mt-1">
                        Use these credentials in external apps
                    </p>
                </div>
                <Button
                    onClick={handleRegenerate}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                >
                    Regenerate
                </Button>
            </div>

            {protocols.map((protocol) => (
                <Card key={protocol.name} className="bg-neutral-800 border-neutral-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{protocol.icon}</span>
                        <h3 className="text-xl font-semibold text-white">
                            {protocol.name}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-neutral-400">Host</label>
                            <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 bg-neutral-900 px-3 py-2 rounded text-sm text-white">
                                    {protocol.data.host}
                                </code>
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        copyToClipboard(
                                            protocol.data.host,
                                            `${protocol.name}-host`
                                        )
                                    }
                                >
                                    {copied === `${protocol.name}-host` ? '✓' : 'Copy'}
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-neutral-400">Port</label>
                            <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 bg-neutral-900 px-3 py-2 rounded text-sm text-white">
                                    {protocol.data.port}
                                </code>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-neutral-400">Username</label>
                            <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 bg-neutral-900 px-3 py-2 rounded text-sm text-white">
                                    {protocol.data.username}
                                </code>
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        copyToClipboard(
                                            protocol.data.username,
                                            `${protocol.name}-user`
                                        )
                                    }
                                >
                                    {copied === `${protocol.name}-user` ? '✓' : 'Copy'}
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-neutral-400">Password</label>
                            <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 bg-neutral-900 px-3 py-2 rounded text-sm text-white">
                                    {'•'.repeat(16)}
                                </code>
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        copyToClipboard(
                                            protocol.data.password,
                                            `${protocol.name}-pass`
                                        )
                                    }
                                >
                                    {copied === `${protocol.name}-pass` ? '✓' : 'Copy'}
                                </Button>
                            </div>
                        </div>

                        {protocol.data.method && (
                            <div>
                                <label className="text-xs text-neutral-400">Method</label>
                                <code className="block bg-neutral-900 px-3 py-2 rounded text-sm text-white mt-1">
                                    {protocol.data.method}
                                </code>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 p-3 bg-neutral-900 rounded">
                        <div className="text-xs text-neutral-400 mb-1">Connection String:</div>
                        <code className="text-xs text-sky-400 break-all">
                            {protocol.name === 'Shadowsocks'
                                ? `ss://${btoa(
                                      `${protocol.data.method}:${protocol.data.password}`
                                  )}@${protocol.data.host}:${protocol.data.port}`
                                : `${protocol.name.toLowerCase().split('/')[0]}://${
                                      protocol.data.username
                                  }:${protocol.data.password}@${protocol.data.host}:${
                                      protocol.data.port
                                  }`}
                        </code>
                    </div>
                </Card>
            ))}
        </div>
    );
}
```

### Task 6: Update Sidebar Navigation
**File:** `atlantic-dashboard/components/dashboard/Sidebar.tsx`

```typescript
// Add after 'Locations' in navItems:
{ label: 'Protocol', href: '/dashboard/protocol' },
{ label: 'API', href: '/dashboard/api' },
```

---

## Plan-Based Access Control (30 min)

### Task 7: Add Plan Check Middleware
**File:** `atlantic-dashboard/lib/plan-check.ts` (new file)

```typescript
export type Plan = 'starter' | 'payg' | 'personal' | 'team' | 'enterprise';

export const PLAN_FEATURES = {
    starter: {
        protocols: ['http'],
        protocolSelection: false,
        apiAccess: false,
        dataLimit: 5 * 1024 * 1024 * 1024, // 5GB
    },
    payg: {
        protocols: ['http', 'socks5', 'shadowsocks'],
        protocolSelection: false,
        apiAccess: false,
        dataLimit: null, // Unlimited during active hours
    },
    personal: {
        protocols: ['http', 'socks5', 'shadowsocks'],
        protocolSelection: true,
        apiAccess: true,
        dataLimit: 50 * 1024 * 1024 * 1024, // 50GB
    },
    team: {
        protocols: ['http', 'socks5', 'shadowsocks'],
        protocolSelection: true,
        apiAccess: true,
        dataLimit: 500 * 1024 * 1024 * 1024, // 500GB
    },
    enterprise: {
        protocols: ['http', 'socks5', 'shadowsocks'],
        protocolSelection: true,
        apiAccess: true,
        dataLimit: null, // Custom
    },
};

export function hasFeature(plan: Plan, feature: keyof typeof PLAN_FEATURES.starter): boolean {
    return PLAN_FEATURES[plan][feature] === true;
}

export function getAvailableProtocols(plan: Plan): string[] {
    return PLAN_FEATURES[plan].protocols;
}
```

### Task 8: Add Upgrade Prompts
**File:** `atlantic-dashboard/components/UpgradePrompt.tsx` (new file)

```typescript
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface UpgradePromptProps {
    feature: string;
    requiredPlan: string;
    currentPlan: string;
}

export function UpgradePrompt({ feature, requiredPlan, currentPlan }: UpgradePromptProps) {
    return (
        <Card className="bg-gradient-to-br from-sky-500/20 to-purple-500/20 border-sky-500/50 p-8 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold text-white mb-2">
                Upgrade to {requiredPlan}
            </h3>
            <p className="text-neutral-300 mb-6">
                {feature} is available on {requiredPlan} plan and above.
            </p>
            <Link href="/dashboard/billing">
                <Button className="bg-sky-500 hover:bg-sky-600">
                    Upgrade Now
                </Button>
            </Link>
        </Card>
    );
}
```

---

## Testing Checklist

- [ ] Backend: Test protocol selection endpoint
- [ ] Backend: Test credentials generation
- [ ] Backend: Test credentials regeneration
- [ ] Frontend: Test protocol selection UI
- [ ] Frontend: Test API credentials page
- [ ] Frontend: Test copy to clipboard
- [ ] Frontend: Test upgrade prompts
- [ ] Integration: Test plan-based access control
- [ ] Integration: Test protocol switching
- [ ] Security: Test credential security

---

**Next:** Implement team management features
