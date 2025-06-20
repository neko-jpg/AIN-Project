import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MessageCircle, Send, Sparkles, Brain, Lightbulb, Zap, Plus, Settings, Eye, Edit3, Copy, Check, Mic, MicOff, GripVertical, Trash2, FileText, Clock, TrendingUp, Target, AlertTriangle, User, Briefcase, ChevronDown, ChevronRight, Download as DownloadIcon, Menu, X, Bot, Layers, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Components
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import SpeechBubble from '../components/SpeechBubble';
import InteractiveAvatar from '../components/InteractiveAvatar';
import QuickSuggestions from '../components/QuickSuggestions';
import ExpandableSection from '../components/ExpandableSection';
import DownloadButton from '../components/DownloadButton';
import ExecutiveSummary from '../components/ExecutiveSummary';
import BudgetBreakdownChart from '../components/BudgetBreakdownChart';
import TimelineChart from '../components/TimelineChart';
import DifficultyChart from '../components/DifficultyChart';
import MetricCard from '../components/MetricCard';
import ConversationHistory from '../components/ConversationHistory';
import DevelopmentTimeSlider from '../components/DevelopmentTimeSlider';
import EnhancedPromptComposer from '../components/EnhancedPromptComposer';
import PromptPreview from '../components/PromptPreview';
import ResizablePanel from '../components/ResizablePanel';

// Utils and types
import { analyzeProject, generateFullProposal, refineProposal, executeCustomPrompt } from '../utils/api';
import { extractDurationFromText, splitProposalIntoSections } from '../utils/textProcessing';
import { PromptBlock } from '../types';

interface DialogModeScreenProps {
  onBack: () => void;
  language: 'en' | 'ja';
}

interface ConversationItem {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const DialogModeScreen: React.FC<DialogModeScreenProps> = ({ onBack, language }) => {
  // Core state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'form' | 'prompt' | 'preview'>('form');
  
  // Form data
  const [formData, setFormData] = useState({
    purpose: '',
    projectType: 'Webアプリケーション',
    budget: 10000,
    experienceLevel: '中級者',
    weeklyHours: '5〜20時間',
  });
  const [developmentTime, setDevelopmentTime] = useState(6);

  // AI responses
  const [aiResult, setAiResult] = useState<string>('');
  
  // Prompt Engineering
  const [promptBlocks, setPromptBlocks] = useState<PromptBlock[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isPromptComposerOpen, setIsPromptComposerOpen] = useState(true);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);

  const texts = {
    en: {
      title: 'Dialog Mode',
      subtitle: 'AI Navigator with Advanced Prompt Engineering',
      back: 'Back',
      generating: 'Generating AI analysis...',
      error: 'Error occurred',
      tryAgain: 'Try Again',
      executePrompt: 'Execute Prompt',
      promptResult: 'AI Result',
      mobileViews: {
        form: 'Form',
        prompt: 'Prompt',
        preview: 'Preview'
      },
      promptPlaceholder: 'Your combined prompt will appear here. Edit as needed before sending to AI.',
      noPromptYet: 'No prompt generated yet. Use the prompt composer on the right to build your prompt.',
      sendToAI: 'Send to AI'
    },
    ja: {
      title: '対話モード',
      subtitle: '高度なプロンプトエンジニアリング対応AIナビゲーター',
      back: '戻る',
      generating: 'AI分析を生成中...',
      error: 'エラーが発生しました',
      tryAgain: '再試行',
      executePrompt: 'プロンプトを実行',
      promptResult: 'AI結果',
      mobileViews: {
        form: 'フォーム',
        prompt: 'プロンプト',
        preview: 'プレビュー'
      },
      promptPlaceholder: '結合されたプロンプトがここに表示されます。必要に応じて編集してからAIに送信してください。',
      noPromptYet: 'まだプロンプトが生成されていません。右側のプロンプト構成ツールを使用してプロンプトを作成してください。',
      sendToAI: 'AIに送信'
    }
  };

