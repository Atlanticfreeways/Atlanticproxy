'use client';

import { ProxyProtocol, ISPTier, PROTOCOL_OPTIONS, ISP_TIER_OPTIONS, PricingCalculation } from './types/ProxyCustomization';

interface PricingCalculatorProps {
  basePrice: number;
  protocol: ProxyProtocol;
  ispTier: ISPTier;
  bandwidth: string;
  billingCycle: 'monthly' | 'annual';
}

export default function PricingCalculator({
  basePrice,
  protocol,
  ispTier,
  bandwidth,
  billingCycle,
}: PricingCalculatorProps) {
  const protocolOption = PROTOCOL_OPTIONS[protocol];
  const ispTierOption = ISP_TIER_OPTIONS[ispTier];

  const calculation: PricingCalculation = {
    basePrice,
    protocolAdjustment: protocolOption.priceModifier,
    ispTierAdjustment: ispTierOption.priceModifier,
    totalPrice: basePrice + protocolOption.priceModifier + ispTierOption.priceModifier,
  };

  // Calculate annual savings
  if (billingCycle === 'annual') {
    calculation.savings = calculation.totalPrice * 12 * 0.17; // 17% annual discount
  }

  const monthlyPrice = calculation.totalPrice;
  const annualPrice = billingCycle === 'annual' ? monthlyPrice * 12 * 0.83 : monthlyPrice * 12;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
      <h3 className="text-lg font-bold mb-6 text-gray-900">Price Breakdown</h3>

      {/* Breakdown Items */}
      <div className="space-y-3 mb-6">
        {/* Base Price */}
        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Base Plan</p>
            <p className="text-xs text-gray-600">{bandwidth} bandwidth</p>
          </div>
          <p className="font-bold text-gray-900">${basePrice.toFixed(2)}</p>
        </div>

        {/* Protocol Adjustment */}
        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
          <div>
            <p className="font-medium text-gray-900">{protocolOption.name} Protocol</p>
            <p className="text-xs text-gray-600">{protocolOption.description}</p>
          </div>
          <div className="text-right">
            {protocolOption.priceModifier > 0 && (
              <p className="font-bold text-orange-600">+${protocolOption.priceModifier.toFixed(2)}</p>
            )}
            {protocolOption.priceModifier === 0 && (
              <p className="font-bold text-green-600">Included</p>
            )}
          </div>
        </div>

        {/* ISP Tier Adjustment */}
        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
          <div>
            <p className="font-medium text-gray-900">{ispTierOption.name} ISP Tier</p>
            <p className="text-xs text-gray-600">{ispTierOption.description}</p>
          </div>
          <div className="text-right">
            {ispTierOption.priceModifier > 0 && (
              <p className="font-bold text-orange-600">+${ispTierOption.priceModifier.toFixed(2)}</p>
            )}
            {ispTierOption.priceModifier < 0 && (
              <p className="font-bold text-green-600">${ispTierOption.priceModifier.toFixed(2)}</p>
            )}
            {ispTierOption.priceModifier === 0 && (
              <p className="font-bold text-gray-600">Base</p>
            )}
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="border-t-2 border-blue-200 pt-4 mb-6">
        <div className="flex justify-between items-center">
          <p className="text-lg font-bold text-gray-900">Monthly Total</p>
          <p className="text-3xl font-bold text-blue-600">${monthlyPrice.toFixed(2)}</p>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {billingCycle === 'annual' && `Annual: $${annualPrice.toFixed(2)} (Save ${calculation.savings?.toFixed(2)})`}
          {billingCycle === 'monthly' && `Billed monthly`}
        </p>
      </div>

      {/* Savings Badge */}
      {calculation.savings && calculation.savings > 0 && (
        <div className="p-3 bg-green-100 rounded-lg border border-green-300">
          <p className="text-sm font-bold text-green-900">
            💰 Save ${calculation.savings.toFixed(2)} with annual billing
          </p>
        </div>
      )}

      {/* Customization Summary */}
      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
        <p className="text-xs font-bold text-gray-700 mb-2">YOUR CUSTOMIZATION:</p>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
            {protocolOption.name}
          </span>
          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded font-medium">
            {ispTierOption.name} ISP
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded font-medium">
            {bandwidth}
          </span>
        </div>
      </div>
    </div>
  );
}
