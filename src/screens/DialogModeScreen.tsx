import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ArrowLeft, MessageCircle, Send, Sparkles, Brain, Lightbulb, Zap, Plus, Settings, Eye, Edit3, Copy, Check, Mic, MicOff, GripVertical, Trash2, FileText, Clock, TrendingUp, Target, AlertTriangle, User, Briefcase, ChevronDown, ChevronRight, Download as DownloadIcon, Menu, X, Bot, Layers, Maximize2, Minimize2, PanelLeftOpen, PanelRightOpen, PanelTopOpen } from 'lucide-react';
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

// textsオブジェクトをコンポーネントの外に移動
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
    promptPlaceholder: 'Your combined prompt will appear here. Edit as needed before sending to AI.',
    noPromptYet: 'No prompt generated yet. Use the prompt composer on the right to build your prompt.',
    sendToAI: 'Send to AI',
    toggleLeftPanel: 'Toggle Form Panel',
    toggleRightPanel: 'Toggle Prompt Panel',
    toggleBottomPanel: 'Toggle Result Panel',
    formPanel: 'Project Settings',
    promptPanel: 'Prompt Composer',
    editorPanel: 'Prompt Editor',
    resultPanel: 'AI Results'
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
    promptPlaceholder: '結合されたプロンプトがここに表示されます。必要に応じて編集してからAIに送信してください。',
    noPromptYet: 'まだプロンプトが生成されていません。右側のプロンプト構成ツールを使用してプロンプトを作成してください。',
    sendToAI: 'AIに送信',
    toggleLeftPanel: 'フォームパネル切り替え',
    toggleRightPanel: 'プロンプトパネル切り替え',
    toggleBottomPanel: '結果パネル切り替え',
    formPanel: 'プロジェクト設定',
    promptPanel: 'プロンプト構成',
    editorPanel: 'プロンプトエディター',
    resultPanel: 'AI結果'
  }
};

// ヘルパー関数をコンポーネント内に定義
const createAutoPromptBlocks = (formData: any, developmentTime: number): PromptBlock[] => [
  { id: 'purpose-block', content: `プロジェクト目的: ${formData.purpose}`, priority: 0, timestamp: new Date(), type: 'text' },
  { id: 'project-type-block', content: `プロジェクト種類: ${formData.projectType}`, priority: 1, timestamp: new Date(), type: 'text' },
  { id: 'budget-block', content: `月額予算: ${formData.budget}円`, priority: 2, timestamp: new Date(), type: 'text' },
  { id: 'experience-block', content: `開発経験レベル: ${formData.experienceLevel}`, priority: 3, timestamp: new Date(), type: 'text' },
  { id: 'time-block', content: `週間開発時間: ${formData.weeklyHours}、開発期間: ${developmentTime}ヶ月`, priority: 4, timestamp: new Date(), type: 'text' }
];

