'use client';

import { useEffect, useState } from 'react';
import { apiClient, SecurityStatus as SecurityStatusType } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SecurityPage() {
    const [status, setStatus] = useState<SecurityStatusType | null>(null);
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        loadStatus();
    }, []);

    const loadStatus = async () => {
        setLoading(true);
        try {
            const data = await apiClient.getSecurityStatus();
            setStatus(data);
        } catch (error) {
            console.error('Failed to load security status:', error);
        } finally {
            setLoading(false);
        }
    };

    const runTest = async () => {
        setTesting(true);
        await loadStatus();
        setTesting(false);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">
            <div className="animate-pulse text-neutral-400">Loading security status...</div>
        </div>;
    }

    if (!status) {
        return <div className="flex items-center justify-center h-96">
            <div className="text-red-400">Failed to load security status</div>
        </div>;
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excellent';
        if (score >= 50) return 'Good';
        return 'Poor';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Security</h1>
                    <p className="text-neutral-400 mt-1">Verify your anonymity and detect leaks</p>
                </div>
                <Button
                    onClick={runTest}
                    disabled={testing}
                    className="bg-sky-500 hover:bg-sky-600"
                >
                    {testing ? 'Testing...' : 'Run Test'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-neutral-800 border-neutral-700 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Anonymity Score</h2>
                    <div className="flex items-center justify-center">
                        <div className="relative w-40 h-40">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke="currentColor"
                                    strokeWidth="10"
                                    fill="none"
                                    className="text-neutral-700"
                                />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke="currentColor"
                                    strokeWidth="10"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 70}`}
                                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - status.anonymity_score / 100)}`}
                                    className={getScoreColor(status.anonymity_score)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-4xl font-bold ${getScoreColor(status.anonymity_score)}`}>
                                    {status.anonymity_score}
                                </span>
                                <span className="text-sm text-neutral-400">{getScoreLabel(status.anonymity_score)}</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-neutral-400 mt-4">{status.message}</p>
                </Card>

                <Card className="bg-neutral-800 border-neutral-700 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Leak Detection</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-neutral-300">IP Leak</span>
                            <span className={status.ip_leak_detected ? 'text-red-500' : 'text-green-500'}>
                                {status.ip_leak_detected ? '✗ Detected' : '✓ Protected'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-neutral-300">DNS Leak</span>
                            <span className={status.dns_leak_detected ? 'text-red-500' : 'text-green-500'}>
                                {status.dns_leak_detected ? '✗ Detected' : '✓ Protected'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-neutral-300">WebRTC Leak</span>
                            <span className={status.webrtc_leak_detected ? 'text-red-500' : 'text-green-500'}>
                                {status.webrtc_leak_detected ? '✗ Detected' : '✓ Protected'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-neutral-300">Kill Switch</span>
                            <span className={status.strict_killswitch ? 'text-green-500' : 'text-yellow-500'}>
                                {status.strict_killswitch ? '✓ Active' : '○ Inactive'}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            {status.detected_dns.length > 0 && (
                <Card className="bg-neutral-800 border-neutral-700 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Detected DNS Servers</h2>
                    <div className="space-y-2">
                        {status.detected_dns.map((dns, idx) => (
                            <div key={idx} className="text-neutral-300 font-mono text-sm">
                                {dns}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <Card className="bg-neutral-800 border-neutral-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Security Recommendations</h2>
                <ul className="space-y-2 text-neutral-300">
                    {status.anonymity_score < 100 && (
                        <li className="flex items-start gap-2">
                            <span className="text-yellow-500">⚠</span>
                            <span>Enable Kill Switch for maximum protection</span>
                        </li>
                    )}
                    {status.ip_leak_detected && (
                        <li className="flex items-start gap-2">
                            <span className="text-red-500">✗</span>
                            <span>IP leak detected - reconnect to proxy</span>
                        </li>
                    )}
                    {status.dns_leak_detected && (
                        <li className="flex items-start gap-2">
                            <span className="text-red-500">✗</span>
                            <span>DNS leak detected - check DNS settings</span>
                        </li>
                    )}
                    {status.anonymity_score === 100 && (
                        <li className="flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Your connection is fully protected</span>
                        </li>
                    )}
                </ul>
            </Card>
        </div>
    );
}
