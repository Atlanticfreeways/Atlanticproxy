'use client';

import { ISPTier, ISP_TIER_OPTIONS } from './types/ProxyCustomization';

interface ISPTierSelectorProps {
  selected: ISPTier;
  onSelect: (tier: ISPTier) => void;
  basePrice: number;
}

export default function ISPTierSelector({
  selected,
  onSelect,
  basePrice,
}: ISPTierSelectorProps) {
  const tiers = Object.values(ISP_TIER_OPTIONS);

  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case 'slow':
        return '🐢';
      case 'medium':
        return '🚗';
      case 'fast':
        return '🚀';
      case 'very-fast':
        return '⚡';
      default:
        return '→';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ISP Tier Selection</h3>
        <p className="text-sm text-gray-600">
          Choose your IP quality level. Higher tiers mean better speed and lower detection risk.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier) => {
          const isSelected = selected === tier.id;
          const priceAdjustment = tier.priceModifier;
          const totalPrice = basePrice + priceAdjustment;

          return (
            <button
              key={tier.id}
              onClick={() => onSelect(tier.id)}
              className={`text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Header */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-gray-900">{tier.name}</p>
                  {tier.badge && (
                    <span className="text-xs font-bold px-2 py-1 bg-blue-600 text-white rounded">
                      {tier.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600">{tier.description}</p>
              </div>

              {/* Price */}
              <div className="mb-3 pb-3 border-b border-gray-200">
                <p className="font-bold text-lg text-gray-900">${totalPrice.toFixed(2)}</p>
                {priceAdjustment > 0 && (
                  <p className="text-xs text-orange-600">+${priceAdjustment.toFixed(2)}/month</p>
                )}
                {priceAdjustment < 0 && (
                  <p className="text-xs text-green-600">${priceAdjustment.toFixed(2)}/month</p>
                )}
                {priceAdjustment === 0 && (
                  <p className="text-xs text-gray-500">Base price</p>
                )}
              </div>

              {/* Metrics */}
              <div className="mb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Speed</span>
                  <span className="text-sm">{getSpeedIcon(tier.speedRating)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Detection Risk</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${getRiskColor(tier.detectionRisk)}`}>
                    {tier.detectionRisk.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-1">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5 text-xs">✓</span>
                    <span className="text-xs text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 font-bold text-gray-900">Feature</th>
              {tiers.map((tier) => (
                <th key={tier.id} className="text-center py-2 px-3 font-bold text-gray-900">
                  {tier.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-3 text-gray-700">IP Type</td>
              <td className="text-center py-2 px-3 text-gray-600">Shared</td>
              <td className="text-center py-2 px-3 text-gray-600">Residential</td>
              <td className="text-center py-2 px-3 text-gray-600">Dedicated</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-3 text-gray-700">Bandwidth</td>
              <td className="text-center py-2 px-3 text-gray-600">Shared</td>
              <td className="text-center py-2 px-3 text-gray-600">Dedicated</td>
              <td className="text-center py-2 px-3 text-gray-600">Priority</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-3 text-gray-700">Uptime SLA</td>
              <td className="text-center py-2 px-3 text-gray-600">95%</td>
              <td className="text-center py-2 px-3 text-gray-600">99%</td>
              <td className="text-center py-2 px-3 text-gray-600">99.9%</td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-gray-700">Support</td>
              <td className="text-center py-2 px-3 text-gray-600">Email</td>
              <td className="text-center py-2 px-3 text-gray-600">Priority</td>
              <td className="text-center py-2 px-3 text-gray-600">24/7 Phone</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> Budget tier is perfect for testing. Standard is recommended for most users. Premium for production & sensitive tasks.
        </p>
      </div>
    </div>
  );
}
