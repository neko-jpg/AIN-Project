import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TimelineChartProps {
  duration: number;
}

const TimelineChart: React.FC<TimelineChartProps> = ({ duration }) => {
  const phases = [
    { name: '設計・準備', months: Math.max(1, Math.round(duration * 0.2)), color: '#3B82F6' },
    { name: '開発', months: Math.max(1, Math.round(duration * 0.5)), color: '#8B5CF6' },
    { name: 'テスト', months: Math.max(1, Math.round(duration * 0.2)), color: '#10B981' },
    { name: 'デプロイ', months: Math.max(1, Math.round(duration * 0.1)), color: '#F59E0B' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">開発フェーズ</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={phases}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              label={{ value: 'ヶ月', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip formatter={(value) => [`${value}ヶ月`, '']} />
            <Bar dataKey="months" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>総開発期間: <span className="font-semibold text-gray-900">{duration}ヶ月</span></p>
      </div>
    </div>
  );
};

export default TimelineChart;