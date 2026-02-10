'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'phosphor-react';

const FinalCTA = () => {
  return (
    <section className="relative py-32 md:py-40 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
          <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Ready to Protect</span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Your Online Identity?</span>
        </h2>
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
          Join thousands of users who trust AtlanticProxy for secure, anonymous browsing.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
          <Link 
            href="/pricing" 
            className="group w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <span>Start Free Trial</span>
            <ArrowRight size={20} weight="bold" className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/contact" 
            className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white glass-card border border-white/10 hover:border-white/20 rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <span>Contact Sales</span>
          </Link>
        </div>

        {/* Money-back Guarantee */}
        <div className="flex items-center justify-center space-x-3 text-gray-400">
          <ShieldCheck size={24} weight="duotone" className="text-green-400" />
          <span>7-day money-back guarantee • No credit card required</span>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
