import { useState } from 'react';

interface ResellerStats {
  totalClients: number;
  monthlyRevenue: number;
  commissionRate: number;
  pendingCommission: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  plan: string;
  monthlySpend: number;
  joinDate: string;
}

export const ResellerDashboard = () => {
  const [stats] = useState<ResellerStats>({
    totalClients: 24,
    monthlyRevenue: 4800,
    commissionRate: 30,
    pendingCommission: 1440
  });

  const [clients] = useState<Client[]>([
    { id: '1', name: 'Acme Corp', email: 'contact@acme.com', plan: 'Professional', monthlySpend: 99, joinDate: '2024-01-01' },
    { id: '2', name: 'Tech Startup', email: 'info@techstartup.com', plan: 'Enterprise', monthlySpend: 299, joinDate: '2024-01-05' },
    { id: '3', name: 'Data Analytics Inc', email: 'sales@dataanalytics.com', plan: 'Professional', monthlySpend: 99, joinDate: '2024-01-10' }
  ]);

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Reseller Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Clients</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalClients}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Monthly Revenue</p>
          <p className="text-3xl font-bold text-green-600">${stats.monthlyRevenue}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Commission Rate</p>
          <p className="text-3xl font-bold text-purple-600">{stats.commissionRate}%</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Pending Commission</p>
          <p className="text-3xl font-bold text-orange-600">${stats.pendingCommission}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Recent Clients</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Client Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Plan</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Monthly Spend</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Join Date</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{client.name}</td>
                  <td className="py-3 px-4 text-gray-600">{client.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {client.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">${client.monthlySpend}</td>
                  <td className="py-3 px-4 text-gray-600">{client.joinDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
          Generate Referral Link
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
          View Commission History
        </button>
      </div>
    </div>
  );
};
