'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, ChartLine, Globe, ShieldCheck, Prohibit, Gear, FileText, ArrowsClockwise, CreditCard, ChartBar } from '@phosphor-icons/react';

const navItems = [
    { icon: House, label: 'Overview', href: '/dashboard' },
    { icon: ChartLine, label: 'Statistics', href: '/dashboard/statistics' },
    { icon: Globe, label: 'Servers', href: '/dashboard/servers' },
    { icon: ArrowsClockwise, label: 'IP Rotation', href: '/dashboard/rotation' },
    { icon: ShieldCheck, label: 'Security', href: '/dashboard/security' },
    { icon: Prohibit, label: 'Ad-Blocking', href: '/dashboard/adblock' },
    { icon: Gear, label: 'Settings', href: '/dashboard/settings' },
    { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
    { icon: ChartBar, label: 'Usage', href: '/dashboard/usage' },
    { icon: FileText, label: 'Activity', href: '/dashboard/activity' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-neutral-900 border-r border-neutral-800 min-h-screen p-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">AtlanticProxy</h1>
                <p className="text-sm text-neutral-400">VPN-Grade Protection</p>
            </div>

            <nav className="space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                }`}
                        >
                            <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
