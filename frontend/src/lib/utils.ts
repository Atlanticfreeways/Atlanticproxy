// Frontend utilities adapted from old project
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const generateId = (length: number = 8): string => {
  return Math.random().toString(36).substr(2, length);
};

export const getProxyIcon = (type: string): string => {
  const icons: Record<string, string> = {
    residential: '🏠',
    datacenter: '🏢', 
    mobile: '📱',
    isp: '🌐'
  };
  return icons[type] || '🌐';
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
};