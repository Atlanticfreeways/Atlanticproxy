'use client';

import { useState } from 'react';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  downloadUrl: string;
}

export default function InvoiceHistory() {
  const [invoices] = useState<Invoice[]>([
    {
      id: 'INV-2024-001',
      date: '2024-01-20',
      amount: 29.99,
      status: 'paid',
      description: 'Professional Plan - Monthly',
      downloadUrl: '#',
    },
    {
      id: 'INV-2024-002',
      date: '2024-01-15',
      amount: 5.00,
      status: 'paid',
      description: 'Additional Bandwidth - 50GB',
      downloadUrl: '#',
    },
    {
      id: 'INV-2024-003',
      date: '2024-01-10',
      amount: 29.99,
      status: 'paid',
      description: 'Professional Plan - Monthly',
      downloadUrl: '#',
    },
    {
      id: 'INV-2024-004',
      date: '2024-01-05',
      amount: 0.99,
      status: 'paid',
      description: 'Quick Pass - 30 Minutes',
      downloadUrl: '#',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');

  const filteredInvoices = invoices.filter(
    inv => filterStatus === 'all' || inv.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return '✓';
      case 'pending':
        return '⏳';
      case 'failed':
        return '✕';
      default:
        return '•';
    }
  };

  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-6">Invoice History</h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
          <p className="text-2xl font-bold text-blue-600">{invoices.length}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-purple-600">
            ${invoices
              .filter(inv => inv.status === 'pending')
              .reduce((sum, inv) => sum + inv.amount, 0)
              .toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {(['all', 'paid', 'pending', 'failed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-bold text-gray-900">Invoice ID</th>
              <th className="text-left py-3 px-4 font-bold text-gray-900">Date</th>
              <th className="text-left py-3 px-4 font-bold text-gray-900">Description</th>
              <th className="text-right py-3 px-4 font-bold text-gray-900">Amount</th>
              <th className="text-center py-3 px-4 font-bold text-gray-900">Status</th>
              <th className="text-center py-3 px-4 font-bold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-mono text-sm text-gray-900">{invoice.id}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{invoice.date}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{invoice.description}</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">
                  ${invoice.amount.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(invoice.status)}`}>
                    {getStatusIcon(invoice.status)} {invoice.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No invoices found</p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> Download invoices for your records. All invoices are automatically emailed to your account email.
        </p>
      </div>
    </div>
  );
}