  const t = texts[language];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiResult]);

  // Handle form changes
  const handleFormChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle prompt from composer
  const handlePromptFromComposer = (prompt: string) => {
    setCurrentPrompt(prompt);
  };

  // Execute prompt
  const handleExecutePrompt = async () => {
    if (!currentPrompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await executeCustomPrompt(currentPrompt, language);
      setAiResult(response.suggestion);
    } catch (err) {
      console.error('API Request Error (Custom Prompt):', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden">
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">設定</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto">
              <Sidebar
                formData={formData}
                onFormChange={handleFormChange}
                onSubmit={() => {}} // No submit needed in new design
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Left Panel - Form */}
      <div className="hidden lg:block">
        <Sidebar
          formData={formData}
          onFormChange={handleFormChange}
          onSubmit={() => {}} // No submit needed in new design
          isLoading={isLoading}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">{t.back}</span>
              </button>
              
              <div className="lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
              
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t.title}</h1>
                <p className="text-sm text-gray-600 hidden sm:block">{t.subtitle}</p>
              </div>
            </div>

            {/* Mobile View Switcher */}
            <div className="flex lg:hidden bg-gray-100 rounded-lg p-1">
              {(['form', 'prompt', 'preview'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setMobileView(view)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    mobileView === view
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t.mobileViews[view]}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Desktop Layout */}
          <div className="hidden lg:flex flex-1">
            {/* Right Panel - Prompt Composer */}
            <ResizablePanel
              position="right"
              isCollapsed={!isPromptComposerOpen}
              onToggle={() => setIsPromptComposerOpen(!isPromptComposerOpen)}
              defaultWidth={400}
              minWidth={320}
              maxWidth={600}
            >
              <EnhancedPromptComposer
                blocks={promptBlocks}
                onBlocksChange={setPromptBlocks}
                onSendToPrompt={handlePromptFromComposer}
                language={language}
                developmentTime={developmentTime}
              />
            </ResizablePanel>

            {/* Center - Prompt Preview & Editor */}
            <div className="flex-1 flex flex-col p-6 space-y-6">
              {/* Development Time Slider */}
              <DevelopmentTimeSlider
                value={developmentTime}
                onChange={setDevelopmentTime}
                language={language}
              />

              {/* Prompt Editor */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">プロンプトエディター</h3>
                    </div>
                    <button
                      onClick={handleExecutePrompt}
                      disabled={isLoading || !currentPrompt.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {isLoading ? t.generating : t.sendToAI}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <textarea
                    value={currentPrompt}
                    onChange={(e) => setCurrentPrompt(e.target.value)}
                    placeholder={currentPrompt ? t.promptPlaceholder : t.noPromptYet}
                    className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
                  />
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-red-800 font-medium">{t.error}</p>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* AI Result */}
              {aiResult && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{t.promptResult}</h3>
                      </div>
                      <DownloadButton
                        content={aiResult}
                        filename="ai-result.md"
                        className="text-sm"
                      >
                        <DownloadIcon className="h-4 w-4" />
                        Download
                      </DownloadButton>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="prose max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {aiResult}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex-1 lg:hidden">
            {mobileView === 'form' && (
              <div className="p-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">プロジェクト設定</h3>
                  
                  {/* Development Time Slider */}
                  <div className="mb-6">
                    <DevelopmentTimeSlider
                      value={developmentTime}
                      onChange={setDevelopmentTime}
                      language={language}
                    />
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AIを使って実現したいことは何ですか？
                      </label>
                      <textarea
                        value={formData.purpose}
                        onChange={(e) => handleFormChange('purpose', e.target.value)}
                        placeholder="例：顧客データを分析して売上予測を行うシステムを作りたい"
                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        プロジェクトの種類
                      </label>
                      <select
                        value={formData.projectType}
                        onChange={(e) => handleFormChange('projectType', e.target.value)}
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
                        onChange={(e) => handleFormChange('budget', parseInt(e.target.value))}
                        min="0"
                        max="100000"
                        step="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        あなたの開発経験レベル
                      </label>
                      <select
                        value={formData.experienceLevel}
                        onChange={(e) => handleFormChange('experienceLevel', e.target.value)}
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
                        onChange={(e) => handleFormChange('weeklyHours', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="〜5時間">〜5時間</option>
                        <option value="5〜20時間">5〜20時間</option>
                        <option value="20時間以上">20時間以上</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {mobileView === 'prompt' && (
              <EnhancedPromptComposer
                blocks={promptBlocks}
                onBlocksChange={setPromptBlocks}
                onSendToPrompt={handlePromptFromComposer}
                language={language}
                developmentTime={developmentTime}
              />
            )}

            {mobileView === 'preview' && (
              <div className="p-4 space-y-4">
                {/* Prompt Editor */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Edit3 className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">プロンプトエディター</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <textarea
                      value={currentPrompt}
                      onChange={(e) => setCurrentPrompt(e.target.value)}
                      placeholder={currentPrompt ? t.promptPlaceholder : t.noPromptYet}
                      className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
                    />
                    <button
                      onClick={handleExecutePrompt}
                      disabled={isLoading || !currentPrompt.trim()}
                      className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {isLoading ? t.generating : t.sendToAI}
                    </button>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-red-800 font-medium">{t.error}</p>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                      </div>
                      <button
                        onClick={() => setError(null)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* AI Result */}
                {aiResult && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                          <h3 className="text-lg font-semibold text-gray-900">{t.promptResult}</h3>
                        </div>
                        <DownloadButton
                          content={aiResult}
                          filename="ai-result.md"
                          className="text-sm"
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </DownloadButton>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="prose max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {aiResult}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogModeScreen;