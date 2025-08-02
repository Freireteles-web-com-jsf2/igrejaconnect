import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  change?: string;
  changeType?: 'positive' | 'negative';
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
};

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  color, 
  change, 
  changeType 
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
