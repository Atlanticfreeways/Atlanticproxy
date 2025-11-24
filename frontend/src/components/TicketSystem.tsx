import { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created: string;
  updated: string;
}

export const TicketSystem = () => {
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 'TKT-001', subject: 'Connection timeout issue', status: 'in-progress', priority: 'high', created: '2024-01-15', updated: '2024-01-20' },
    { id: 'TKT-002', subject: 'Billing inquiry', status: 'resolved', priority: 'medium', created: '2024-01-10', updated: '2024-01-18' },
    { id: 'TKT-003', subject: 'Feature request', status: 'open', priority: 'low', created: '2024-01-20', updated: '2024-01-20' }
  ]);

  const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'medium' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const handleCreateTicket = async () => {
    if (!newTicket.subject.trim()) {
      setError('Subject is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket)
      });

      if (!response.ok) throw new Error('Failed to create ticket');
      
      const data = await response.json();
      setTickets([...tickets, data]);
      setNewTicket({ subject: '', description: '', priority: 'medium' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    open: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  };

  const priorityColor = {
    low: 'text-gray-600',
    medium: 'text-blue-600',
    high: 'text-orange-600',
    urgent: 'text-red-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Support Tickets</h2>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-3">
            {tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket.id)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedTicket === ticket.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">{ticket.subject}</div>
                    <div className="text-sm text-gray-600">{ticket.id}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor[ticket.status]}`}>
                    {ticket.status}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span className={priorityColor[ticket.priority]}>Priority: {ticket.priority}</span>
                  <span>Updated: {ticket.updated}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Create New Ticket</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                placeholder="Subject"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                placeholder="Description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
              <button
                onClick={handleCreateTicket}
                disabled={loading}
                className="w-full px-3 py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? <LoadingSpinner /> : 'Create Ticket'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
