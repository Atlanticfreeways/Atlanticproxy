interface ExportColumn {
  key: string;
  label: string;
  format?: (value: any) => string;
}

interface ExportOptions {
  columns: ExportColumn[];
  filename?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export const convertToCSV = (data: any[], options: ExportOptions): string => {
  if (!data.length) return '';

  const { columns } = options;
  
  // Create header row
  const headers = columns.map(col => col.label).join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col.key];
      
      // Apply formatting if provided
      if (col.format && value !== null && value !== undefined) {
        value = col.format(value);
      }
      
      // Escape commas and quotes in CSV
      if (typeof value === 'string') {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      return value || '';
    }).join(',');
  });
  
  return [headers, ...rows].join('\n');
};

export const downloadFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Predefined export configurations
export const EXPORT_CONFIGS = {
  usage: {
    columns: [
      { key: 'timestamp', label: 'Date/Time' },
      { key: 'bytes_sent', label: 'Data Sent', format: formatBytes },
      { key: 'bytes_received', label: 'Data Received', format: formatBytes },
      { key: 'requests_count', label: 'Requests' },
      { key: 'session_duration', label: 'Duration', format: formatDuration },
      { key: 'server_location', label: 'Server Location' },
      { key: 'cost', label: 'Cost ($)', format: (v: number) => v.toFixed(2) }
    ]
  },
  
  connections: {
    columns: [
      { key: 'connected_at', label: 'Connected At' },
      { key: 'disconnected_at', label: 'Disconnected At' },
      { key: 'duration', label: 'Duration', format: formatDuration },
      { key: 'server_location', label: 'Server' },
      { key: 'ip_address', label: 'IP Address' },
      { key: 'bytes_transferred', label: 'Data Used', format: formatBytes },
      { key: 'status', label: 'Status' }
    ]
  },
  
  billing: {
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'description', label: 'Description' },
      { key: 'amount', label: 'Amount ($)', format: (v: number) => v.toFixed(2) },
      { key: 'status', label: 'Status' },
      { key: 'invoice_id', label: 'Invoice ID' },
      { key: 'payment_method', label: 'Payment Method' }
    ]
  }
};

// Main export functions
export const exportUsageData = async (token: string, dateRange?: { start: string; end: string }) => {
  try {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('start', dateRange.start);
      params.append('end', dateRange.end);
    }
    
    const response = await fetch(`/api/export/usage?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    const csv = convertToCSV(data, EXPORT_CONFIGS.usage);
    const filename = `usage-report-${dateRange?.start || 'all'}-${dateRange?.end || Date.now()}.csv`;
    
    downloadFile(csv, filename);
  } catch (error) {
    throw new Error('Failed to export usage data');
  }
};

export const exportConnectionHistory = async (token: string, dateRange?: { start: string; end: string }) => {
  try {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('start', dateRange.start);
      params.append('end', dateRange.end);
    }
    
    const response = await fetch(`/api/export/connections?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    const csv = convertToCSV(data, EXPORT_CONFIGS.connections);
    const filename = `connections-${dateRange?.start || 'all'}-${dateRange?.end || Date.now()}.csv`;
    
    downloadFile(csv, filename);
  } catch (error) {
    throw new Error('Failed to export connection history');
  }
};

export const exportBillingData = async (token: string, dateRange?: { start: string; end: string }) => {
  try {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('start', dateRange.start);
      params.append('end', dateRange.end);
    }
    
    const response = await fetch(`/api/export/billing?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    const csv = convertToCSV(data, EXPORT_CONFIGS.billing);
    const filename = `billing-${dateRange?.start || 'all'}-${dateRange?.end || Date.now()}.csv`;
    
    downloadFile(csv, filename);
  } catch (error) {
    throw new Error('Failed to export billing data');
  }
};