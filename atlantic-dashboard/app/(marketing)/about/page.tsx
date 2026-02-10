import { Target, Users, Shield, Rocket } from 'phosphor-react';

export default function AboutPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">About AtlanticProxy</h1>
          <p className="text-xl text-gray-600">Military-grade anonymity meets one-click simplicity</p>
        </div>

        <div className="prose prose-lg max-w-none mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            AtlanticProxy bridges the gap between consumer VPNs and enterprise proxy services. We believe everyone deserves access to premium residential proxies with VPN-grade security, without the complexity or enterprise pricing.
          </p>
          <p className="text-gray-600">
            Our goal is to provide military-grade anonymity with one-click simplicity, making advanced proxy technology accessible to individuals, developers, and teams of all sizes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-6 bg-blue-50 rounded-xl">
            <Target size={32} weight="duotone" className="text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Our Vision</h3>
            <p className="text-gray-600">To become the most trusted residential proxy service, known for reliability, security, and user-friendly experience.</p>
          </div>
          <div className="p-6 bg-green-50 rounded-xl">
            <Users size={32} weight="duotone" className="text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Our Users</h3>
            <p className="text-gray-600">From privacy-conscious individuals to enterprise teams, we serve thousands of users who trust us with their online security.</p>
          </div>
          <div className="p-6 bg-purple-50 rounded-xl">
            <Shield size={32} weight="duotone" className="text-purple-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Our Values</h3>
            <p className="text-gray-600">Privacy first, transparency always. We never log your activity and are committed to protecting your data.</p>
          </div>
          <div className="p-6 bg-orange-50 rounded-xl">
            <Rocket size={32} weight="duotone" className="text-orange-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Our Growth</h3>
            <p className="text-gray-600">Launched in 2026, we're rapidly growing with 1,000+ users and expanding to 10,000+ by Q2 2026.</p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Us</h2>
          <p className="text-gray-600 mb-8">Ready to experience premium residential proxies?</p>
          <a href="/pricing" className="inline-block px-8 py-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transition-all">
            Start Your Free Trial
          </a>
        </div>
      </div>
    </div>
  );
}
