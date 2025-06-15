import React from 'react';
import { Zap, DollarSign, Clock, HelpCircle, Shield, Lightbulb } from 'lucide-react';

interface QuickSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({ onSuggestionClick }) => {
  const suggestions = [
    {
      icon: <Zap className="h-4 w-4" />,
      label: '期間短縮のコツ',
      text: '開発期間を短くするにはどうすればいいですか？具体的な手法やツールを教えてください。',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: <DollarSign className="h-4 w-4" />,
      label: 'コスト最適化案',
      text: '予算をもう少し抑えたバージョンも提案してください。無料ツールの活用方法も含めて。',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Lightbulb className="h-4 w-4" />,
      label: '技術詳細',
      text: '提案された技術スタックについて、もっと詳しい実装方法や学習リソースを教えてください。',
      color: 'from-blue-500 to-purple-500'
    },
    {
      icon: <Shield className="h-4 w-4" />,
      label: 'リスク対策',
      text: 'このプロジェクトの主要なリスクと対策について詳しく教えてください。',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: 'スケジュール詳細',
      text: '各開発フェーズの具体的なタスクとマイルストーンを教えてください。',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: <HelpCircle className="h-4 w-4" />,
      label: '代替案',
      text: '他の技術選択肢やアプローチがあれば教えてください。メリット・デメリットも含めて。',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-700 mb-3">よくある質問（クリックで自動入力）</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className={`p-3 rounded-lg bg-gradient-to-r ${suggestion.color} text-white hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-left group`}
          >
            <div className="flex items-center gap-2 mb-1">
              {suggestion.icon}
              <span className="font-medium text-sm">{suggestion.label}</span>
            </div>
            <p className="text-xs opacity-90 group-hover:opacity-100 transition-opacity">
              クリックして質問
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickSuggestions;