import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface BudgetBreakdownChartProps {
  budget: number;
}

const BudgetBreakdownChart: React.FC<BudgetBreakdownChartProps> = ({ budget }) => {
  const data = [
    { name: 'クラウドサービス', value: Math.round(budget * 0.4), color: '#3B82F6' },
    { name: 'AI/MLサービス', value: Math.round(budget * 0.3), color: '#8B5CF6' },
    { name: 'データベース', value: Math.round(budget * 0.15), color: '#10B981' },
    { name: 'その他ツール', value: Math.round(budget * 0.15), color: '#F59E0B' },
  ];

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">予算内訳</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`¥${value.toLocaleString()}`, '']} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-gray-600">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetBreakdownChart;