import { ProxyEndpoint } from '../../types';
import { getProxyIcon } from '../../lib/utils';

interface ProxyCardProps {
  proxy: ProxyEndpoint;
  onAction?: (action: string, proxyId: number) => void;
}

export const ProxyCard = ({ proxy, onAction }: ProxyCardProps) => {
  const statusColor = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800'
  }[proxy.status];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-card-lg transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getProxyIcon(proxy.proxyType)}</span>
          <span className="font-semibold capitalize">{proxy.proxyType}</span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {proxy.status}
        </span>
      </div>
      
      <div className="font-mono text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">
        {proxy.endpointUrl}
      </div>
      
      <div className="flex justify-between text-sm text-gray-500">
        <span>📍 {proxy.country || 'Global'}</span>
        <span>📊 Active</span>
      </div>
      
      {onAction && (
        <div className="mt-3 flex gap-2">
          <button 
            onClick={() => onAction('test', proxy.id)}
            className="text-xs px-3 py-1 bg-primary-50 text-primary-600 rounded hover:bg-primary-100"
          >
            Test
          </button>
          <button 
            onClick={() => onAction('delete', proxy.id)}
            className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};