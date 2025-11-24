import { useState } from 'react';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  downloadUrl: string;
}

export const InvoiceHistory = () => {
  const [invoices] = useState<Invoice[]>([
    { id: 'INV-001', date: '2024-01-20', amount: 99, status: 'paid', description: 'Professional Plan - January', downloadUrl: '#' },
    { id: 'INV-002', date: '2023-12-20', amount: 99, status: 'paid', description: 'Professional Plan - December', downloadUrl: '#' },
    { id: 'INV-003', date: '2023-11-20', amount: 99, status: 'paid', description: 'Professional Plan - November', downloadUrl: '#' },
    { id: 'INV-004', date: '2023-10-20', amount: 99, status: 'paid', description: 'Professional Plan - October', downloadUrl: '#' }
  ]);

  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  const statusColor = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800'
  };

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Invoice History</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Invoices</p>
          <p className="text-2xl font-bold text-blue-600">{invoices.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">${totalPaid}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Average Invoice</p>
          <p className="text-2xl font-bold text-purple-600">${Math.round(totalPaid / invoices.length)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Invoice ID</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(invoice => (
              <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-mono text-gray-900">{invoice.id}</td>
                <td className="py-3 px-4 text-gray-600">{invoice.date}</td>
                <td className="py-3 px-4 text-gray-600">{invoice.description}</td>
                <td className="py-3 px-4 text-right font-semibold text-gray-900">${invoice.amount}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[invoice.status]}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => setSelectedInvoice(invoice.id)}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedInvoice && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Invoice <strong>{selectedInvoice}</strong> selected. 
            <a href="#" className="underline ml-2">Download PDF</a>
          </p>
        </div>
      )}
    </div>
  );
};
