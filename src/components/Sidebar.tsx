import React from 'react';
import { Bot, Send, Sparkles, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  formData: {
    purpose: string;
    projectType: string;
    budget: number;
    experienceLevel: string;
    weeklyHours: string;
  };
  onFormChange: (field: string, value: string | number) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onQuickGenerate?: () => void; // 新しいプロップ
}

const Sidebar: React.FC<SidebarProps> = ({ 
  formData, 
  onFormChange, 
  onSubmit, 
  isLoading,
  onQuickGenerate 
}) => {
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.purpose.trim()) return;
    onSubmit();
  };

  const handleQuickGenerate = () => {
    if (!formData.purpose.trim()) return;
    if (onQuickGenerate) {
      onQuickGenerate();
    }
  };

  return (
    <div className="w-full bg-white h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bot className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('app.title')}</h2>
            <p className="text-sm text-gray-500">{t('app.subtitle')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.purpose')}
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) => onFormChange('purpose', e.target.value)}
              placeholder={t('form.purposePlaceholder')}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.projectType')}
            </label>
            <select
              value={formData.projectType}
              onChange={(e) => onFormChange('projectType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Webアプリケーション">{t('form.projectTypes.webApp')}</option>
              <option value="モバイルアプリケーション">{t('form.projectTypes.mobileApp')}</option>
              <option value="APIバックエンド">{t('form.projectTypes.apiBackend')}</option>
              <option value="データ分析基盤">{t('form.projectTypes.dataAnalysis')}</option>
              <option value="その他">{t('form.projectTypes.other')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.budget')}
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => onFormChange('budget', parseInt(e.target.value))}
              min="0"
              max="100000"
              step="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>¥0</span>
              <span>¥100,000</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.experienceLevel')}
            </label>
            <select
              value={formData.experienceLevel}
              onChange={(e) => onFormChange('experienceLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="初心者">{t('form.experienceLevels.beginner')}</option>
              <option value="中級者">{t('form.experienceLevels.intermediate')}</option>
              <option value="上級者">{t('form.experienceLevels.advanced')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.weeklyHours')}
            </label>
            <select
              value={formData.weeklyHours}
              onChange={(e) => onFormChange('weeklyHours', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="〜5時間">{t('form.weeklyHours.low')}</option>
              <option value="5〜20時間">{t('form.weeklyHours.medium')}</option>
              <option value="20時間以上">{t('form.weeklyHours.high')}</option>
            </select>
          </div>

          {/* クイック生成ボタン */}
          {onQuickGenerate && (
            <button
              type="button"
              onClick={handleQuickGenerate}
              disabled={isLoading || !formData.purpose.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-md hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors mb-3"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>{isLoading ? '生成中...' : 'クイック生成'}</span>
            </button>
          )}

          {/* 従来の送信ボタン */}
          <button
            type="submit"
            disabled={isLoading || !formData.purpose.trim()}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{isLoading ? t('loading.generating') : t('form.submit')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;