'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { showToast } from '@/components/Toast';

export default function SupportPage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmitMessage = async () => {
    // Validate form
    if (!subject.trim()) {
      showToast('Please enter a subject', 'warning');
      return;
    }

    if (!message.trim()) {
      showToast('Please enter a message', 'warning');
      return;
    }

    if (message.trim().length < 10) {
      showToast('Message must be at least 10 characters', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      // In a real scenario, this would call an API endpoint
      const supportData = {
        subject,
        category,
        message,
        priority,
      };

      showToast('Support request submitted successfully!', 'success');
      console.log('Support request:', supportData);

      // Reset form
      setSubject('');
      setMessage('');
      setCategory('general');
      setPriority('normal');
    } catch (error: any) {
      showToast('Failed to submit support request: ' + error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const faqs = [
    {
      q: 'How do I get started with Atlantic Proxy?',
      a: 'Sign up for an account, choose a plan, and start using our proxy service immediately.',
    },
    {
      q: 'What protocols are supported?',
      a: 'We support HTTP, HTTPS, and SOCKS5 protocols for maximum compatibility.',
    },
    {
      q: 'Can I change my plan anytime?',
      a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
    },
    {
      q: 'What is your uptime guarantee?',
      a: 'We guarantee 99.9% uptime with automatic failover and redundancy.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Support & Help</h1>
          <p className="text-sm text-gray-600">Get help with your account and service</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b">
          {['faq', 'contact', 'tickets'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition capitalize ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'faq' ? '❓ FAQ' : tab === 'contact' ? '📧 Contact' : '🎫 Tickets'}
            </button>
          ))}
        </div>

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div>
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Contact Us</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What is this about?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing</option>
                    <option value="account">Account</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue or question (minimum 10 characters)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">{message.length} characters</p>
                </div>
                <button
                  onClick={handleSubmitMessage}
                  disabled={submitting}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-medium"
                >
                  {submitting ? '⏳ Sending...' : '📧 Send Message'}
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-2">📧 Email</h3>
                <p className="text-gray-600">support@atlanticproxy.com</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-2">💬 Live Chat</h3>
                <p className="text-gray-600">Available 24/7</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-2">📞 Phone</h3>
                <p className="text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Support Tickets</h2>
            <p className="text-gray-600 text-center py-8">No support tickets yet</p>
          </div>
        )}
      </main>
    </div>
  );
}
