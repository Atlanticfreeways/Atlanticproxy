import { useState } from 'react';

interface ComplianceReport {
  id: string;
  title: string;
  type: 'gdpr' | 'ccpa' | 'hipaa' | 'soc2';
  status: 'compliant' | 'partial' | 'non-compliant';
  lastUpdated: string;
  downloadUrl: string;
}

export const ComplianceReports = () => {
  const [reports] = useState<ComplianceReport[]>([
    { id: '1', title: 'GDPR Compliance Report', type: 'gdpr', status: 'compliant', lastUpdated: '2024-01-15', downloadUrl: '#' },
    { id: '2', title: 'CCPA Compliance Report', type: 'ccpa', status: 'compliant', lastUpdated: '2024-01-15', downloadUrl: '#' },
    { id: '3', title: 'HIPAA Compliance Report', type: 'hipaa', status: 'partial', lastUpdated: '2024-01-10', downloadUrl: '#' },
    { id: '4', title: 'SOC 2 Type II Report', type: 'soc2', status: 'compliant', lastUpdated: '2024-01-01', downloadUrl: '#' }
  ]);

  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const statusColor = {
    compliant: 'bg-green-100 text-green-800',
    partial: 'bg-yellow-100 text-yellow-800',
    'non-compliant': 'bg-red-100 text-red-800'
  };

  const typeIcon = {
    gdpr: '🇪🇺',
    ccpa: '🇺🇸',
    hipaa: '🏥',
    soc2: '🔒'
  };

  const complianceDetails = {
    gdpr: 'General Data Protection Regulation - EU data protection',
    ccpa: 'California Consumer Privacy Act - California privacy rights',
    hipaa: 'Health Insurance Portability and Accountability Act - Healthcare data',
    soc2: 'Service Organization Control 2 - Security and availability'
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Compliance Reports</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {reports.map(report => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`text-left p-4 rounded-lg border-2 transition-colors ${
              selectedReport === report.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3 mb-2">
              <span className="text-2xl">{typeIcon[report.type]}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{report.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{complianceDetails[report.type]}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-3">
              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor[report.status]}`}>
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </span>
              <span className="text-xs text-gray-500">Updated: {report.lastUpdated}</span>
            </div>
          </button>
        ))}
      </div>

      {selectedReport && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-blue-800 mb-2">
                <strong>Report Selected:</strong> {reports.find(r => r.id === selectedReport)?.title}
              </p>
              <p className="text-xs text-blue-700">
                This report contains detailed compliance information and audit trails.
              </p>
            </div>
            <a href="#" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Download PDF
            </a>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Compliance Status Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Compliant</p>
            <p className="text-2xl font-bold text-green-600">{reports.filter(r => r.status === 'compliant').length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Partial</p>
            <p className="text-2xl font-bold text-yellow-600">{reports.filter(r => r.status === 'partial').length}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Non-Compliant</p>
            <p className="text-2xl font-bold text-red-600">{reports.filter(r => r.status === 'non-compliant').length}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> All compliance reports are automatically generated and updated. For detailed audit information, please contact our compliance team.
        </p>
      </div>
    </div>
  );
};
