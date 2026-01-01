"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Loader2, ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            setLoading(false);
            return;
        }

        try {
            await apiClient.register(formData.email, formData.password);
            // Auto login or redirect to login? 
            // apiClient.register sets the token automatically in our implementation.
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md space-y-8 glass p-8 rounded-2xl relative z-10">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Create an account</h1>
                    <p className="text-zinc-400">Get started with Atlantic Proxy today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-10 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-10 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 ml-1">Confirm Password</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-10 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 group"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                Create Account
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center text-sm text-zinc-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-white hover:underline underline-offset-4">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
