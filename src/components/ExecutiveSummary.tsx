import React from 'react';
import { Target, Clock, User, Briefcase, TrendingUp, AlertTriangle } from 'lucide-react';

interface ExecutiveSummaryProps {
  budget: number;
  duration: number;
  experienceLevel: string;
  projectType: string;
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ 
  budget, 
  duration, 
  experienceLevel, 
  projectType 
}) => {
  const getRiskLevel = () => {
    if (experienceLevel === '初心者' && duration > 6) return { level: '高', color: 'red' };
    if (experienceLevel === '中級者' && duration > 12) return { level: '中', color: 'yellow' };
    return { level: '低', color: 'green' };
  };

  const risk = getRiskLevel();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
      <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Target className="h-6 w-6 text-blue-600" />
        エグゼクティブサマリー
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">プロジェクト種別</p>
              <p className="text-lg font-bold text-gray-900">{projectType}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">予算効率</p>
              <p className="text-lg font-bold text-gray-900">
                {budget < 10000 ? '最適' : budget < 30000 ? '良好' : '高予算'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <User className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">スキルマッチ</p>
              <p className="text-lg font-bold text-gray-900">{experienceLevel}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              risk.color === 'red' ? 'bg-red-100' : 
              risk.color === 'yellow' ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              <AlertTriangle className={`h-5 w-5 ${
                risk.color === 'red' ? 'text-red-600' : 
                risk.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
              }`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">リスクレベル</p>
              <p className={`text-lg font-bold ${
                risk.color === 'red' ? 'text-red-600' : 
                risk.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {risk.level}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-100">
        <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          プロジェクト概要
        </h5>
        <p className="text-gray-700 text-sm leading-relaxed">
          {duration}ヶ月間で{projectType}を開発。月額予算{budget.toLocaleString()}円で、
          {experienceLevel}レベルの開発者に最適化された技術スタックを提案。
          リスクレベルは{risk.level}で、適切な計画により成功確率が高いプロジェクトです。
        </p>
      </div>
    </div>
  );
};

export default ExecutiveSummary;