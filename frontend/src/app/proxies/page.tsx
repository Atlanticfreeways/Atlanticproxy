'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { ProxyCard } from '../../components/dashboard/ProxyCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { SuccessMessage } from '../../components/ui/SuccessMessage';
import { Navigation } from '../../components/ui/Navigation';
import { ProxyEndpoint } from '../../types';

export default function ProxiesPage() {
  const { user } = useAuth();
  const [proxies, setProxies] = useState<ProxyEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    type: 'residential',
    country: 'US',
    city: ''
  });

  useEffect(() => {
    if (user) {
      loadProxies();
    }
  }, [user]);

  const loadProxies = async () => {
    try {
      const data = await api.getProxies();
      setProxies(data.endpoints);
      setError('');
    } catch (error: any) {
      setError(error.message || 'Failed to load proxies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProxy = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      await api.createProxy(formData);
      setShowCreateForm(false);
      setFormData({ type: 'residential', country: 'US', city: '' });
      setSuccess('Proxy created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await loadProxies();
    } catch (error: any) {
      setError(error.message || 'Failed to create proxy');
    } finally {
      setCreating(false);
    }
  };

  const handleProxyAction = async (action: string, proxyId: number) => {
    if (action === 'delete') {
      if (confirm('Are you sure you want to delete this proxy?')) {
        try {
          await api.deleteProxy(proxyId);
          setSuccess('Proxy deleted successfully!');
          setTimeout(() => setSuccess(''), 3000);
          await loadProxies();
        } catch (error: any) {
          setError(error.message || 'Failed to delete proxy');
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center">
          <LoadingSpinner className="mr-3" />
          <span className="text-lg">Loading proxies...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Proxy Management</h1>
              <p className="text-gray-600">Manage your proxy endpoints</p>
            </div>
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="text-primary-600 hover:text-primary-500">
                ← Back to Dashboard
              </a>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary"
              >
                Create Proxy
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          </div>
        )}
        
        {success && (
          <div className="mb-6">
            <SuccessMessage message={success} onDismiss={() => setSuccess('')} />
          </div>
        )}
        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Proxy</h3>
              <form onSubmit={handleCreateProxy} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proxy Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="residential">Residential</option>
                    <option value="datacenter">Datacenter</option>
                    <option value="mobile">Mobile</option>
                    <option value="isp">ISP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="JP">Japan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., New York"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="btn btn-primary flex-1 disabled:opacity-50 flex items-center justify-center"
                  >
                    {creating ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Proxies Grid */}
        {proxies.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-lg font-semibold mb-2">No proxy endpoints yet</h3>
            <p className="text-gray-600 mb-4">Create your first proxy endpoint to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary"
            >
              Create Your First Proxy
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proxies.map((proxy) => (
              <ProxyCard
                key={proxy.id}
                proxy={proxy}
                onAction={handleProxyAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}