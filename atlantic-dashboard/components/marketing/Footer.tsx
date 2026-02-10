'use client';

import Link from 'next/link';
import { Waves, TwitterLogo, GithubLogo, DiscordLogo, LinkedinLogo, EnvelopeSimple } from 'phosphor-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10">
      <div className="glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/use-cases" className="text-gray-400 hover:text-white transition-colors">Use Cases</Link></li>
                <li><Link href="/roadmap" className="text-gray-400 hover:text-white transition-colors">Roadmap</Link></li>
                <li><Link href="/changelog" className="text-gray-400 hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/api-docs" className="text-gray-400 hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="/docs/quick-start" className="text-gray-400 hover:text-white transition-colors">Quick Start</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/status" className="text-gray-400 hover:text-white transition-colors">Status Page</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/press" className="text-gray-400 hover:text-white transition-colors">Press Kit</Link></li>
                <li><Link href="/partners" className="text-gray-400 hover:text-white transition-colors">Partners</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/acceptable-use" className="text-gray-400 hover:text-white transition-colors">Acceptable Use</Link></li>
                <li><Link href="/refund" className="text-gray-400 hover:text-white transition-colors">Refund Policy</Link></li>
                <li><Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* Logo & Copyright */}
              <div className="flex items-center space-x-3">
                <Waves size={28} weight="duotone" className="text-blue-400" />
                <span className="text-sm text-gray-400">© {currentYear} AtlanticProxy. All rights reserved.</span>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-5">
                <a href="https://twitter.com/atlanticproxy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <TwitterLogo size={24} weight="fill" />
                </a>
                <a href="https://github.com/Atlanticfreeways/Atlanticproxy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <GithubLogo size={24} weight="fill" />
                </a>
                <a href="https://discord.gg/atlanticproxy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <DiscordLogo size={24} weight="fill" />
                </a>
                <a href="https://linkedin.com/company/atlanticproxy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <LinkedinLogo size={24} weight="fill" />
                </a>
                <a href="mailto:support@atlanticproxy.com" className="text-gray-400 hover:text-white transition-colors">
                  <EnvelopeSimple size={24} weight="fill" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
