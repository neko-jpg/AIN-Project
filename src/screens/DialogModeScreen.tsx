import React, { useState, useEffect, useRef } from 'react';
import { Bot, FileText, Zap, Clock, TrendingUp, MessageCircle, ChevronDown, ChevronRight, Send, Download as DownloadIcon, Sparkles, Menu, X, ArrowLeft, Lightbulb, Target, Rocket, Star, Users, Code, Database, Shield, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { analyzeProject, generateFullProposal, refineProposal, UserPayload, ApiResponse, RefinementRequest, RefinementResponse } from '../utils/api';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { extractDurationFromText, splitProposalIntoSections, formatCurrency } from '../utils/textProcessing';

// Import existing components
import DownloadButton from '../components/DownloadButton';
import BudgetBreakdownChart from '../components/BudgetBreakdownChart';
import TimelineChart from '../components/TimelineChart';
import InteractiveAvatar from '../components/InteractiveAvatar';
import QuickSuggestions from '../components/QuickSuggestions';
import ExecutiveSummary from '../components/ExecutiveSummary';
import LoadingSpinner from '../components/LoadingSpinner';
import SpeechBubble from '../components/SpeechBubble';

// Sidebar component
interface SidebarProps {
    formData: { purpose: string; projectType: string; budget: number; experienceLevel: string; weeklyHours: string; };
    onFormChange: (field: string, value: string | number) => void;
    onSubmit: () => void;
    isLoading: boolean;
    isOpen: boolean;
    onClose: () => void;
    language: 'en' | 'ja';
}

const Sidebar: React.FC<SidebarProps> = ({ formData, onFormChange, onSubmit, isLoading, isOpen, onClose, language }) => {
    const texts = {
        en: {
            settings: 'Settings',
            projectOverview: 'Tell us about your project',
            purposeLabel: 'What do you want to achieve with AI?',
            purposePlaceholder: 'e.g., Create a system to analyze customer data and predict sales',
            projectTypeLabel: 'Project Type',
            budgetLabel: 'Monthly Budget (USD)',
            experienceLevelLabel: 'Your Development Experience Level',
            weeklyHoursLabel: 'Weekly Development Time Available',
            submitButton: 'Get Optimal Tech Stack Proposal',
            submitting: 'Analyzing...',
            projectTypes: {
                'Webアプリケーション': 'Web Application',
                'モバイルアプリケーション': 'Mobile Application',
                'APIバックエンド': 'API Backend',
                'データ分析基盤': 'Data Analytics Platform',
                'その他': 'Other'
            },
            experienceLevels: {
                '初心者': 'Beginner',
                '中級者': 'Intermediate',
                '上級者': 'Advanced'
            },
            weeklyHoursOptions: {
                '〜5時間': '~5 hours',
                '5〜20時間': '5-20 hours',
                '20時間以上': '20+ hours'
            }
        },
        ja: {
            settings: '設定',
            projectOverview: 'プロジェクトの概要を教えてください',
            purposeLabel: 'AIを使って実現したいことは何ですか？',
            purposePlaceholder: '例：顧客データを分析して売上予測を行うシステムを作りたい',
            projectTypeLabel: 'プロジェクトの種類',
            budgetLabel: '月額予算（円）',
            experienceLevelLabel: 'あなたの開発経験レベル',
            weeklyHoursLabel: '週に使える開発時間',
            submitButton: '最適な技術スタックを提案してもらう',
            submitting: '分析中...',
            projectTypes: {
                'Webアプリケーション': 'Webアプリケーション',
                'モバイルアプリケーション': 'モバイルアプリケーション',
                'APIバックエンド': 'APIバックエンド',
                'データ分析基盤': 'データ分析基盤',
                'その他': 'その他'
            },
            experienceLevels: {
                '初心者': '初心者',
                '中級者': '中級者',
                '上級者': '上級者'
            },
            weeklyHoursOptions: {
                '〜5時間': '〜5時間',
                '5〜20時間': '5〜20時間',
                '20時間以上': '20時間以上'
            }
        }
    };

    const t = texts[language];

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(); };
    return (
        <>
          {/* Mobile overlay */}
          {isOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={onClose}
            />
          )}
          
          {/* Sidebar */}
          <div className={`
            fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
            w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto
            transform transition-transform duration-300 ease-in-out lg:transform-none
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="p-4 lg:p-6">
              {/* Mobile close button */}
              <div className="flex justify-between items-center mb-4 lg:hidden">
                <h2 className="text-lg font-semibold text-gray-900">{t.settings}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                <div><h3 className="text-sm lg:text-base font-medium text-gray-900 mb-3 lg:mb-4">{t.projectOverview}</h3></div>
                <div>
                    <label htmlFor="purpose" className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">{t.purposeLabel}</label>
                    <textarea 
                      id="purpose" 
                      value={formData.purpose} 
                      onChange={(e) => onFormChange('purpose', e.target.value)} 
                      placeholder={t.purposePlaceholder}
                      className="w-full h-24 lg:h-32 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                      required 
                    />
                </div>
                <div>
                    <label htmlFor="projectType" className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">{t.projectTypeLabel}</label>
                    <select 
                      id="projectType" 
                      value={formData.projectType} 
                      onChange={(e) => onFormChange('projectType', e.target.value)} 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="Webアプリケーション">{t.projectTypes['Webアプリケーション']}</option> 
                        <option value="モバイルアプリケーション">{t.projectTypes['モバイルアプリケーション']}</option> 
                        <option value="APIバックエンド">{t.projectTypes['APIバックエンド']}</option> 
                        <option value="データ分析基盤">{t.projectTypes['データ分析基盤']}</option> 
                        <option value="その他">{t.projectTypes['その他']}</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="budget" className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">{t.budgetLabel}</label>
                    <input 
                      type="number" 
                      id="budget" 
                      value={formData.budget} 
                      onChange={(e) => onFormChange('budget', parseInt(e.target.value))} 
                      min="0" 
                      max="100000" 
                      step="1000" 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{language === 'en' ? '$0' : '¥0'}</span>
                      <span>{language === 'en' ? '$100,000' : '¥100,000'}</span>
                    </div>
                </div>
                <div>
                    <label htmlFor="experienceLevel" className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">{t.experienceLevelLabel}</label>
                    <select 
                      id="experienceLevel" 
                      value={formData.experienceLevel} 
                      onChange={(e) => onFormChange('experienceLevel', e.target.value)} 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="初心者">{t.experienceLevels['初心者']}</option> 
                        <option value="中級者">{t.experienceLevels['中級者']}</option> 
                        <option value="上級者">{t.experienceLevels['上級者']}</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="weeklyHours" className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">{t.weeklyHoursLabel}</label>
                    <select 
                      id="weeklyHours" 
                      value={formData.weeklyHours} 
                      onChange={(e) => onFormChange('weeklyHours', e.target.value)} 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="〜5時間">{t.weeklyHoursOptions['〜5時間']}</option> 
                        <option value="5〜20時間">{t.weeklyHoursOptions['5〜20時間']}</option> 
                        <option value="20時間以上">{t.weeklyHoursOptions['20時間以上']}</option>
                    </select>
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading || !formData.purpose.trim()} 
                  className="w-full bg-blue-600 text-white py-2 lg:py-2.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors text-sm lg:text-base"
                >
                    {isLoading ? (<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>) : (<Send className="h-4 w-4" />)}
                    <span className="hidden sm:inline">{isLoading ? t.submitting : t.submitButton}</span>
                    <span className="sm:hidden">{isLoading ? t.submitting : (language === 'en' ? 'Get Proposal' : '提案してもらう')}</span>
                </button>
            </form>
            </div>
        </div>
        </>
    );
};

// MetricCard component
const MetricCard: React.FC<{ title: string; value: string | number; unit?: string; icon?: React.ReactNode; color?: 'blue' | 'green' | 'orange' | 'purple'; }> = ({ title, value, unit = '', icon, color = 'blue' }) => {
  const colorClasses = { blue: 'bg-blue-50 border-blue-200 text-blue-700', green: 'bg-green-50 border-green-200 text-green-700', orange: 'bg-orange-50 border-orange-200 text-orange-700', purple: 'bg-purple-50 border-purple-200 text-purple-700' };
  return (
    <div className={`p-3 lg:p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs lg:text-sm font-medium opacity-70 truncate">{title}</p>
          <p className="text-lg lg:text-2xl font-bold mt-1 break-words">
            {value}
            {unit && <span className="text-sm lg:text-base font-normal ml-1">{unit}</span>}
          </p>
        </div>
        {icon && <div className="opacity-70 ml-2 flex-shrink-0">{icon}</div>}
      </div>
    </div>
  );
};

