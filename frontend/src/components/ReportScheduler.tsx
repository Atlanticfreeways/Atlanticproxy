import { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { SuccessMessage } from './ui/SuccessMessage';
import { ErrorMessage } from './ui/ErrorMessage';

interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  reportType: 'usage' | 'billing' | 'performance' | 'security';
  enabled: boolean;
}

export const ReportScheduler = () => {
  const [reports, setReports] = useState<ScheduledReport[]>([
    { id: '1', name: 'Weekly Usage Report', frequency: 'weekly', recipients: ['user@example.com'], reportType: 'usage', enabled: true },
    { id: '2', name: 'Monthly Billing Report', frequency: 'monthly', recipients: ['user@example.com'], reportType: 'billing', enabled: true }
  ]);

  const [newReport, setNewReport] = useState({ name: '', frequency: 'weekly', recipients: '', reportType: 'usage' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleAddReport = async () => {
    if (!newReport.name.trim() || !newReport.recipients.trim()) {
      setError('Name and recipients are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/reports/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newReport,
          recipients: newReport.recipients.split(',').map(r => r.trim())
        })
      });

      if (!response.ok) throw new Error('Failed to schedule report');

      const data = await response.json();
      setReports([...reports, data]);
      setNewReport({ name: '', frequency: 'weekly', recipients: '', reportType: 'usage' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    const report = reports.find(r => r.id === id);
    if (!report) return;

    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !report.enabled })
      });

      if (!response.ok) throw new Error('Failed to update report');
      setReports(reports.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete report');
      setReports(reports.filter(r => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Report Scheduler</h2>

      {success && <SuccessMessage message="Report scheduled successfully" />}
      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {reports.map(report => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-600">{report.reportType} • {report.frequency}</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={report.enabled}
                    onChange={() => handleToggle(report.id)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">Active</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mb-3">Recipients: {report.recipients.join(', ')}</p>
              <button
                onClick={() => handleDelete(report.id)}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Schedule New Report</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={newReport.name}
              onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
              placeholder="Report name"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <select
              value={newReport.reportType}
              onChange={(e) => setNewReport({ ...newReport, reportType: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="usage">Usage Report</option>
              <option value="billing">Billing Report</option>
              <option value="performance">Performance Report</option>
              <option value="security">Security Report</option>
            </select>

            <select
              value={newReport.frequency}
              onChange={(e) => setNewReport({ ...newReport, frequency: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>

            <textarea
              value={newReport.recipients}
              onChange={(e) => setNewReport({ ...newReport, recipients: e.target.value })}
              placeholder="Email addresses (comma-separated)"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <button
              onClick={handleAddReport}
              disabled={loading}
              className="w-full px-3 py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner /> : 'Schedule Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
