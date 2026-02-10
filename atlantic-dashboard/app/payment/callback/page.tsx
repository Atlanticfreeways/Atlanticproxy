'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function PaymentCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        const reference = searchParams.get('reference');
        
        if (!reference) {
            setStatus('failed');
            setMessage('Invalid payment reference');
            return;
        }

        verifyPayment(reference);
    }, [searchParams]);

    const verifyPayment = async (reference: string) => {
        try {
            const response = await fetch(`http://localhost:8765/api/billing/verify/${reference}`);
            const data = await response.json();

            if (response.ok && data.status === 'success') {
                setStatus('success');
                setMessage('Payment successful! Redirecting to dashboard...');
                
                // Store token if provided
                if (data.token) {
                    apiClient.setToken(data.token);
                }
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            } else {
                setStatus('failed');
                setMessage(data.error || 'Payment verification failed');
            }
        } catch (error) {
            setStatus('failed');
            setMessage('Failed to verify payment. Please contact support.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="glass p-12 rounded-2xl max-w-md w-full text-center space-y-6 relative z-10">
                {status === 'verifying' && (
                    <>
                        <Loader2 className="h-16 w-16 animate-spin text-sky-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-white">{message}</h1>
                        <p className="text-zinc-400">Please wait while we confirm your payment...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
                        <p className="text-zinc-400">{message}</p>
                        <div className="pt-4">
                            <div className="animate-pulse text-sky-500">Redirecting...</div>
                        </div>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-white">Payment Failed</h1>
                        <p className="text-zinc-400">{message}</p>
                        <div className="pt-4 space-y-3">
                            <button
                                onClick={() => router.push('/trial')}
                                className="w-full bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-zinc-200 transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="w-full bg-zinc-900 border border-zinc-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-zinc-800 transition-colors"
                            >
                                Go Home
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
