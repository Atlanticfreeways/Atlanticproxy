'use client';

import { Check, X } from 'phosphor-react';

const Comparison = () => {
  const comparisons = [
    { feature: 'IP Type', cheap: 'Datacenter', vpn: 'Shared VPN', atlantic: 'Premium Residential' },
    { feature: 'Success Rate', cheap: '90-95%', vpn: '95%', atlantic: '99.9%' },
    { feature: 'Targeting', cheap: 'Country only', vpn: 'Fixed servers', atlantic: 'Town + ISP level' },
    { feature: 'Kill Switch', cheap: false, vpn: true, atlantic: true },
    { feature: 'Leak Protection', cheap: false, vpn: 'Basic', atlantic: 'Advanced' },
    { feature: 'IP Pool Size', cheap: '10K-100K', vpn: '50-100', atlantic: '72M+' },
    { feature: 'Rotation Modes', cheap: 'Basic', vpn: false, atlantic: '4 modes' },
    { feature: 'API Access', cheap: true, vpn: false, atlantic: 'Personal+' },
  ];

  return (
    <section className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Why Choose</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AtlanticProxy?</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Stop losing accounts to cheap proxies. Get enterprise-grade protection at consumer prices.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-300">Feature</th>
                  <th className="px-6 py-5 text-center text-sm font-semibold text-gray-400">Cheap Proxies</th>
                  <th className="px-6 py-5 text-center text-sm font-semibold text-gray-400">VPNs</th>
                  <th className="px-6 py-5 text-center text-sm font-semibold text-blue-400 bg-blue-500/10">AtlanticProxy</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">{row.feature}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-400">
                      {typeof row.cheap === 'boolean' ? (
                        row.cheap ? <Check size={20} weight="bold" className="inline text-green-400" /> : <X size={20} weight="bold" className="inline text-red-400" />
                      ) : row.cheap}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-400">
                      {typeof row.vpn === 'boolean' ? (
                        row.vpn ? <Check size={20} weight="bold" className="inline text-green-400" /> : <X size={20} weight="bold" className="inline text-red-400" />
                      ) : row.vpn}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-blue-400 bg-blue-500/10">
                      {typeof row.atlantic === 'boolean' ? (
                        row.atlantic ? <Check size={20} weight="bold" className="inline text-green-400" /> : <X size={20} weight="bold" className="inline text-red-400" />
                      ) : row.atlantic}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
