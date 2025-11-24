import { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { SuccessMessage } from './ui/SuccessMessage';
import { ErrorMessage } from './ui/ErrorMessage';

interface WhiteLabelConfig {
  enabled: boolean;
  brandName: string;
  logoUrl: string;
  primaryColor: string;
  customDomain: string;
  supportEmail: string;
  termsUrl: string;
}

export const WhiteLabelOptions = () => {
  const [config, setConfig] = useState<WhiteLabelConfig>({
    enabled: false,
    brandName: '',
    logoUrl: '',
    primaryColor: '#0066cc',
    customDomain: '',
    supportEmail: '',
    termsUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof WhiteLabelConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (config.enabled && (!config.brandName || !config.customDomain)) {
      setError('Brand name and custom domain are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/white-label', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!response.ok) throw new Error('Failed to save configuration');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">White Label Options</h2>

      {success && <SuccessMessage message="Configuration saved successfully" />}
      {error && <ErrorMessage message={error} />}

      <div className="space-y-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="font-medium text-gray-700">Enable White Label</span>
        </label>

        {config.enabled && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
              <input
                type="text"
                value={config.brandName}
                onChange={(e) => handleChange('brandName', e.target.value)}
                placeholder="Your Company Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
              <input
                type="url"
                value={config.logoUrl}
                onChange={(e) => handleChange('logoUrl', e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={config.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  placeholder="#0066cc"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Domain</label>
              <input
                type="text"
                value={config.customDomain}
                onChange={(e) => handleChange('customDomain', e.target.value)}
                placeholder="proxy.yourcompany.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
              <input
                type="email"
                value={config.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                placeholder="support@yourcompany.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions URL</label>
              <input
                type="url"
                value={config.termsUrl}
                onChange={(e) => handleChange('termsUrl', e.target.value)}
                placeholder="https://yourcompany.com/terms"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> White label customization requires enterprise plan. Contact sales for more information.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? <LoadingSpinner /> : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};
