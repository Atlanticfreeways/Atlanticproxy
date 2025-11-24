'use client';

import { useState } from 'react';

interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  dateRange: 'week' | 'month' | 'year' | 'custom';
  includeMetrics: boolean;
  includeBilling: boolean;
  includeConnections: boolean;
  startDate?: string;
  endDate?: string;
}

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataExportModal({ isOpen, onClose }: DataExportModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: 'month',
    includeMetrics: true,
    includeBilling: true,
    includeConnections: true,
  });

  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 1500));
    setExporting(false);
    setExported(true);
    setTimeout(() => {
      setExported(false);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Export Data</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {exported && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
            ✓ Data exported successfully
          </div>
        )}

        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2">Export Format</label>
            <div className="space-y-2">
              {(['csv', 'json', 'pdf'] as const).map((fmt) => (
                <label key={fmt} className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value={fmt}
                    checked={options.format === fmt}
                    onChange={(e) => setOptions({ ...options, format: e.target.value as typeof fmt })}
                    className="mr-2"
                  />
                  <span className="text-sm">{fmt.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-semibold mb-2">Date Range</label>
            <select
              value={options.dateRange}
              onChange={(e) => setOptions({ ...options, dateRange: e.target.value as any })}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {options.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold mb-1">Start Date</label>
                <input
                  type="date"
                  value={options.startDate || ''}
                  onChange={(e) => setOptions({ ...options, startDate: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">End Date</label>
                <input
                  type="date"
                  value={options.endDate || ''}
                  onChange={(e) => setOptions({ ...options, endDate: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          )}

          {/* Data Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2">Include Data</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeMetrics}
                  onChange={(e) => setOptions({ ...options, includeMetrics: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">Performance Metrics</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeBilling}
                  onChange={(e) => setOptions({ ...options, includeBilling: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">Billing Information</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeConnections}
                  onChange={(e) => setOptions({ ...options, includeConnections: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">Connection History</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}
