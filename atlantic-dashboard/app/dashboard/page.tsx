'use client';

import { useEffect, useState } from 'react';
import { apiClient, ProxyStatus } from '@/lib/api';
import { ConnectionCard } from './components/ConnectionCard';
import { UsageStatsCard } from './components/UsageStatsCard';
import { QuickActionsCard } from './components/QuickActionsCard';
import { RecentActivityCard, ActivityItem } from './components/RecentActivityCard';
import { SecurityCard } from './components/SecurityCard';
import { ProtocolModal } from './components/ProtocolModal';
import { RotationSettingsModal } from './components/RotationSettingsModal';
import { AdblockSettingsModal } from './components/AdblockSettingsModal';
import { SecurityStatus } from '@/lib/api';

export default function DashboardPage() {
    const [status, setStatus] = useState<ProxyStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRotating, setIsRotating] = useState(false);
    const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
    const [showProtocols, setShowProtocols] = useState(false);
    const [showRotationSettings, setShowRotationSettings] = useState(false);
    const [showAdblockSettings, setShowAdblockSettings] = useState(false);

    // Mock data for phase 1 integration
    const [usage, setUsage] = useState({ used: 2.3, total: 5 });
    const [activities, setActivities] = useState<ActivityItem[]>([
        { id: '1', type: 'connection', description: 'Connected from US (New York)', timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
        { id: '2', type: 'rotation', description: 'IP Rotated automatically', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() }
    ]);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const [statusData, securityData] = await Promise.all([
                    apiClient.getStatus(),
                    apiClient.getSecurityStatus()
                ]);
                setStatus(statusData);
                setSecurityStatus(securityData);
            } catch (error) {
                console.error('Failed to fetch status:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();

        const unsubscribe = apiClient.subscribeToStatus((data) => {
            setStatus(data);
        });

        return () => unsubscribe();
    }, []);

    const handleToggleConnection = async () => {
        setLoading(true);
        try {
            if (status?.connected) {
                await apiClient.disconnect();
            } else {
                await apiClient.connect("test_user"); // Endpoint fallback for now
            }
            // Status will be updated via WebSocket subscriber or next poll
        } catch (error) {
            console.error('Connection toggle failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRotateIP = async () => {
        setIsRotating(true);
        try {
            await apiClient.rotateIP();
            // Status will update via WS
        } catch (error) {
            console.error('Rotation failed:', error);
        } finally {
            setIsRotating(false);
        }
    };

    const handleUpgrade = () => {
        console.log("Navigate to billing");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh] bg-background text-foreground">
                <div className="animate-pulse">Loading dashboard...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-12 p-4 md:p-8 pt-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ConnectionCard
                    isConnected={status?.connected || false}
                    ipAddress={status?.ip_address}
                    location={status?.location}
                    isp={status?.isp}
                    latency={status?.latency}
                    protectionLevel={status?.protection_level}
                    onToggleConnection={handleToggleConnection}
                    onRotateIP={handleRotateIP}
                    isRotating={isRotating}
                />

                <div className="space-y-6">
                    <UsageStatsCard
                        used={usage.used}
                        total={usage.total}
                        onUpgrade={handleUpgrade}
                    />
                    <SecurityCard
                        score={securityStatus?.anonymity_score || 0}
                        isIpLeak={securityStatus?.ip_leak_detected || false}
                        isDnsLeak={securityStatus?.dns_leak_detected || false}
                        message={securityStatus?.message || "Checking security..."}
                    />
                    <QuickActionsCard
                        onChangeLocation={() => setShowRotationSettings(true)}
                        onRotationSettings={() => setShowRotationSettings(true)}
                        onViewActivity={() => console.log("View activity")}
                        onViewProtocols={() => setShowProtocols(true)}
                        onAdblockSettings={() => setShowAdblockSettings(true)}
                    />
                </div>

                <RecentActivityCard activities={activities} />
            </div>

            <ProtocolModal isOpen={showProtocols} onOpenChange={setShowProtocols} />
            <RotationSettingsModal isOpen={showRotationSettings} onOpenChange={setShowRotationSettings} />
            <AdblockSettingsModal isOpen={showAdblockSettings} onOpenChange={setShowAdblockSettings} />
        </div>
    );
}
