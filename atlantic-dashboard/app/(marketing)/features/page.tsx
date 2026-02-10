import { Globe, MapPin, ShieldCheck, ArrowsClockwise, ProhibitInset, LockKey } from 'phosphor-react';

export default function FeaturesPage() {
  const features = [
    {
      icon: Globe,
      title: '72M+ Residential IPs',
      description: 'Access real ISP addresses from major providers worldwide. Undetectable and reliable for all your needs.',
      details: ['Real residential IPs, not datacenter', 'Major ISPs: Verizon, AT&T, Comcast', '99.9% success rate', 'Automatic failover'],
    },
    {
      icon: MapPin,
      title: 'Town-Level Geo-Targeting',
      description: 'Target specific cities and towns across 195 countries with precision location control.',
      details: ['195+ countries available', '500+ cities worldwide', 'State/province targeting', 'ISP-level selection'],
    },
    {
      icon: ShieldCheck,
      title: 'Kill Switch Protection',
      description: 'Firewall-level protection ensures your real IP never leaks, even if connection drops.',
      details: ['<500ms failover time', 'DNS leak protection', 'WebRTC leak prevention', 'IPv6 leak protection'],
    },
    {
      icon: ArrowsClockwise,
      title: 'Smart IP Rotation',
      description: '4 rotation modes to optimize for your specific use case and requirements.',
      details: ['Per-request rotation', 'Sticky 1/10/30 minute sessions', 'Custom rotation rules', 'Manual rotation control'],
    },
    {
      icon: ProhibitInset,
      title: 'Advanced Ad-Blocking',
      description: 'Block >95% of ads and trackers with DNS and HTTP filtering for faster, safer browsing.',
      details: ['DNS-level blocking', 'HTTP content filtering', 'Custom whitelist support', 'Regular filter updates'],
    },
    {
      icon: LockKey,
      title: 'Multi-Protocol Support',
      description: 'Choose the best protocol for your needs: HTTP/HTTPS, SOCKS5, or Shadowsocks.',
      details: ['HTTP/HTTPS proxy', 'SOCKS5 support', 'Shadowsocks protocol', 'Protocol selection UI (Personal+)'],
    },
  ];

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Enterprise Features, Consumer Pricing</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Everything you need to stay anonymous, secure, and undetected online.</p>
        </div>

        <div className="space-y-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}>
                <div className="flex-1">
                  <div className="inline-flex p-4 rounded-2xl bg-blue-50 mb-6">
                    <Icon size={48} weight="duotone" className="text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h2>
                  <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-blue-600 mr-2">✓</span>
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 min-h-[300px] flex items-center justify-center">
                  <Icon size={120} weight="duotone" className="text-blue-600 opacity-20" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
