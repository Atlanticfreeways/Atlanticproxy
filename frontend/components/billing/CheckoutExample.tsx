'use client';

import { useState } from 'react';
import proxyApi from '@/lib/api/proxyApi';
import { ProxyProtocol, ISPTier } from './types/ProxyCustomization';

/**
 * Example Component: How to integrate API calls with Phase 4 components
 * This shows the pattern for connecting frontend to backend
 */

interface CheckoutState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export default function CheckoutExample() {
  const [state, setState] = useState<CheckoutState>({
    loading: false,
    error: null,
    success: false,
  });

  // Example 1: Calculate price with customization
  const handleCalculatePrice = async () => {
    setState({ loading: true, error: null, success: false });
    try {
      const result = await proxyApi.billing.calculatePrice({
        planId: 'pro',
        protocol: 'https' as ProxyProtocol,
        ispTier: 'premium' as ISPTier,
        billingCycle: 'monthly',
      });
      console.log('Price calculated:', result);
      setState({ loading: false, error: null, success: true });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      });
    }
  };

  // Example 2: Process checkout
  const handleCheckout = async () => {
    setState({ loading: true, error: null, success: false });
    try {
      const result = await proxyApi.billing.checkout({
        planId: 'pro',
        protocol: 'https' as ProxyProtocol,
        ispTier: 'premium' as ISPTier,
        billingCycle: 'monthly',
        paymentMethodId: 'pm_123', // From payment method selection
      });
      console.log('Checkout successful:', result);
      setState({ loading: false, error: null, success: true });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Checkout failed',
        success: false,
      });
    }
  };

  // Example 3: Get payment methods
  const handleGetPaymentMethods = async () => {
    setState({ loading: true, error: null, success: false });
    try {
      const methods = await proxyApi.billing.getPaymentMethods();
      console.log('Payment methods:', methods);
      setState({ loading: false, error: null, success: true });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch',
        success: false,
      });
    }
  };

  // Example 4: Get invoices
  const handleGetInvoices = async () => {
    setState({ loading: true, error: null, success: false });
    try {
      const invoices = await proxyApi.billing.getInvoices({
        status: 'paid',
        limit: 10,
      });
      console.log('Invoices:', invoices);
      setState({ loading: false, error: null, success: true });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch',
        success: false,
      });
    }
  };

  // Example 5: Save proxy configuration
  const handleSaveConfiguration = async () => {
    setState({ loading: true, error: null, success: false });
    try {
      const result = await proxyApi.proxy.saveConfiguration({
        protocol: 'https' as ProxyProtocol,
        ispTier: 'premium' as ISPTier,
        locations: ['1', '2', '3'],
        loadBalancingMode: 'round-robin',
      });
      console.log('Configuration saved:', result);
      setState({ loading: false, error: null, success: true });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to save',
        success: false,
      });
    }
  };

  // Example 6: Update notification settings
  const handleUpdateNotifications = async () => {
    setState({ loading: true, error: null, success: false });
    try {
      const result = await proxyApi.notifications.updateEmailSettings({
        dailyReport: true,
        weeklyReport: true,
        monthlyReport: false,
        usageAlerts: true,
        billingAlerts: true,
        securityAlerts: true,
        maintenanceNotices: true,
        newFeatures: false,
        reportTime: '09:00',
      });
      console.log('Notifications updated:', result);
      setState({ loading: false, error: null, success: true });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update',
        success: false,
      });
    }
  };

  // Example 7: Get cost analysis
  const handleGetCostAnalysis = async () => {
    setState({ loading: true, error: null, success: false });
    try {
      const analysis = await proxyApi.billing.getCostAnalysis('month');
      console.log('Cost analysis:', analysis);
      setState({ loading: false, error: null, success: true });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch',
        success: false,
      });
    }
  };

  // Example 8: Get proxy locations
  const handleGetLocations = async () => {
    setState({ loading: true, error: null, success: false });
    try {
      const locations = await proxyApi.proxy.getLocations();
      console.log('Locations:', locations);
      setState({ loading: false, error: null, success: true });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch',
        success: false,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-6">API Integration Examples</h3>

      {/* Status Messages */}
      {state.error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
          ✕ Error: {state.error}
        </div>
      )}
      {state.success && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
          ✓ Success! Check console for details.
        </div>
      )}

      {/* Example Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={handleCalculatePrice}
          disabled={state.loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {state.loading ? 'Loading...' : 'Calculate Price'}
        </button>

        <button
          onClick={handleCheckout}
          disabled={state.loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {state.loading ? 'Loading...' : 'Process Checkout'}
        </button>

        <button
          onClick={handleGetPaymentMethods}
          disabled={state.loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {state.loading ? 'Loading...' : 'Get Payment Methods'}
        </button>

        <button
          onClick={handleGetInvoices}
          disabled={state.loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {state.loading ? 'Loading...' : 'Get Invoices'}
        </button>

        <button
          onClick={handleSaveConfiguration}
          disabled={state.loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {state.loading ? 'Loading...' : 'Save Configuration'}
        </button>

        <button
          onClick={handleUpdateNotifications}
          disabled={state.loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {state.loading ? 'Loading...' : 'Update Notifications'}
        </button>

        <button
          onClick={handleGetCostAnalysis}
          disabled={state.loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {state.loading ? 'Loading...' : 'Get Cost Analysis'}
        </button>

        <button
          onClick={handleGetLocations}
          disabled={state.loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {state.loading ? 'Loading...' : 'Get Locations'}
        </button>
      </div>

      {/* Integration Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm font-bold text-blue-900 mb-2">📝 Integration Instructions</p>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Import API client: <code className="bg-white px-1 rounded">import proxyApi from '@/lib/api/proxyApi'</code></li>
          <li>Use in components: <code className="bg-white px-1 rounded">await proxyApi.billing.checkout(...)</code></li>
          <li>Handle errors with try/catch</li>
          <li>Show loading states during API calls</li>
          <li>Display success/error messages to users</li>
          <li>Check browser console for API responses</li>
        </ol>
      </div>

      {/* API Documentation Link */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-900">
          <strong>📚 Full API Documentation:</strong> See <code className="bg-white px-1 rounded">BACKEND_INTEGRATION_GUIDE.md</code>
        </p>
      </div>
    </div>
  );
}
