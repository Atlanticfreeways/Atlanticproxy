/**
 * Proxy Customization Types
 * Centralized type definitions for protocol, ISP tier, and pricing
 */

export type ProxyProtocol = 'http' | 'https' | 'socks5';
export type ISPTier = 'budget' | 'standard' | 'premium';
export type ProxyType = 'residential' | 'datacenter' | 'mobile';

export interface ProtocolOption {
  id: ProxyProtocol;
  name: string;
  description: string;
  priceModifier: number; // Monthly price adjustment
  benefits: string[];
  useCases: string[];
  icon: string;
}

export interface ISPTierOption {
  id: ISPTier;
  name: string;
  description: string;
  priceModifier: number; // Monthly price adjustment
  features: string[];
  speedRating: 'slow' | 'medium' | 'fast' | 'very-fast';
  detectionRisk: 'high' | 'medium' | 'low';
  badge?: string;
}

export interface ProxyCustomization {
  protocol: ProxyProtocol;
  ispTier: ISPTier;
  proxyType: ProxyType;
}

export interface PricingCalculation {
  basePrice: number;
  protocolAdjustment: number;
  ispTierAdjustment: number;
  totalPrice: number;
  savings?: number;
}

export const PROTOCOL_OPTIONS: Record<ProxyProtocol, ProtocolOption> = {
  http: {
    id: 'http',
    name: 'HTTP',
    description: 'Standard web protocol - fastest and cheapest',
    priceModifier: 0,
    benefits: [
      'Fastest performance',
      'Lowest latency',
      'Best for web scraping',
      'Ideal for testing',
    ],
    useCases: [
      'Web scraping',
      'API testing',
      'Load testing',
      'Development & testing',
    ],
    icon: '⚡',
  },
  https: {
    id: 'https',
    name: 'HTTPS',
    description: 'Encrypted web protocol - secure and reliable',
    priceModifier: 1.0,
    benefits: [
      'Encrypted traffic',
      'Secure data transmission',
      'Works with modern sites',
      'Better for sensitive data',
    ],
    useCases: [
      'Banking & finance sites',
      'E-commerce',
      'Sensitive data scraping',
      'Production use',
    ],
    icon: '🔒',
  },
  socks5: {
    id: 'socks5',
    name: 'SOCKS5',
    description: 'Universal proxy protocol - works with any application',
    priceModifier: 2.0,
    benefits: [
      'Works with any app',
      'Supports UDP',
      'Most versatile',
      'Best for complex setups',
    ],
    useCases: [
      'Desktop applications',
      'Gaming',
      'Torrent clients',
      'Custom applications',
    ],
    icon: '🔄',
  },
};

export const ISP_TIER_OPTIONS: Record<ISPTier, ISPTierOption> = {
  budget: {
    id: 'budget',
    name: 'Budget',
    description: 'Shared residential IPs - maximum savings',
    priceModifier: -3.0,
    features: [
      'Shared residential IPs',
      'Shared bandwidth',
      'Standard speed',
      'Higher detection risk',
      'Best for testing',
    ],
    speedRating: 'medium',
    detectionRisk: 'high',
    badge: 'Save 30%',
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    description: 'Balanced performance and price - recommended',
    priceModifier: 0,
    features: [
      'Residential IPs',
      'Dedicated bandwidth',
      'Good speed',
      'Low detection risk',
      'Best for most users',
    ],
    speedRating: 'fast',
    detectionRisk: 'low',
    badge: 'Recommended',
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'Dedicated IPs - maximum reliability',
    priceModifier: 5.0,
    features: [
      'Dedicated residential IPs',
      'Priority bandwidth',
      'Very fast speed',
      'Minimal detection risk',
      'Best for production',
    ],
    speedRating: 'very-fast',
    detectionRisk: 'low',
    badge: 'Premium',
  },
};
