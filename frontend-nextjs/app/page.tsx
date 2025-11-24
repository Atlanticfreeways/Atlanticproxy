'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Zap, Globe, ArrowRight, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const [stats, setStats] = useState({
    activeUsers: 0,
    uptime: '99.98%',
    avgLatency: '145ms',
    providers: 4,
  });

  useEffect(() => {
    // Animate stats on load
    const timer = setTimeout(() => {
      setStats({
        activeUsers: 127,
        uptime: '99.98%',
        avgLatency: '145ms',
        providers: 4,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-atlantic-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-atlantic-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🌊</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Atlantic Proxy</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-atlantic-600 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-atlantic-600 transition-colors">
                Pricing
              </Link>
              <Link href="/auth/login" className="btn-primary">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            Enterprise-Grade
            <span className="text-atlantic-600 block">Always-On Proxy</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-up">
            Never disconnect. Never fail. Always protected. 
            The only proxy service with VPN-grade reliability and <500ms failover time.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up">
            <Link href="/auth/register" className="btn-primary text-lg px-8 py-3 inline-flex items-center">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/dashboard" className="btn-secondary text-lg px-8 py-3">
              View Demo
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in">
            <div className="text-center">
              <div className="text-3xl font-bold text-atlantic-600">{stats.activeUsers}</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-atlantic-600">{stats.uptime}</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-atlantic-600">{stats.avgLatency}</div>
              <div className="text-gray-600">Avg Latency</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-atlantic-600">{stats.providers}</div>
              <div className="text-gray-600">Providers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Atlantic Proxy Dominates
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three core advantages that make us superior to both traditional proxies AND VPNs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Always-On Service */}
            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-atlantic-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-atlantic-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Always-On Proxy Service</h3>
              <p className="text-gray-600 mb-6">
                Never disconnect. Never fail. Always protected.
              </p>
              <ul className="text-left space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  3-5 pre-warmed connections ready instantly
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  &lt;500ms failover (60x faster than traditional)
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Multi-provider resilience (impossible to fail)
                </li>
              </ul>
            </div>

            {/* Zero-Tolerance Leak Protection */}
            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-atlantic-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-atlantic-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Zero-Tolerance Leak Protection</h3>
              <p className="text-gray-600 mb-6">
                Your IP never leaks. Guaranteed.
              </p>
              <ul className="text-left space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  System-level traffic capture (VPN-grade)
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Enhanced kill switch (instant blocking)
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Continuous leak detection & auto-fix
                </li>
              </ul>
            </div>

            {/* Bulletproof Infrastructure */}
            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-atlantic-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-atlantic-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Bulletproof Infrastructure</h3>
              <p className="text-gray-600 mb-6">
                Enterprise reliability that traditional proxies can't match.
              </p>
              <ul className="text-left space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Intelligent auto-reconnect (self-healing)
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Advanced session persistence
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  24/7 health monitoring & optimization
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your needs. All plans include our core features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="card text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
              <div className="text-4xl font-bold text-atlantic-600 mb-4">$29.99<span className="text-lg text-gray-600">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  50GB monthly data
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  5 concurrent sessions
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Residential proxies
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Basic support
                </li>
              </ul>
              <Link href="/auth/register?plan=basic" className="btn-secondary w-full">
                Get Started
              </Link>
            </div>

            {/* Professional Plan */}
            <div className="card text-center border-2 border-atlantic-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-atlantic-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
              <div className="text-4xl font-bold text-atlantic-600 mb-4">$79.99<span className="text-lg text-gray-600">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  200GB monthly data
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  20 concurrent sessions
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  All proxy types
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Priority support
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  API access
                </li>
              </ul>
              <Link href="/auth/register?plan=professional" className="btn-primary w-full">
                Get Started
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="card text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="text-4xl font-bold text-atlantic-600 mb-4">$199.99<span className="text-lg text-gray-600">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  1TB monthly data
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Unlimited sessions
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  All proxy types
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  24/7 support
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Custom integration
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  White-label options
                </li>
              </ul>
              <Link href="/auth/register?plan=enterprise" className="btn-secondary w-full">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-atlantic-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🌊</span>
                </div>
                <span className="text-xl font-bold">Atlantic Proxy</span>
              </div>
              <p className="text-gray-400">
                Enterprise-grade always-on proxy platform. Never disconnect. Never fail. Always protected.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/api-docs" className="hover:text-white transition-colors">API Docs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/support" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Atlantic Proxy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}