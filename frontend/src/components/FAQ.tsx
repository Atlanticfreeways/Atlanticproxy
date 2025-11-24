import { useState } from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const FAQ = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqs: FAQItem[] = [
    {
      id: '1',
      category: 'general',
      question: 'What is Atlantic Proxy?',
      answer: 'Atlantic Proxy is an enterprise-grade always-on proxy platform with persistent connection pools, <500ms failover time, and multi-provider resilience.'
    },
    {
      id: '2',
      category: 'general',
      question: 'How does Atlantic Proxy differ from traditional proxies?',
      answer: 'Atlantic Proxy offers persistent connection pools, system-level traffic capture, intelligent auto-reconnect, and advanced session persistence - features that traditional proxies lack.'
    },
    {
      id: '3',
      category: 'billing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for enterprise customers.'
    },
    {
      id: '4',
      category: 'billing',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.'
    },
    {
      id: '5',
      category: 'technical',
      question: 'How do I set up a proxy connection?',
      answer: 'You can configure proxies through our dashboard. Select your desired locations, protocol, and authentication method, then use the provided endpoint URL.'
    },
    {
      id: '6',
      category: 'technical',
      question: 'What protocols are supported?',
      answer: 'We support HTTP, HTTPS, SOCKS5, and custom protocols. Each can be configured with authentication and custom headers.'
    },
    {
      id: '7',
      category: 'security',
      question: 'Is my data encrypted?',
      answer: 'Yes, all data is encrypted in transit using TLS/SSL and at rest using AES-256 encryption.'
    },
    {
      id: '8',
      category: 'security',
      question: 'What is the kill switch feature?',
      answer: 'The enhanced kill switch blocks all traffic instantly if any connection issue is detected, ensuring your IP never leaks.'
    }
  ];

  const categories = ['all', 'general', 'billing', 'technical', 'security'];
  const filtered = selectedCategory === 'all' ? faqs : faqs.filter(f => f.category === selectedCategory);

  return (
    <div className="bg-white rounded-lg shadow-card p-6 max-w-3xl">
      <h2 className="text-xl font-bold mb-2">Frequently Asked Questions</h2>
      <p className="text-gray-600 mb-6">Find answers to common questions about Atlantic Proxy</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(faq => (
          <button
            key={faq.id}
            onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
            className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div className="flex justify-between items-start gap-4">
              <h3 className="font-semibold text-gray-900">{faq.question}</h3>
              <span className="text-primary-600 text-xl flex-shrink-0">
                {expandedId === faq.id ? '−' : '+'}
              </span>
            </div>

            {expandedId === faq.id && (
              <p className="mt-3 text-gray-600 text-sm">{faq.answer}</p>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Didn't find your answer?</strong> Contact our support team at <a href="mailto:support@atlanticproxy.com" className="underline">support@atlanticproxy.com</a>
        </p>
      </div>
    </div>
  );
};
