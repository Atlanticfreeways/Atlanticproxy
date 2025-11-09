// Type definitions adapted from old project structure

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  role: 'user' | 'reseller' | 'admin';
  isVerified: boolean;
  createdAt: string;
}

export interface ProxyEndpoint {
  id: number;
  userId: number;
  endpointUrl: string;
  proxyType: 'residential' | 'datacenter' | 'mobile' | 'isp';
  country?: string;
  city?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface UsageRecord {
  id: number;
  userId: number;
  endpointId: number;
  bytesUsed: number;
  requestsCount: number;
  successCount: number;
  recordedAt: string;
}

export interface ReferralCode {
  id: number;
  userId: number;
  code: string;
  commissionRate: number;
  totalReferrals: number;
  totalEarnings: number;
  isActive: boolean;
  createdAt: string;
}

export interface Subscription {
  id: number;
  userId: number;
  planName: string;
  planType: 'individual' | 'reseller' | 'enterprise';
  monthlyLimit?: number;
  price: number;
  status: 'active' | 'cancelled' | 'suspended';
  startsAt: string;
  endsAt?: string;
  createdAt: string;
}

export interface DashboardStats {
  activeProxies: number;
  bandwidthUsed: string;
  successRate: string;
  avgResponse: string;
  currentPlan: string;
  requestsToday: string;
}