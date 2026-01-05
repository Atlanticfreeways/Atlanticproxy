'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api';

const navItems = [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Statistics', href: '/dashboard/statistics' },
    { label: 'Servers', href: '/dashboard/servers' },
    { label: 'IP Rotation', href: '/dashboard/rotation' },
    { label: 'Security', href: '/dashboard/security' },
    { label: 'Ad-Blocking', href: '/dashboard/adblock' },
    { label: 'Settings', href: '/dashboard/settings' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Usage', href: '/dashboard/usage' },
    { label: 'Activity', href: '/dashboard/activity' },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        apiClient.logout();
        router.push('/login');
    };

    return (
        <aside className="w-64 bg-neutral-900 border-r border-neutral-800 min-h-screen p-4 flex flex-col">
            <div className="mb-8 pl-4">
                <h1 className="text-2xl font-bold text-white">AtlanticProxy</h1>
                <p className="text-sm text-neutral-400">VPN-Grade Protection</p>
            </div>

            <nav className="space-y-1 flex-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive
                                ? 'bg-neutral-800 text-white font-medium'
                                : 'text-neutral-400 hover:text-white'
                                }`}
                        >
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 rounded-lg text-red-400 hover:text-red-300 transition-colors mt-auto text-sm font-medium"
            >
                <span>Sign Out</span>
            </button>
        </aside>
    );
}
