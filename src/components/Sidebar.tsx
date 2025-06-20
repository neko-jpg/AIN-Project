import React from 'react';
// [修正点] Sparkles アイコンをインポートします
import { Bot, Send, Sparkles } from 'lucide-react';

interface SidebarProps {
  formData: {
    purpose: string;
    projectType: string;
    budget: number;
    experienceLevel: string;
    weeklyHours: string;
  };
  // [修正点1] onFormChangeの型をより厳密にします
  onFormChange: (field: keyof SidebarProps['formData'], value: string | number) => void;
  onSubmit: () => void;
  // [修正点2] onQuickGenerateをpropsとして受け取る定義を追加します
  // これにより、先ほどのTypeScriptエラーが解消されます。
  onQuickGenerate: () => void;
  isLoading: boolean;
}

// [修正点3] onQuickGenerate を引数として受け取ります
const Sidebar: React.FC<SidebarProps> = ({ formData, onFormChange, onSubmit, onQuickGenerate, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.purpose.trim()) return;
    onSubmit();
  };
  
  // クイック生成ボタンがクリックされたときの処理
  const handleQuickGenerateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // formの送信を防ぐ
    if (!formData.purpose.trim()) return;
    onQuickGenerate();
  }

  return (
    // h-screen だと親要素のレイアウトによっては画面全体を覆ってしまうため、h-full に変更して親に追従するようにします
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 overflow-y-auto"> {/* スクロールは内側の要素に任せます */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bot className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AIN Navigator</h2>
            <p className="text-sm text-gray-500">Your AI Project Partner</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">
              プロジェクトの概要を教えてください
            </h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AIを使って実現したいことは何ですか？
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) => onFormChange('purpose', e.target.value)}
              placeholder="例：顧客データを分析して売上予測を行うシステムを作りたい"
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              プロジェクトの種類
            </label>
            <select
              value={formData.projectType}
              onChange={(e) => onFormChange('projectType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Webアプリケーション">Webアプリケーション</option>
              <option value="モバイルアプリケーション">モバイルアプリケーション</option>
              <option value="APIバックエンド">APIバックエンド</option>
              <option value="データ分析基盤">データ分析基盤</option>
              <option value="その他">その他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              月額予算（円）
            </label>
            <input
              type="number"
              value={formData.budget}
              // [修正点4] より安全な数値変換にします
              onChange={(e) => onFormChange('budget', Number(e.target.value) || 0)}
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
              あなたの開発経験レベル
            </label>
            <select
              value={formData.experienceLevel}
              onChange={(e) => onFormChange('experienceLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="初心者">初心者</option>
              <option value="中級者">中級者</option>
              <option value="上級者">上級者</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              週に使える開発時間
            </label>
            <select
              value={formData.weeklyHours}
              onChange={(e) => onFormChange('weeklyHours', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="〜5時間">〜5時間</option>
              <option value="5〜20時間">5〜20時間</option>
              <option value="20時間以上">20時間以上</option>
            </select>
          </div>
          
          {/* [修正点5] クイック生成ボタンを追加します */}
          <button
            type="button" // type="submit" ではないことに注意
            onClick={handleQuickGenerateClick}
            disabled={isLoading || !formData.purpose.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 px-4 rounded-md hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-all duration-200"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>{isLoading ? '生成中...' : 'クイック生成'}</span>
          </button>


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
            <span>{isLoading ? '分析中...' : '詳細プロンプトで実行'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;