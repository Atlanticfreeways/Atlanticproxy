'use client';

import { ProxyProtocol, PROTOCOL_OPTIONS } from './types/ProxyCustomization';

interface ProtocolSelectorProps {
  selected: ProxyProtocol;
  onSelect: (protocol: ProxyProtocol) => void;
  basePrice: number;
}

export default function ProtocolSelector({
  selected,
  onSelect,
  basePrice,
}: ProtocolSelectorProps) {
  const protocols = Object.values(PROTOCOL_OPTIONS);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">Protocol Selection</h3>
        <p className="text-sm text-gray-600">
          Choose how your traffic is routed. Different protocols have different speeds and compatibility.
        </p>
      </div>

      <div className="space-y-3">
        {protocols.map((protocol) => {
          const isSelected = selected === protocol.id;
          const priceAdjustment = protocol.priceModifier;
          const totalPrice = basePrice + priceAdjustment;

          return (
            <button
              key={protocol.id}
              onClick={() => onSelect(protocol.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{protocol.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900">{protocol.name}</p>
                    <p className="text-sm text-gray-600">{protocol.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${totalPrice.toFixed(2)}</p>
                  {priceAdjustment > 0 && (
                    <p className="text-xs text-orange-600">+${priceAdjustment.toFixed(2)}</p>
                  )}
                  {priceAdjustment === 0 && (
                    <p className="text-xs text-green-600">Base price</p>
                  )}
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-3 ml-11">
                <p className="text-xs font-semibold text-gray-700 mb-1">Benefits:</p>
                <div className="flex flex-wrap gap-1">
                  {protocol.benefits.map((benefit, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                    >
                      ✓ {benefit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Use Cases */}
              <div className="ml-11">
                <p className="text-xs font-semibold text-gray-700 mb-1">Best for:</p>
                <p className="text-xs text-gray-600">
                  {protocol.useCases.join(' • ')}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> Start with HTTP for testing. Switch to HTTPS for sensitive data. Use SOCKS5 for desktop apps.
        </p>
      </div>
    </div>
  );
}
