'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';

export default function PaymentCallbackPage() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

    useEffect(() => {
        const reference = searchParams.get('reference');
        
        if (reference) {
            fetch(`http://localhost:8082/api/billing/verify?reference=${reference}`)
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        setStatus('success');
                        setTimeout(() => {
                            window.location.href = '/dashboard';
                        }, 2000);
                    } else {
                        setStatus('failed');
                    }
                })
                .catch(() => setStatus('failed'));
        } else {
            setStatus('failed');
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
            <Card className="bg-neutral-800 border-neutral-700 p-8 text-center max-w-md">
                {status === 'loading' && (
                    <>
                        <div className="text-6xl mb-4">⏳</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment</h2>
                        <p className="text-neutral-400">Please wait...</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="text-6xl mb-4">✅</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                        <p className="text-neutral-400">Redirecting to dashboard...</p>
                    </>
                )}
                {status === 'failed' && (
                    <>
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
                        <p className="text-neutral-400 mb-4">Please try again.</p>
                        <a href="/trial" className="text-sky-400 hover:text-sky-300">
                            Return to trial page
                        </a>
                    </>
                )}
            </Card>
        </div>
    );
}
