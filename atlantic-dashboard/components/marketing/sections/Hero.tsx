'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Globe, Lightning } from 'phosphor-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background with Server Icons */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-purple-600/10 to-transparent"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Ultra Large Server Icons Background - Static */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute top-10 left-10 text-[200px]">🖥️</div>
          <div className="absolute top-20 right-20 text-[180px]">🌐</div>
          <div className="absolute bottom-20 left-1/4 text-[220px]">⚡</div>
          <div className="absolute top-1/3 right-1/4 text-[200px]">🔒</div>
          <div className="absolute bottom-10 right-10 text-[180px]">🚀</div>
          <div className="absolute top-1/2 left-10 text-[200px]">💻</div>
        </div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card border border-red-500/20 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-300">Enterprise Grade • 99.9% Uptime SLA</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">Premium Residential</span>
            <br />
            <span className="bg-gradient-to-r from-red-400 via-red-300 to-purple-400 bg-clip-text text-transparent">Proxies at Scale</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
            72M+ real ISP IPs across 195+ countries with town-level targeting.
            <br className="hidden md:block" />
            Military-grade anonymity meets enterprise reliability.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <Link 
              href="/pricing" 
              className="group w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-xl shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight size={20} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/docs" 
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white glass-card border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <span>View Documentation</span>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="glass-card p-6 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all group">
              <ShieldCheck size={40} weight="duotone" className="text-red-400 mb-4 mx-auto group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all group">
              <Globe size={40} weight="duotone" className="text-red-400 mb-4 mx-auto group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-bold text-white mb-2">195+</div>
              <div className="text-sm text-gray-400">Countries</div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all group">
              <Lightning size={40} weight="duotone" className="text-red-400 mb-4 mx-auto group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-bold text-white mb-2">72M+</div>
              <div className="text-sm text-gray-400">Residential IPs</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
