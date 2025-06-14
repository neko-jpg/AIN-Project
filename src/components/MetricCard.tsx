import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  unit = '', 
  icon, 
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <p className="text-2xl font-bold mt-1">
            {value}
            {unit && <span className="text-base font-normal ml-1">{unit}</span>}
          </p>
        </div>
        {icon && <div className="opacity-70">{icon}</div>}
      </div>
    </div>
  );
};

export default MetricCard;