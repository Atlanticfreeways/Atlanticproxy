'use client';

import { useState } from 'react';
import ProtocolSelector from './ProtocolSelector';
import ISPTierSelector from './ISPTierSelector';
import PricingCalculator from './PricingCalculator';
import { ProxyProtocol, ISPTier } from './types/ProxyCustomization';

interface ProxyCustomizerProps {
  basePrice: number;
  bandwidth: string;
  planName: string;
  onCustomizationChange?: (customization: {
    protocol: ProxyProtocol;
    ispTier: ISPTier;
    finalPrice: number;
  }) => void;
}

export default function ProxyCustomizer({
  basePrice,
  bandwidth,
  planName,
  onCustomizationChange,
}: ProxyCustomizerProps) {
  const [protocol, setProtocol] = useState<ProxyProtocol>('http');
  const [ispTier, setISPTier] = useState<ISPTier>('standard');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleProtocolChange = (newProtocol: ProxyProtocol) => {
    setProtocol(newProtocol);
    notifyChange(newProtocol, ispTier);
  };

  const handleISPTierChange = (newTier: ISPTier) => {
    setISPTier(newTier);
    notifyChange(protocol, newTier);
  };

  const notifyChange = (proto: ProxyProtocol, tier: ISPTier) => {
    if (onCustomizationChange) {
      const finalPrice = calculateFinalPrice(proto, tier);
      onCustomizationChange({
        protocol: proto,
        ispTier: tier,
        finalPrice,
      });
    }
  };

  const calculateFinalPrice = (proto: ProxyProtocol, tier: ISPTier) => {
    // Import would be needed in real implementation
    const protocolModifiers: Record<ProxyProtocol, number> = {
      http: 0,
      https: 1,
      socks5: 2,
    };
    const tierModifiers: Record<ISPTier, number> = {
      budget: -3,
      standard: 0,
      premium: 5,
    };
    return basePrice + protocolModifiers[proto] + tierModifiers[tier];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{planName}</h2>
            <p className="text-gray-600 mt-1">Customize your proxy setup to match your needs</p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Customize'}
          </button>
        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Protocol</p>
            <p className="font-bold text-gray-900">{protocol.toUpperCase()}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">ISP Tier</p>
            <p className="font-bold text-gray-900 capitalize">{ispTier}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Monthly Price</p>
            <p className="font-bold text-blue-600">${calculateFinalPrice(protocol, ispTier).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Customization Panels */}
      {isExpanded && (
        <div className="space-y-6">
          {/* Protocol Selection */}
          <ProtocolSelector
            selected={protocol}
            onSelect={handleProtocolChange}
            basePrice={basePrice}
          />

          {/* ISP Tier Selection */}
          <ISPTierSelector
            selected={ispTier}
            onSelect={handleISPTierChange}
            basePrice={basePrice}
          />

          {/* Billing Cycle */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold mb-4">Billing Cycle</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  billingCycle === 'annual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Annual (Save 17%)
              </button>
            </div>
          </div>

          {/* Pricing Calculator */}
          <PricingCalculator
            basePrice={basePrice}
            protocol={protocol}
            ispTier={ispTier}
            bandwidth={bandwidth}
            billingCycle={billingCycle}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsExpanded(false)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsExpanded(false);
                // Handle purchase
              }}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Continue to Checkout
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h4 className="font-bold text-blue-900 mb-3">❓ Why Customize?</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>Protocol:</strong> Choose HTTP for speed, HTTPS for security, or SOCKS5 for universal compatibility.
          </p>
          <p>
            <strong>ISP Tier:</strong> Budget saves money but has higher detection risk. Premium offers dedicated IPs and priority support.
          </p>
          <p>
            <strong>Billing:</strong> Annual billing saves 17% compared to monthly. Perfect for long-term users.
          </p>
        </div>
      </div>
    </div>
  );
}