const DialogModeScreen: React.FC<DialogModeScreenProps> = ({ onBack, language }) => {
  // --- State Management ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<'desktop' | 'mobile'>('desktop');
  
  const [formData, setFormData] = useState({
    purpose: '',
    projectType: 'Webアプリケーション',
    budget: 10000,
    experienceLevel: '中級者',
    weeklyHours: '5〜20時間',
  });
  const [developmentTime, setDevelopmentTime] = useState(6);

  const [aiResult, setAiResult] = useState<string>('');
  const [promptBlocks, setPromptBlocks] = useState<PromptBlock[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // useMemoで翻訳テキストをメモ化
  const t = useMemo(() => texts[language], [language]);

  // --- Effects ---
  useEffect(() => {
    const checkScreenSize = () => {
      setLayoutMode(window.innerWidth >= 1024 ? 'desktop' : 'mobile');
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (aiResult) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiResult]);

  // --- Handlers ---
  const handleFormChange = useCallback((field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePromptFromComposer = useCallback((prompt: string) => {
    setCurrentPrompt(prompt);
  }, []);
  
  const executeApiCall = useCallback(async (apiFunction: () => Promise<{ suggestion: string }>) => {
    setIsLoading(true);
    setError(null);
    setIsBottomPanelOpen(true);
    try {
      const response = await apiFunction();
      setAiResult(response.suggestion);
    } catch (err) {
      console.error('API Request Error:', err);
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFormSubmit = useCallback(async () => {
    if (!formData.purpose.trim()) return;
    const payload = {
      purpose: formData.purpose,
      project_type: formData.projectType,
      budget: formData.budget,
      experience_level: formData.experienceLevel,
      weekly_hours: formData.weeklyHours,
      development_time: developmentTime,
      language
    };
    await executeApiCall(() => analyzeProject(payload));
  }, [formData, developmentTime, language, executeApiCall]);

  const handleQuickGenerate = useCallback(async () => {
    if (!formData.purpose.trim()) return;
    const autoBlocks = createAutoPromptBlocks(formData, developmentTime);
    setPromptBlocks(autoBlocks);
    const combinedPrompt = autoBlocks.map(block => block.content).join('\n\n');
    setCurrentPrompt(combinedPrompt);
    await executeApiCall(() => executeCustomPrompt(combinedPrompt, language));
  }, [formData, developmentTime, language, executeApiCall]);

  const handleExecutePrompt = useCallback(async () => {
    if (!currentPrompt.trim()) return;
    await executeApiCall(() => executeCustomPrompt(currentPrompt, language));
  }, [currentPrompt, language, executeApiCall]);


  // --- Render Logic ---
  if (layoutMode === 'mobile') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{t.back}</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-900">{t.title}</h1>
            </div>
            
            <div className="w-16" />
          </div>
        </header>

        {/* Mobile Content - Stacked Layout */}
        <div className="flex-1 overflow-y-auto">
          {/* Form Section */}
          <div className="bg-white border-b border-gray-200">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <PanelLeftOpen className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">{t.formPanel}</h3>
              </div>
              
              <div className="space-y-4">
                <DevelopmentTimeSlider
                  value={developmentTime}
                  onChange={setDevelopmentTime}
                  language={language}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AIを使って実現したいことは何ですか？
                  </label>
                  <textarea
                    value={formData.purpose}
                    onChange={(e) => handleFormChange('purpose', e.target.value)}
                    placeholder="例：顧客データを分析して売上予測を行うシステムを作りたい"
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      プロジェクト種類
                    </label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => handleFormChange('projectType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Webアプリケーション">Webアプリ</option>
                      <option value="モバイルアプリケーション">モバイルアプリ</option>
                      <option value="APIバックエンド">API</option>
                      <option value="データ分析基盤">データ分析</option>
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
                      onChange={(e) => handleFormChange('budget', Number(e.target.value) || 0)}
                      min="0"
                      max="100000"
                      step="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      経験レベル
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
                      週間時間
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

                <button
                  onClick={handleQuickGenerate}
                  disabled={isLoading || !formData.purpose.trim()}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isLoading ? '生成中...' : 'クイック生成'}
                </button>
              </div>
            </div>
          </div>

          {/* Prompt Composer Section */}
          <div className="bg-gray-50">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <PanelRightOpen className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">{t.promptPanel}</h3>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 max-h-96 overflow-hidden">
                <EnhancedPromptComposer
                  blocks={promptBlocks}
                  onBlocksChange={setPromptBlocks}
                  onSendToPrompt={handlePromptFromComposer}
                  language={language}
                  developmentTime={developmentTime}
                />
              </div>
            </div>
          </div>

          {/* Prompt Editor Section */}
          <div className="bg-white border-b border-gray-200">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{t.editorPanel}</h3>
                </div>
                <button
                  onClick={handleExecutePrompt}
                  disabled={isLoading || !currentPrompt.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isLoading ? t.generating : t.sendToAI}
                </button>
              </div>
              
              <textarea
                value={currentPrompt}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                placeholder={currentPrompt ? t.promptPlaceholder : t.noPromptYet}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
              />
            </div>
          </div>

          {/* Results Section */}
          {(aiResult || error) && (
            <div className="bg-white">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{t.resultPanel}</h3>
                </div>
                
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
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

                {aiResult && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900">{t.promptResult}</span>
                      <DownloadButton
                        content={aiResult}
                        filename="ai-result.md"
                        className="text-sm"
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </DownloadButton>
                    </div>
                    <div className="prose max-w-none text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {aiResult}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Form */}
      {isLeftPanelOpen && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PanelLeftOpen className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">{t.formPanel}</h3>
              </div>
              <button
                onClick={() => setIsLeftPanelOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <Sidebar
              formData={formData}
              onFormChange={handleFormChange}
              onSubmit={handleFormSubmit}
              onQuickGenerate={handleQuickGenerate}
              isLoading={isLoading}
            />
            
            <div className="p-4">
              <DevelopmentTimeSlider
                value={developmentTime}
                onChange={setDevelopmentTime}
                language={language}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
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
                <span>{t.back}</span>
              </button>
              
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t.title}</h1>
                <p className="text-sm text-gray-600">{t.subtitle}</p>
              </div>
            </div>

            {/* Panel Toggle Controls */}
            <div className="flex items-center gap-2">
              {!isLeftPanelOpen && (
                <button
                  onClick={() => setIsLeftPanelOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  title={t.toggleLeftPanel}
                >
                  <PanelLeftOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.formPanel}</span>
                </button>
              )}
              
              {!isRightPanelOpen && (
                <button
                  onClick={() => setIsRightPanelOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  title={t.toggleRightPanel}
                >
                  <PanelRightOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.promptPanel}</span>
                </button>
              )}
              
              <button
                onClick={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isBottomPanelOpen 
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                }`}
                title={t.toggleBottomPanel}
              >
                <PanelTopOpen className="h-4 w-4" />
                <span className="hidden sm:inline">{t.resultPanel}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Layout */}
        <div className="flex-1 flex">
          {/* Center - Prompt Editor */}
          <div className="flex-1 flex flex-col p-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{t.editorPanel}</h3>
                  </div>
                  <button
                    onClick={handleExecutePrompt}
                    disabled={isLoading || !currentPrompt.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
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
              <div className="p-6">
                <textarea
                  value={currentPrompt}
                  onChange={(e) => setCurrentPrompt(e.target.value)}
                  placeholder={currentPrompt ? t.promptPlaceholder : t.noPromptYet}
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
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

            <div ref={chatEndRef} />
          </div>

          {/* Right Panel - Prompt Composer */}
          {isRightPanelOpen && (
            <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PanelRightOpen className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{t.promptPanel}</h3>
                  </div>
                  <button
                    onClick={() => setIsRightPanelOpen(false)}
                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <EnhancedPromptComposer
                  blocks={promptBlocks}
                  onBlocksChange={setPromptBlocks}
                  onSendToPrompt={handlePromptFromComposer}
                  language={language}
                  developmentTime={developmentTime}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Panel - Results */}
        {isBottomPanelOpen && aiResult && (
          <div className="border-t border-gray-200 bg-white">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{t.resultPanel}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <DownloadButton
                    content={aiResult}
                    filename="ai-result.md"
                    className="text-sm"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    Download
                  </DownloadButton>
                  <button
                    onClick={() => setIsBottomPanelOpen(false)}
                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiResult}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DialogModeScreen;