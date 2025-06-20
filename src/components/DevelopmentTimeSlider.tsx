import React from 'react';
import { Clock, Calendar } from 'lucide-react';

interface DevelopmentTimeSliderProps {
  value: number;
  onChange: (value: number) => void;
  language: 'en' | 'ja';
}

const DevelopmentTimeSlider: React.FC<DevelopmentTimeSliderProps> = ({
  value,
  onChange,
  language
}) => {
  const texts = {
    en: {
      title: 'Development Time Investment',
      description: 'How much time do you want to invest in this project?',
      months: 'months',
      quick: 'Quick',
      standard: 'Standard',
      comprehensive: 'Comprehensive'
    },
    ja: {
      title: '開発時間の投資',
      description: 'このプロジェクトにどのくらいの時間を投資したいですか？',
      months: 'ヶ月',
      quick: 'クイック',
      standard: 'スタンダード',
      comprehensive: '包括的'
    }
  };

  const t = texts[language];

  const getTimeLabel = (months: number) => {
    if (months <= 3) return t.quick;
    if (months <= 8) return t.standard;
    return t.comprehensive;
  };

  const getTimeColor = (months: number) => {
    if (months <= 3) return 'text-green-600';
    if (months <= 8) return 'text-blue-600';
    return 'text-purple-600';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">{t.description}</p>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            {value} {t.months}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTimeColor(value)} bg-current bg-opacity-10`}>
            {getTimeLabel(value)}
          </span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min="1"
            max="18"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>1</span>
            <span>6</span>
            <span>12</span>
            <span>18</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>
            {language === 'en' 
              ? `Estimated completion: ${new Date(Date.now() + value * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`
              : `完了予定: ${new Date(Date.now() + value * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP')}`
            }
          </span>
        </div>
      </div>
      
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3B82F6, #8B5CF6);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3B82F6, #8B5CF6);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default DevelopmentTimeSlider;