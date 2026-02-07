'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CredentialSet {
    host: string;
    port: number;
    username: string;
    password: string;
    method?: string;
}

export default function APIPage() {
    const [copied, setCopied] = useState<string | null>(null);

    const credentials = {
        http: {
            host: 'proxy.atlanticproxy.com',
            port: 8080,
            username: 'user_demo',
            password: 'pass_demo_12345',
        },
        socks5: {
            host: 'proxy.atlanticproxy.com',
            port: 1080,
            username: 'user_demo',
            password: 'pass_demo_12345',
        },
        shadowsocks: {
            host: 'proxy.atlanticproxy.com',
            port: 8388,
            username: 'user_demo',
            password: 'pass_demo_12345',
            method: 'aes-256-gcm',
        },
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

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
                    <p className="text-neutral-400 mt-1">Use these credentials in external apps</p>
                </div>
                <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10">
                    Regenerate
                </Button>
            </div>

            {protocols.map((protocol) => (
                <Card key={protocol.name} className="bg-neutral-800 border-neutral-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{protocol.icon}</span>
                        <h3 className="text-xl font-semibold text-white">{protocol.name}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-neutral-400">Host</label>
                            <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 bg-neutral-900 px-3 py-2 rounded text-sm text-white">
                                    {protocol.data.host}
                                </code>
                                <Button size="sm" onClick={() => copyToClipboard(protocol.data.host, `${protocol.name}-host`)}>
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
                                <Button size="sm" onClick={() => copyToClipboard(protocol.data.username, `${protocol.name}-user`)}>
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
                                <Button size="sm" onClick={() => copyToClipboard(protocol.data.password, `${protocol.name}-pass`)}>
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
                                ? `ss://${btoa(`${protocol.data.method}:${protocol.data.password}`)}@${protocol.data.host}:${protocol.data.port}`
                                : `${protocol.name.toLowerCase().split('/')[0]}://${protocol.data.username}:${protocol.data.password}@${protocol.data.host}:${protocol.data.port}`}
                        </code>
                    </div>
                </Card>
            ))}
        </div>
    );
}