// ExpandableSection component
const ExpandableSection: React.FC<{ title: string; children: React.ReactNode; defaultExpanded?: boolean; }> = ({ title, children, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="w-full px-3 lg:px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center gap-2 text-left font-medium text-gray-900 transition-colors text-sm lg:text-base"
      >
        {isExpanded ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />} 
        <span className="truncate">{title}</span>
      </button>
      {isExpanded && (
        <div className="p-3 lg:p-4 bg-white">
          <div className="prose prose-sm lg:prose prose-blue max-w-none break-words overflow-wrap-anywhere">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {typeof children === 'string' ? children : ''}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

// DifficultyChart component
const DifficultyChart: React.FC<{ userLevel: string; projectComplexity?: number; language: 'en' | 'ja'; }> = ({ userLevel, projectComplexity = 2, language }) => {
  const levelToNumber = { '初心者': 1, '中級者': 2, '上級者': 3, 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
  const userLevelNum = levelToNumber[userLevel as keyof typeof levelToNumber] || 2;
  
  const texts = {
    en: {
      yourLevel: 'Your Level',
      projectDifficulty: 'Project Difficulty'
    },
    ja: {
      yourLevel: 'あなたのレベル',
      projectDifficulty: 'プロジェクト難易度'
    }
  };

  const t = texts[language];
  
  const bars = [{ label: t.yourLevel, value: userLevelNum, color: 'bg-blue-500' }, { label: t.projectDifficulty, value: projectComplexity, color: 'bg-orange-500' }];
  return (
    <div className="space-y-3">
      {bars.map((bar, index) => (
        <div key={index}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs lg:text-sm font-medium text-gray-700">{bar.label}</span>
            <span className="text-xs lg:text-sm text-gray-500">{bar.value}/3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`h-2 rounded-full ${bar.color} transition-all duration-300`} style={{ width: `${(bar.value / 3) * 100}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Feature Card Component for Welcome Screen
const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; color: string; }> = ({ icon, title, description, color }) => (
  <div className={`p-4 rounded-xl bg-gradient-to-br ${color} text-white transform hover:scale-105 transition-all duration-200`}>
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <h4 className="font-semibold text-sm">{title}</h4>
    </div>
    <p className="text-xs opacity-90">{description}</p>
  </div>
);

// Conversation item type for chat history (user/ai turns)
type ConversationItem = {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// ConversationHistory component
const ConversationHistory: React.FC<{ history: ConversationItem[] }> = ({ history }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (history.length === 0) return null;
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="w-full px-3 lg:px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center gap-2 text-left font-medium text-gray-900 transition-colors text-sm lg:text-base"
      >
        {isExpanded ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />} 
        <span className="truncate">Conversation History ({history.length} messages)</span>
      </button>
      {isExpanded && (
        <div className="p-3 lg:p-4 bg-white space-y-4">
          {history.map((item, index) => (
            <div key={index} className={`flex gap-2 lg:gap-4 ${item.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {item.type === 'ai' && (
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                  </div>
                </div>
              )}
              <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                item.type === 'user' 
                  ? 'bg-blue-600 text-white ml-auto' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <div className="text-sm break-words">
                  {item.content}
                </div>
                <div className={`text-xs mt-1 ${item.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {item.timestamp.toLocaleTimeString()}
                </div>
              </div>
              {item.type === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">U</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface DialogModeScreenProps {
  onBack: () => void;
  language: 'en' | 'ja';
}

const DialogModeScreen: React.FC<DialogModeScreenProps> = ({ onBack, language }) => {
  const texts = {
    en: {
      dialogMode: 'Dialog Mode',
      subtitle: 'Create proposals through AI conversation 🤖',
      poweredBy: 'Powered by Advanced AI',
      back: 'Back',
      menu: 'Menu',
      aiProposal: 'AI Proposal',
      loadingInitial: 'AIN is designing the optimal tech stack for you...🤖',
      loadingFull: 'Generating comprehensive proposal...🤖 This may take a few minutes.',
      generateProposal: 'Create Comprehensive Proposal with This Suggestion',
      generating: 'Generating...',
      proposalComplete: 'Comprehensive Proposal Complete!',
      adjustProposal: 'Adjust Proposal (AI Advisor)',
      adjustDescription: 'Please feel free to request modifications or ask questions about the proposal content.',
      remainingAdjustments: 'Remaining adjustments',
      executionLimitReached: 'Execution limit reached.',
      conversationHistory: 'Conversation History',
      difficultyChart: 'Difficulty Chart',
      monthlyBudget: 'Monthly Budget Estimate',
      developmentPeriod: 'Development Period Estimate',
      developmentDifficulty: 'Development Difficulty',
      months: 'months',
      requestAdjustment: 'Request Modification/Question',
      requesting: 'Sending request...',
      quickSuggestions: 'Quick Questions (Click to auto-fill)',
      welcomeTitle: 'Start Your AI Project Journey',
      welcomeSubtitle: 'Choose how you\'d like to begin your project planning',
      traditionalApproach: 'Traditional Approach',
      traditionalDescription: 'Fill out a structured form to get AI recommendations',
      startTraditional: 'Start with Form',
      promptEngineering: 'Prompt Engineering',
      promptDescription: 'Build custom AI prompts with advanced composition tools',
      startPrompt: 'Open Prompt Composer',
      examplePrompts: 'Example Prompts',
      examples: [
        'I want to create an AI-powered e-commerce platform',
        'Help me build a mobile app for fitness tracking',
        'Design a data analytics dashboard for my business',
        'Create a chatbot for customer service automation'
      ],
      features: {
        smartAnalysis: 'Smart Analysis',
        smartAnalysisDesc: 'AI analyzes your requirements and suggests optimal solutions',
        realTimeChat: 'Real-time Chat',
        realTimeChatDesc: 'Interactive conversation with AI for refined proposals',
        comprehensiveReports: 'Comprehensive Reports',
        comprehensiveReportsDesc: 'Detailed project plans with timelines and budgets',
        expertGuidance: 'Expert Guidance',
        expertGuidanceDesc: 'Professional advice tailored to your experience level'
      },
      getStarted: 'Get Started',
      learnMore: 'Learn More'
    },
    ja: {
      dialogMode: '対話モード',
      subtitle: 'AIと対話しながら企画書を作成 🤖',
      poweredBy: 'Powered by Advanced AI',
      back: '戻る',
      menu: 'メニュー',
      aiProposal: 'AINからの提案',
      loadingInitial: 'AINがあなたのための技術スタックを設計しています...🤖',
      loadingFull: '本格企画書を生成中です...🤖 これは数分かかる場合があります。',
      generateProposal: 'この提案で本格的な企画書を作成する',
      generating: '生成中...',
      proposalComplete: '本格企画書が完成しました！',
      adjustProposal: '企画書を調整する（AIアドバイザー）',
      adjustDescription: '企画書の内容について修正や質問がありましたら、お気軽にお申し付けください。',
      remainingAdjustments: '残り修正回数',
      executionLimitReached: '実行可能上限に達しました。',
      conversationHistory: '会話履歴',
      difficultyChart: '難易度チャート',
      monthlyBudget: '月額予算目安',
      developmentPeriod: '開発期間目安',
      developmentDifficulty: '開発難易度',
      months: 'ヶ月',
      requestAdjustment: '修正・質問を依頼する',
      requesting: '依頼を送信中...',
      quickSuggestions: 'よくある質問（クリックで自動入力）',
      welcomeTitle: 'AIプロジェクトの旅を始めよう',
      welcomeSubtitle: 'プロジェクト計画の開始方法を選択してください',
      traditionalApproach: '従来のアプローチ',
      traditionalDescription: '構造化されたフォームに入力してAI推奨事項を取得',
      startTraditional: 'フォームで開始',
      promptEngineering: 'プロンプトエンジニアリング',
      promptDescription: '高度な構成ツールでカスタムAIプロンプトを構築',
      startPrompt: 'プロンプトコンポーザーを開く',
      examplePrompts: '例文プロンプト',
      examples: [
        'AI搭載のEコマースプラットフォームを作りたい',
        'フィットネス追跡用のモバイルアプリを構築したい',
        'ビジネス用のデータ分析ダッシュボードを設計したい',
        'カスタマーサービス自動化用のチャットボットを作成したい'
      ],
      features: {
        smartAnalysis: 'スマート分析',
        smartAnalysisDesc: 'AIがあなたの要件を分析し、最適なソリューションを提案',
        realTimeChat: 'リアルタイムチャット',
        realTimeChatDesc: 'AIとの対話的な会話で洗練された提案を作成',
        comprehensiveReports: '包括的なレポート',
        comprehensiveReportsDesc: 'タイムラインと予算を含む詳細なプロジェクト計画',
        expertGuidance: 'エキスパートガイダンス',
        expertGuidanceDesc: 'あなたの経験レベルに合わせたプロフェッショナルなアドバイス'
      },
      getStarted: '始める',
      learnMore: '詳細を見る'
    }
  };

  const t = texts[language];

  const [formData, setFormData] = useState({
    purpose: '',
    projectType: 'Webアプリケーション',
    budget: 5000,
    experienceLevel: '初心者',
    weeklyHours: '〜5時間',
  });
  const [refinementText, setRefinementText] = useState('');
  const [state, setState] = useState({
    initialSuggestion: '',
    fullProposal: '',
    conversationHistory: [] as ConversationItem[],
    userPayload: null as UserPayload | null,
    refineCount: 0,
    isLoadingInitial: false,
    isLoadingFull: false,
    isLoadingRefinement: false,
    error: '',
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isRecording, startRecording, stopRecording, error } = useVoiceRecording();
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.conversationHistory, state.isLoadingRefinement]);

  // Avatar state logic
  let avatarState: 'idle' | 'thinking' | 'happy' = 'idle';
  if (state.isLoadingInitial || state.isLoadingFull || state.isLoadingRefinement) {
    avatarState = 'thinking';
  } else if (state.fullProposal && !state.isLoadingFull && !state.isLoadingRefinement) {
    avatarState = 'happy';
  }

  // Original Dialog Mode Functions
  const addToConversation = (type: 'user' | 'ai', content: string) => {
    setState(prev => ({
      ...prev,
      conversationHistory: [
        ...prev.conversationHistory,
        { type, content, timestamp: new Date() }
      ]
    }));
  };

  const handleFormChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitInitial = async () => {
    if (!formData.purpose.trim()) {
      setState(prev => ({ ...prev, error: language === 'en' ? 'Please fill in "What do you want to achieve with AI?" field.' : '「AIを使って実現したいことは何ですか？」の項目を入力してください。' }));
      return;
    }
    setState(prev => ({ ...prev, isLoadingInitial: true, error: '', initialSuggestion: '', fullProposal: '', conversationHistory: [], refineCount: 0 }));
    setSidebarOpen(false); // Close sidebar on mobile after submit
    const payload: UserPayload = { purpose: formData.purpose, project_type: formData.projectType, budget: formData.budget, experience_level: formData.experienceLevel, weekly_hours: formData.weeklyHours, language };
    try {
      const response = await analyzeProject(payload);
      setState(prev => ({ ...prev, initialSuggestion: response.suggestion, userPayload: payload, isLoadingInitial: false }));
      addToConversation('ai', response.suggestion);
    } catch (error: any) {
      console.error("API Request Error (Initial):", error);
      setState(prev => ({ ...prev, error: language === 'en' ? `Error occurred while getting initial proposal: ${error.message || 'Please check server communication.'}` : `初期提案の取得中にエラーが発生しました: ${error.message || 'サーバーとの通信を確認してください。'}`, isLoadingInitial: false }));
    }
  };

  const handleGenerateFullProposal = async () => {
    if (!state.userPayload) { 
      setState(prev => ({ ...prev, error: language === 'en' ? 'User information is insufficient. Please start over.' : 'ユーザー情報が不足しています。最初からやり直してください。', isLoadingFull: false }));
      return;
    }
    setState(prev => ({ ...prev, isLoadingFull: true, error: '' }));
    try {
      const response = await generateFullProposal(state.userPayload); 
      setState(prev => ({ ...prev, fullProposal: response.suggestion, isLoadingFull: false }));
      addToConversation('ai', language === 'en' ? 'Comprehensive proposal generated!' : '本格企画書を生成しました！'); // Confirmation message for conversation history
    } catch (error: any) {
      console.error("API Request Error (Full Proposal):", error);
      setState(prev => ({ ...prev, error: language === 'en' ? `Error occurred during proposal generation: ${error.message || 'Server error'}` : `企画書生成中にエラーが発生しました: ${error.message || 'サーバーエラー'}`, isLoadingFull: false }));
    }
  };

  // Handle example prompt click
  const handleExampleClick = (example: string) => {
    setFormData(prev => ({ ...prev, purpose: example }));
    setSidebarOpen(true);
  };

  const handleRefinement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementText.trim()) {
      setState(prev => ({ ...prev, error: language === 'en' ? 'Please enter modification instructions.' : '修正指示を入力してください。' }));
      return;
    }
    if (!state.userPayload || !state.fullProposal) { 
      setState(prev => ({ ...prev, error: language === 'en' ? 'Information required for modification is insufficient.' : '修正に必要な情報が不足しています。', isLoadingRefinement: false }));
      return;
    }
    if (state.refineCount >= 3) {
      setState(prev => ({ ...prev, error: language === 'en' ? 'Maximum number of modifications (3) reached for free version.' : '無料版での修正回数の上限（3回）に達しました。' }));
      return;
    }

    setState(prev => ({ ...prev, isLoadingRefinement: true, error: '' }));
    const currentRequest = refinementText; 
    setRefinementText(''); 

    try {
      const requestPayload: RefinementRequest = { 
        user_payload: state.userPayload,
        current_proposal: state.fullProposal,
        refinement_request: currentRequest,
      };
      const response = await refineProposal(requestPayload); 

      if (response.type === 'proposal') {
        setState(prev => ({ 
          ...prev, 
          fullProposal: response.content, 
          conversationHistory: [
            ...prev.conversationHistory,
            { type: 'user', content: currentRequest, timestamp: new Date() },
            { type: 'ai', content: response.content, timestamp: new Date() }
          ], 
          refineCount: prev.refineCount + 1, 
          isLoadingRefinement: false 
        }));
      } else { 
        setState(prev => ({ 
          ...prev, 
          conversationHistory: [
            ...prev.conversationHistory,
            { type: 'user', content: currentRequest, timestamp: new Date() },
            { type: 'ai', content: response.content, timestamp: new Date() }
          ], 
          refineCount: prev.refineCount + 1, 
          isLoadingRefinement: false 
        }));
      }
    } catch (error: any) {
      console.error("API Request Error (Refinement):", error);
      setState(prev => ({ 
        ...prev, 
        conversationHistory: [
          ...prev.conversationHistory,
          { type: 'user', content: currentRequest, timestamp: new Date() },
          { type: 'ai', content: language === 'en' ? `We apologize, but an error occurred while processing the request. (${error.message || 'Unknown error'})` : `大変申し訳ありません、リクエストの処理中にエラーが発生しました。(${error.message || '不明なエラー'})`, timestamp: new Date() }
        ],
        refineCount: prev.refineCount + 1, 
        isLoadingRefinement: false 
      }));
    }
  };

  const handleQuickSuggestionClick = (suggestion: string) => {
    setRefinementText(suggestion);
  };

  const estimatedDuration = state.fullProposal ? extractDurationFromText(state.fullProposal) : 0;
  const proposalSections = state.fullProposal ? splitProposalIntoSections(state.fullProposal) : [];

  // Show welcome screen if no conversation has started
  const showWelcomeScreen = !state.initialSuggestion && !state.isLoadingInitial && !state.error;

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-sans">
      <Sidebar
        formData={formData}
        onFormChange={handleFormChange}
        onSubmit={handleSubmitInitial}
        isLoading={state.isLoadingInitial}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        language={language}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t.dialogMode}
          </h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        <div className="max-w-6xl mx-auto p-3 lg:p-6">
          {/* Header - Hidden on mobile */}
          <div className="text-center mb-6 lg:mb-8 hidden lg:block">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>{t.back}</span>
              </button>
              <div className="flex items-center justify-center gap-4 lg:gap-6">
                <InteractiveAvatar state={avatarState} />
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {t.dialogMode}
                  </h1>
                  <p className="text-gray-600 text-sm lg:text-lg mt-1 lg:mt-2">{t.subtitle}</p>
                  <div className="flex items-center justify-center gap-2 mt-1 lg:mt-2">
                    <Sparkles className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-500" />
                    <span className="text-xs lg:text-sm text-gray-500">{t.poweredBy}</span>
                  </div>
                </div>
              </div>
              <div className="w-24" /> {/* Spacer for centering */}
            </div>
          </div>

          {/* Welcome Screen */}
          {showWelcomeScreen && (
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8 lg:mb-12">
                <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4">{t.welcomeTitle}</h2>
                <p className="text-lg text-gray-600 mb-8">{t.welcomeSubtitle}</p>
                
                {/* Feature Highlights */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <FeatureCard
                    icon={<Brain className="h-5 w-5" />}
                    title={t.features.smartAnalysis}
                    description={t.features.smartAnalysisDesc}
                    color="from-blue-500 to-blue-600"
                  />
                  <FeatureCard
                    icon={<MessageCircle className="h-5 w-5" />}
                    title={t.features.realTimeChat}
                    description={t.features.realTimeChatDesc}
                    color="from-green-500 to-green-600"
                  />
                  <FeatureCard
                    icon={<FileText className="h-5 w-5" />}
                    title={t.features.comprehensiveReports}
                    description={t.features.comprehensiveReportsDesc}
                    color="from-purple-500 to-purple-600"
                  />
                  <FeatureCard
                    icon={<Users className="h-5 w-5" />}
                    title={t.features.expertGuidance}
                    description={t.features.expertGuidanceDesc}
                    color="from-orange-500 to-orange-600"
                  />
                </div>
                
                {/* Approach Selection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
                  {/* Traditional Approach */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <FileText className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{t.traditionalApproach}</h3>
                      <p className="text-gray-600 mb-6">{t.traditionalDescription}</p>
                      
                      {/* Benefits */}
                      <div className="grid grid-cols-2 gap-2 mb-6 text-xs">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Target className="h-3 w-3" />
                          <span>{language === 'en' ? 'Structured' : '構造化'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Zap className="h-3 w-3" />
                          <span>{language === 'en' ? 'Fast' : '高速'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Shield className="h-3 w-3" />
                          <span>{language === 'en' ? 'Reliable' : '信頼性'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Star className="h-3 w-3" />
                          <span>{language === 'en' ? 'Proven' : '実証済み'}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setSidebarOpen(true)}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        {t.startTraditional}
                      </button>
                    </div>
                  </div>

                  {/* Prompt Engineering */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden">
                    {/* Coming Soon Badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {language === 'en' ? 'COMING SOON' : '近日公開'}
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Code className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{t.promptEngineering}</h3>
                      <p className="text-gray-600 mb-6">{t.promptDescription}</p>
                      
                      {/* Benefits */}
                      <div className="grid grid-cols-2 gap-2 mb-6 text-xs">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Lightbulb className="h-3 w-3" />
                          <span>{language === 'en' ? 'Creative' : '創造的'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Rocket className="h-3 w-3" />
                          <span>{language === 'en' ? 'Advanced' : '高度'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Database className="h-3 w-3" />
                          <span>{language === 'en' ? 'Flexible' : '柔軟'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Users className="h-3 w-3" />
                          <span>{language === 'en' ? 'Custom' : 'カスタム'}</span>
                        </div>
                      </div>
                      
                      <button
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium opacity-50 cursor-not-allowed"
                        disabled
                      >
                        {t.startPrompt}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Example Prompts */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 lg:p-8 border border-gray-200">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{t.examplePrompts}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {t.examples.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(example)}
                        className="text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md transition-all duration-200 text-sm lg:text-base group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-medium text-lg group-hover:scale-110 transition-transform duration-200">💡</span>
                          <span className="flex-1">{example}</span>
                          <ArrowLeft className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200 transform rotate-180" />
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      {language === 'en' ? 'Click any example to get started quickly' : 'どの例でもクリックして素早く開始'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Existing conversation content */}
          {!showWelcomeScreen && (
            <div className="space-y-6 lg:space-y-8">
              <h2 className="text-xl lg:text-3xl font-bold text-gray-900 text-center">{t.aiProposal}</h2>

              {/* Loading State */}
              {state.isLoadingInitial && (
                <LoadingSpinner message={t.loadingInitial} />
              )}

              {/* Initial Suggestion */}
              {state.initialSuggestion && !state.isLoadingInitial && (
                <div className="flex gap-2 lg:gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <Bot className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                    </div>
                  </div>
                  <SpeechBubble className="flex-1" type="ai">
                    <div className="prose prose-sm lg:prose prose-blue max-w-none break-words overflow-wrap-anywhere">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: state.initialSuggestion.replace(/\n/g, '<br>')
                        }}
                      />
                    </div>
                    
                    {!state.fullProposal && (
                      <div className="mt-4 lg:mt-6 pt-3 lg:pt-4 border-t border-gray-200">
                        <button
                          onClick={handleGenerateFullProposal}
                          disabled={state.isLoadingFull}
                          className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 lg:px-8 py-3 lg:py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 lg:gap-3 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm lg:text-base"
                        >
                          {state.isLoadingFull ? (
                            <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-2 border-white border-t-transparent"></div>
                          ) : (
                            <FileText className="h-4 w-4 lg:h-5 lg:w-5" />
                          )}
                          <span className="hidden sm:inline">{state.isLoadingFull ? t.generating : t.generateProposal}</span>
                          <span className="sm:hidden">{state.isLoadingFull ? t.generating : (language === 'en' ? 'Create Proposal' : '企画書を作成')}</span>
                        </button>
                      </div>
                    )}
                  </SpeechBubble>
                </div>
              )}

              {/* Full Proposal Loading */}
              {state.isLoadingFull && (
                <LoadingSpinner message={t.loadingFull} />
              )}

              {/* Full Proposal */}
              {state.fullProposal && !state.isLoadingFull && (
                <div className="space-y-6 lg:space-y-8">
                  <div className="flex gap-2 lg:gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <FileText className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                      </div>
                    </div>
                    <SpeechBubble className="flex-1" type="ai">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 gap-3">
                        <h3 className="text-lg lg:text-2xl font-bold text-gray-900">
                          {t.proposalComplete}
                        </h3>
                        <DownloadButton
                          content={state.fullProposal}
                          filename={`AIN企画書_${new Date().toISOString().split('T')[0]}.md`}
                          className="text-xs lg:text-sm"
                        />
                      </div>
                      
                      {/* Executive Summary */}
                      <ExecutiveSummary
                        budget={formData.budget}
                        duration={estimatedDuration}
                        experienceLevel={formData.experienceLevel}
                        projectType={formData.projectType}
                      />

                      {/* Charts Section */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
                        <BudgetBreakdownChart budget={formData.budget} />
                        <TimelineChart duration={estimatedDuration} />
                      </div>

                      {/* Project Summary Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
                        <MetricCard
                          title={t.monthlyBudget}
                          value={formatCurrency(formData.budget)}
                          icon={<TrendingUp className="h-4 w-4 lg:h-5 lg:w-5" />}
                          color="green"
                        />
                        <MetricCard
                          title={t.developmentPeriod}
                          value={estimatedDuration}
                          unit={t.months}
                          icon={<Clock className="h-4 w-4 lg:h-5 lg:w-5" />}
                          color="blue"
                        />
                        <MetricCard
                          title={t.developmentDifficulty}
                          value={formData.experienceLevel}
                          icon={<Zap className="h-4 w-4 lg:h-5 lg:w-5" />}
                          color="orange"
                        />
                      </div>

                      {/* Difficulty Chart */}
                      <div className="mb-4 lg:mb-6 p-4 lg:p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3 lg:mb-4 text-base lg:text-lg">{t.difficultyChart}</h4>
                        <DifficultyChart userLevel={formData.experienceLevel} language={language} />
                      </div>

                      {/* Expandable Sections */}
                      <div className="space-y-2 lg:space-y-3">
                        {proposalSections.map((section, index) => (
                          section.content.trim() && ( // 空のセクションは表示しない
                            <ExpandableSection
                              key={section.title + '-' + index} // keyをタイトルとインデックスでユニークに
                              title={section.title}
                              defaultExpanded={index === 0 || section.title.includes("タスクリスト")} // タスクリストをデフォルトで開く
                            >
                              {section.content}
                            </ExpandableSection>
                          )
                        ))}
                      </div>
                    </SpeechBubble>
                  </div>

                  {/* Conversation History */}
                  {state.conversationHistory.length > 0 && ( // 履歴がある場合のみ表示
                    <ConversationHistory history={state.conversationHistory} />
                  )}

                  {/* Refinement Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 lg:p-6 shadow-sm">
                    <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                      <MessageCircle className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
                      <h3 className="text-lg lg:text-xl font-bold text-blue-900">
                        {t.adjustProposal}
                      </h3>
                    </div>
                    
                    {/* Loading Spinner during refinement */}
                    {state.isLoadingRefinement && (<div className="my-4"><LoadingSpinner message={language === 'en' ? 'AIN is thinking of a response...🤖' : 'AINが応答を考えています...🤖'} /></div>)}

                    {/* Refinement Form */}
                    {state.refineCount < 3 ? (
                      <>
                        <p className="text-blue-700 mb-3 lg:mb-4 text-sm lg:text-base">
                          {t.adjustDescription}
                          <span className="font-medium">（{t.remainingAdjustments}: {3 - state.refineCount}/3{language === 'en' ? ' times' : '回'}）</span>
                        </p>
                        
                        {/* Quick Suggestions */}
                        <QuickSuggestions onSuggestionClick={handleQuickSuggestionClick} />
                        
                        <form onSubmit={handleRefinement} className="space-y-3 lg:space-y-4">
                          <textarea 
                            value={refinementText} 
                            onChange={(e) => setRefinementText(e.target.value)} 
                            placeholder={language === 'en' ? 
                              "e.g., Please suggest a version with a lower budget\nHow can I shorten the development period?\nPlease tell me more about this risk mitigation" :
                              "例：予算をもう少し抑えたバージョンも提案してください&#10;開発期間を短くするにはどうすればいいですか？&#10;このリスク対策についてもっと詳しく教えてください"
                            }
                            className="w-full h-24 lg:h-32 px-3 lg:px-4 py-2 lg:py-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-500 break-words overflow-wrap-anywhere text-sm lg:text-base" 
                            required 
                          />
                          <button 
                            type="submit" 
                            disabled={state.isLoadingRefinement || !refinementText.trim()} 
                            className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 lg:px-8 py-2.5 lg:py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 lg:gap-3 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm lg:text-base"
                          >
                            {state.isLoadingRefinement ? (<div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-2 border-white border-t-transparent"></div>) : (<MessageCircle className="h-4 w-4 lg:h-5 lg:w-5" />)}
                            <span className="hidden sm:inline">{state.isLoadingRefinement ? t.requesting : t.requestAdjustment}</span>
                            <span className="sm:hidden">{state.isLoadingRefinement ? t.requesting : (language === 'en' ? 'Request' : '依頼する')}</span>
                          </button>
                        </form>
                      </>
                    ) : (
                      <p className="text-red-600 font-bold text-center p-3 lg:p-4 bg-red-50 rounded-lg text-sm lg:text-base">{t.executionLimitReached}</p>
                    )}

                    <div ref={chatEndRef} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="mx-4 mt-4 p-3 lg:p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <p className="text-red-700 text-sm lg:text-base">{state.error}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DialogModeScreen;