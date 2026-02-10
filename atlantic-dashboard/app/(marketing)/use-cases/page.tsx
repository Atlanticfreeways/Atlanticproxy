import Link from 'next/link';
import { Lock, Spider, ChartBar, ShoppingCart, FilmSlate, ShieldWarning } from 'phosphor-react';

export default function UseCasesPage() {
  const useCases = [
    {
      icon: Lock,
      title: 'Privacy Browsing',
      problem: 'ISPs track your browsing history and sell your data to advertisers.',
      solution: 'Browse anonymously with residential IPs that hide your real identity and location.',
      benefits: ['Complete anonymity', 'No tracking', 'Encrypted traffic', 'Kill switch protection'],
    },
    {
      icon: Spider,
      title: 'Web Scraping',
      problem: 'Websites block datacenter IPs and rate-limit requests, breaking your scrapers.',
      solution: 'Rotate through 72M+ residential IPs to scrape without getting blocked.',
      benefits: ['99.9% success rate', 'Automatic rotation', 'Town-level targeting', 'High throughput'],
    },
    {
      icon: ChartBar,
      title: 'Ad Verification',
      problem: 'Need to verify ads appear correctly across different locations and devices.',
      solution: 'Test ads from 195+ countries with real residential IPs from actual ISPs.',
      benefits: ['Multi-geo testing', 'Real ISP IPs', 'Accurate results', 'Fast verification'],
    },
    {
      icon: ShoppingCart,
      title: 'Price Comparison',
      problem: 'E-commerce sites show different prices based on your location.',
      solution: 'Compare prices from any city or country to find the best deals.',
      benefits: ['Town-level targeting', 'Real-time comparison', 'Save money', 'Avoid geo-pricing'],
    },
    {
      icon: FilmSlate,
      title: 'Content Access',
      problem: 'Streaming services and websites block content based on your location.',
      solution: 'Access geo-restricted content from anywhere with residential IPs.',
      benefits: ['195+ countries', 'Fast streaming', 'No buffering', 'Reliable access'],
    },
    {
      icon: ShieldWarning,
      title: 'Security Testing',
      problem: 'Public WiFi exposes your data to hackers and man-in-the-middle attacks.',
      solution: 'Secure your connection with VPN-grade encryption and kill switch.',
      benefits: ['Military-grade encryption', 'Kill switch', 'Leak protection', 'Safe browsing'],
    },
  ];

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Real-World Use Cases</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">See how AtlanticProxy solves real problems for thousands of users.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <div key={index} className="p-8 bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="inline-flex p-3 rounded-lg bg-blue-50 mb-4">
                  <Icon size={32} weight="duotone" className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{useCase.title}</h2>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-red-600 mb-2">Problem:</h3>
                  <p className="text-gray-600">{useCase.problem}</p>
                </div>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-green-600 mb-2">Solution:</h3>
                  <p className="text-gray-600">{useCase.solution}</p>
                </div>
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Benefits:</h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {useCase.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <span className="text-green-600 mr-1">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/pricing" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                  Get Started →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
