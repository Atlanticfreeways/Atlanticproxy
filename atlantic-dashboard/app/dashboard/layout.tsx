"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login');
        } else {
            setAuthorized(true);
        }
    }, [router]);

    if (!authorized) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-black">
            <Sidebar />
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
