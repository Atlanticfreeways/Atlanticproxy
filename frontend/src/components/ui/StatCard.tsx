interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export const StatCard = ({ title, value, icon, change, changeType = 'neutral' }: StatCardProps) => {
  const changeColor = {
    positive: 'text-success-500',
    negative: 'text-danger-500',
    neutral: 'text-gray-500'
  }[changeType];

  return (
    <div className="bg-white p-6 rounded-xl shadow-card border border-gray-200 flex items-center gap-4">
      <div className="text-3xl opacity-80">{icon}</div>
      <div className="flex-1">
        <h3 className="text-sm text-gray-500 mb-1">{title}</h3>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change && (
          <div className={`text-sm ${changeColor}`}>{change}</div>
        )}
      </div>
    </div>
  );
};