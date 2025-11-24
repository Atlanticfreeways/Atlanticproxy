export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Proxy {
  id: string;
  name: string;
  type: 'residential' | 'datacenter' | 'mobile';
  country: string;
  status: 'active' | 'inactive';
  endpoint: string;
}

export interface ProxyEndpoint {
  id: number;
  proxyType: string;
  status: 'active' | 'inactive' | 'suspended';
  endpointUrl: string;
  country?: string;
}

export interface Subscription {
  id: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'cancelled';
  renewalDate: string;
  price: number;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}
