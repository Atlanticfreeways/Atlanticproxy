'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Waves, List, X, CaretDown } from 'phosphor-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const productsItems = [
    { icon: '🌐', title: 'Residential Proxies', desc: '72M+ real ISP IPs', href: '/products/residential' },
    { icon: '🏢', title: 'Datacenter Proxies', desc: 'High-speed dedicated IPs', href: '/products/datacenter' },
    { icon: '📱', title: 'Mobile Proxies', desc: '4G/5G mobile IPs', href: '/products/mobile' },
    { icon: '🔄', title: 'Rotating Proxies', desc: 'Auto-rotating IP pools', href: '/products/rotating' },
    { icon: '🎯', title: 'ISP Proxies', desc: 'Static residential IPs', href: '/products/isp' },
    { icon: '⚡', title: 'SOCKS5 Proxies', desc: 'Protocol flexibility', href: '/products/socks5' },
  ];

  const solutionsItems = [
    { icon: '🕷️', title: 'Web Scraping', desc: 'Extract data at scale', href: '/solutions/scraping' },
    { icon: '📊', title: 'Ad Verification', desc: 'Multi-geo ad testing', href: '/solutions/ad-verification' },
    { icon: '🔒', title: 'Privacy & Security', desc: 'Anonymous browsing', href: '/solutions/privacy' },
    { icon: '🛒', title: 'E-commerce', desc: 'Price monitoring', href: '/solutions/ecommerce' },
    { icon: '📈', title: 'SEO Monitoring', desc: 'SERP tracking', href: '/solutions/seo' },
    { icon: '🎮', title: 'Sneaker Bots', desc: 'Limited releases', href: '/solutions/sneakers' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass border-b border-white/10' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-12">
            <Link href="/" className="flex items-center space-x-2 group">
              <Waves size={36} weight="duotone" className="text-blue-400 group-hover:text-blue-300 transition-colors" />
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Atlantic<span className="text-blue-400">Proxy</span></span>
            </Link>

            <div className="hidden lg:flex items-center space-x-1">
              <div className="relative" onMouseEnter={() => setOpenDropdown('products')} onMouseLeave={() => setOpenDropdown(null)}>
                <button className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  <span>Products</span>
                  <CaretDown size={14} weight="bold" className={`transition-transform ${openDropdown === 'products' ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === 'products' && (
                  <div className="absolute left-0 top-full mt-2 w-80 glass-card rounded-2xl p-2 shadow-2xl border border-white/10">
                    {productsItems.map((item, idx) => (
                      <Link key={idx} href={item.href} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{item.title}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" onMouseEnter={() => setOpenDropdown('solutions')} onMouseLeave={() => setOpenDropdown(null)}>
                <button className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  <span>Solutions</span>
                  <CaretDown size={14} weight="bold" className={`transition-transform ${openDropdown === 'solutions' ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === 'solutions' && (
                  <div className="absolute left-0 top-full mt-2 w-80 glass-card rounded-2xl p-2 shadow-2xl border border-white/10">
                    {solutionsItems.map((item, idx) => (
                      <Link key={idx} href={item.href} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{item.title}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/pricing" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Pricing</Link>
              <Link href="/docs" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Docs</Link>
              <Link href="/about" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Company</Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/dashboard" className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors">Sign In</Link>
            <Link href="/pricing" className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40">Start Free Trial</Link>
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">
            {isMobileMenuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10">
            <div className="space-y-2">
              <Link href="/pricing" className="block px-4 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg">Pricing</Link>
              <Link href="/docs" className="block px-4 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg">Docs</Link>
              <Link href="/about" className="block px-4 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg">Company</Link>
              <div className="pt-4 space-y-2">
                <Link href="/dashboard" className="block px-4 py-2 text-base font-medium text-gray-300 hover:text-white text-center border border-white/10 rounded-lg">Sign In</Link>
                <Link href="/pricing" className="block px-4 py-2 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg text-center">Start Free Trial</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
