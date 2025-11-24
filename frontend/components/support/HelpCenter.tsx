'use client';

import { useState } from 'react';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  views: number;
}

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Getting Started with Atlantic Proxy',
    category: 'Getting Started',
    content: 'Learn how to set up and configure Atlantic Proxy for your first connection...',
    views: 1250,
  },
  {
    id: '2',
    title: 'Choosing the Right Proxy Type',
    category: 'Plans & Pricing',
    content: 'Understand the differences between Residential, Datacenter, and Mobile proxies...',
    views: 890,
  },
  {
    id: '3',
    title: 'Troubleshooting Connection Issues',
    category: 'Troubleshooting',
    content: 'Common connection problems and how to resolve them...',
    views: 2100,
  },
  {
    id: '4',
    title: 'API Integration Guide',
    category: 'API',
    content: 'Complete guide to integrating Atlantic Proxy API into your application...',
    views: 650,
  },
  {
    id: '5',
    title: 'Billing and Subscription FAQ',
    category: 'Billing',
    content: 'Frequently asked questions about billing, invoices, and subscriptions...',
    views: 1450,
  },
];

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const categories = Array.from(new Set(ARTICLES.map(a => a.category)));

  const filteredArticles = ARTICLES.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedArticle) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={() => setSelectedArticle(null)}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Back to Help Center
        </button>
        <h2 className="text-3xl font-bold mb-4">{selectedArticle.title}</h2>
        <div className="flex gap-4 mb-6 text-sm text-gray-600">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            {selectedArticle.category}
          </span>
          <span>{selectedArticle.views} views</span>
        </div>
        <div className="prose max-w-none">
          <p>{selectedArticle.content}</p>
          <p className="mt-6 text-gray-600">
            This is a sample article. Full content would be displayed here with detailed instructions, screenshots, and examples.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-3xl font-bold mb-2">Help Center</h2>
      <p className="text-gray-600 mb-6">Find answers to common questions and learn how to use Atlantic Proxy</p>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg transition ${
            selectedCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Categories
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg transition ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredArticles.map(article => (
          <button
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{article.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{article.content}</p>
              </div>
              <span className="text-xs text-gray-500 ml-4">{article.views} views</span>
            </div>
          </button>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No articles found. Try a different search term.</p>
        </div>
      )}
    </div>
  );
}
