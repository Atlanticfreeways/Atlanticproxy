'use client';

import { useState, useEffect } from 'react';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
}

export default function BillingDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentPlan, setCurrentPlan] = useState('Professional');
  const [nextBillingDate, setNextBillingDate] = useState('2024-02-15');
  const [monthlySpend, setMonthlySpend] = useState(49.99);

  useEffect(() => {
    const mockInvoices: Invoice[] = [
      { id: 'INV-001', date: '2024-01-15', amount: 49.99, status: 'paid', description: 'Residential - 10GB' },
      { id: 'INV-002', date: '2023-12-15', amount: 49.99, status: 'paid', description: 'Residential - 10GB' },
      { id: 'INV-003', date: '2023-11-15', amount: 49.99, status: 'paid', description: 'Residential - 10GB' },
    ];
    setInvoices(mockInvoices);
  }, []);

  return (
    <div className="space-y-6">
      {/* Current Plan Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Billing Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Current Plan</p>
            <p className="text-2xl font-bold text-blue-600">{currentPlan}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Monthly Cost</p>
            <p className="text-2xl font-bold text-green-600">${monthlySpend}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Next Billing</p>
            <p className="text-2xl font-bold text-purple-600">{nextBillingDate}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Upgrade Plan
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Change Payment Method
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Download Invoice
          </button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Invoice History</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Invoice ID</th>
                <th className="text-left py-3 px-4 font-semibold">Date</th>
                <th className="text-left py-3 px-4 font-semibold">Description</th>
                <th className="text-left py-3 px-4 font-semibold">Amount</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{invoice.id}</td>
                  <td className="py-3 px-4">{invoice.date}</td>
                  <td className="py-3 px-4">{invoice.description}</td>
                  <td className="py-3 px-4 font-semibold">${invoice.amount}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-600 hover:underline text-sm">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Quota */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Current Usage</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Bandwidth Used</span>
              <span className="text-gray-600">7.2 GB / 10 GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '72%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Concurrent Connections</span>
              <span className="text-gray-600">32 / 50</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '64%' }}></div>
            </div>
          </div>
        </div>

        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add More Bandwidth
        </button>
      </div>
    </div>
  );
}
