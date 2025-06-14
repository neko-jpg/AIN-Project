import React from 'react';

interface DifficultyChartProps {
  userLevel: string;
  projectComplexity?: number;
}

const DifficultyChart: React.FC<DifficultyChartProps> = ({ userLevel, projectComplexity = 2 }) => {
  const levelToNumber = {
    '初心者': 1,
    '中級者': 2,
    '上級者': 3,
  };

  const userLevelNum = levelToNumber[userLevel as keyof typeof levelToNumber] || 2;
  
  const bars = [
    { label: 'あなたのレベル', value: userLevelNum, color: 'bg-blue-500' },
    { label: 'プロジェクト難易度', value: projectComplexity, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-3">
      {bars.map((bar, index) => (
        <div key={index}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">{bar.label}</span>
            <span className="text-sm text-gray-500">{bar.value}/3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${bar.color} transition-all duration-300`}
              style={{ width: `${(bar.value / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DifficultyChart;