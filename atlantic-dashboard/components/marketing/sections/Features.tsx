'use client';

import { Globe, MapPin, ShieldCheck, ArrowsClockwise, ProhibitInset, LockKey } from 'phosphor-react';

const Features = () => {
  const features = [
    {
      icon: Globe,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-blue-600/10',
      title: '72M+ Residential IPs',
      description: 'Real ISP addresses from major providers worldwide. Undetectable and reliable for all your needs.',
    },
    {
      icon: MapPin,
      color: 'text-green-400',
      bgColor: 'from-green-500/20 to-green-600/10',
      title: 'Town-Level Targeting',
      description: 'Target specific cities and towns across 195 countries with precision location control.',
    },
    {
      icon: ShieldCheck,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/20 to-purple-600/10',
      title: 'Kill Switch Protection',
      description: 'Firewall-level protection with <500ms failover. Your real IP never leaks.',
    },
    {
      icon: ArrowsClockwise,
      color: 'text-orange-400',
      bgColor: 'from-orange-500/20 to-orange-600/10',
      title: 'Smart Rotation',
      description: '4 rotation modes: per-request, sticky 1/10/30min. Optimize for your use case.',
    },
    {
      icon: ProhibitInset,
      color: 'text-red-400',
      bgColor: 'from-red-500/20 to-red-600/10',
      title: 'Ad-Blocking',
      description: 'DNS + HTTP filtering blocks >95% of ads and trackers. Browse faster and safer.',
    },
    {
      icon: LockKey,
      color: 'text-indigo-400',
      bgColor: 'from-indigo-500/20 to-indigo-600/10',
      title: 'Multi-Protocol',
      description: 'HTTP/HTTPS, SOCKS5, and Shadowsocks support. Choose the best protocol for your needs.',
    },
  ];

  return (
    <section className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Enterprise Features,</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Consumer Pricing</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to stay anonymous, secure, and undetected online.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group glass-card p-8 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.bgColor} mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon size={32} weight="duotone" className={feature.color} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
