'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { showToast } from '@/components/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('test@atlanticproxy.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      showToast('Please enter both email and password', 'warning');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      showToast('Login successful! Redirecting...', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AtlanticProxy</h1>
          <p className="text-gray-600 mt-2">Enterprise-Grade Always-On Proxy</p>
        </div>

        {/* Test Credentials Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-green-800 mb-2">🧪 Test Credentials</h3>
          <p className="text-xs text-green-700">Email: test@atlanticproxy.com</p>
          <p className="text-xs text-green-700">Password: password123</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 font-semibold text-lg shadow-lg mb-6"
            style={{ 
              minHeight: '56px',
              display: 'block',
              visibility: 'visible',
              opacity: '1',
              backgroundColor: '#dc2626',
              color: '#ffffff'
            }}
          >
            {loading ? 'Signing In...' : '🚀 Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/register" className="text-blue-600 text-sm hover:text-blue-700">
            Don't have an account? Register
          </a>
        </div>
      </div>
    </div>
  );
}
