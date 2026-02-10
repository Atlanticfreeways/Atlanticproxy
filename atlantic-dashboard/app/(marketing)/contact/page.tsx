'use client';

import { useState } from 'react';
import { EnvelopeSimple, DiscordLogo, GithubLogo } from 'phosphor-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-600">Have questions? We're here to help.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <EnvelopeSimple size={24} weight="duotone" className="text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <a href="mailto:support@atlanticproxy.com" className="text-blue-600 hover:text-blue-700">support@atlanticproxy.com</a>
                  <p className="text-sm text-gray-600 mt-1">Response time: 24 hours</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <DiscordLogo size={24} weight="duotone" className="text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Discord</h3>
                  <a href="https://discord.gg/atlanticproxy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">Join our community</a>
                  <p className="text-sm text-gray-600 mt-1">Get instant help from our team</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <GithubLogo size={24} weight="duotone" className="text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">GitHub</h3>
                  <a href="https://github.com/Atlanticfreeways/Atlanticproxy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">Report issues</a>
                  <p className="text-sm text-gray-600 mt-1">Open source contributions welcome</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea rows={5} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
              </div>
              <button type="submit" className="w-full px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
