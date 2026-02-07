'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';

export default function ProtocolPage() {
    const [selected, setSelected] = useState<string>('http');

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
        try {
            await apiClient.setRotationConfig({ mode: 'sticky-10min' });
            setSelected(protocol);
        } catch (error) {
            console.error('Failed to select protocol:', error);
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
                <h3 className="text-lg font-semibold text-white mb-2">💡 Protocol Guide</h3>
                <div className="space-y-2 text-sm text-neutral-400">
                    <p><strong className="text-white">HTTP/HTTPS:</strong> Use for web scraping, API calls, and browser-based automation.</p>
                    <p><strong className="text-white">SOCKS5:</strong> Use for system-wide proxy, gaming, or applications that don't support HTTP proxies.</p>
                    <p><strong className="text-white">Shadowsocks:</strong> Use for mobile VPN, censorship bypass, or when you need encrypted proxy connections.</p>
                </div>
            </Card>
        </div>
    );
}
