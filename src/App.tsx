// src/App.tsx
// All components and utilities are integrated into this single file for simplicity in this hackathon.

import React, { useState, useEffect, useRef } from 'react';

// lucide-reactからのアイコンをインポート
import { Bot, FileText, Zap, Clock, TrendingUp, MessageCircle, ChevronDown, ChevronRight, Send, Download as DownloadIcon, Sparkles } from 'lucide-react'; 

// Markdownレンダリング用ライブラリをインポート
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // GitHub Flavored Markdown対応 (テーブル、チェックボックスリストなど)

// =================================================================
// Component Definitions & Utilities (全てこのファイルに統合 - エラー解消済み)
// =================================================================

// --- src/utils/api.ts の内容 ---
// FastAPIのPydanticモデルと完全に一致させるための型定義
export interface UserPayload {
  purpose: string;
  project_type: string;
  budget: number; 
  experience_level: string;
  weekly_hours: string; 
}

export interface ApiResponse {
  suggestion: string; // analyzeProject, generateFullProposalからの応答
}

// RefineRequest のキー名をFastAPIに合わせて修正
export interface RefinementRequest {
  user_payload: UserPayload;
  current_proposal: string; // FastAPIのoriginal_proposalに対応
  refinement_request: string; // FastAPIのrefinement_instructionに対応
}

// FastAPIのRefineResponseモデルに対応する型定義
export interface RefinementResponse {
  type: 'answer' | 'proposal' | 'rejection'; // FastAPIからの応答タイプ
  content: string; // 生成されたテキスト（企画書全体、回答、または拒否メッセージ）
}


// APIベースURLの定義 (環境変数から読み込み、なければローカル開発用URL)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// API呼び出し関数: 初期提案
export const analyzeProject = async (payload: UserPayload): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/analyze_purpose/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HTTP error! Status: ${response.status} - ${errorBody}`);
  }
  return response.json();
};

// API呼び出し関数: 本格企画書生成
// FastAPIのgenerate_full_proposalエンドポイントはUserPayloadを受け取る想定
export const generateFullProposal = async (payload: UserPayload): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/generate_full_proposal/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HTTP error! Status: ${response.status} - ${errorBody}`);
  }
  return response.json();
};

// API呼び出し関数: 企画書修正・質問
export const refineProposal = async (request: RefinementRequest): Promise<RefinementResponse> => {
  const response = await fetch(`${API_BASE_URL}/refine_proposal/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HTTP error! Status: ${response.status} - ${errorBody}`);
  }
  return response.json();
};


// --- src/utils/textProcessing.ts の内容 ---
// テキストから開発期間を抽出する関数
export const extractDurationFromText = (text: string): number => {
  const patterns = [
    /期間: (\d+)[-〜～]?(\d+)?[ヶカか]?月/, // "期間: 3-5ヶ月"
    /開発ロードマップと期間.*?(\d+)\s*ヶ月/s // "開発ロードマップと期間\n- 3ヶ月"
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
  }
  return 3; // デフォルト値
};

// 企画書をセクションに分割する関数
export const splitProposalIntoSections = (proposal: string): Array<{ title: string; content: string }> => {
  // ### で分割し、空のセクションを除外
  const sections = proposal.split(/###\s+/).filter(s => s.trim() !== ''); 
  if (sections.length === 0) {
    // もし###がない場合、全体を一つのセクションとして扱う
    return [{ title: '提案内容', content: proposal.trim() }];
  }

  return sections.map((sectionText) => {
    const lines = sectionText.trim().split('\n');
    const title = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();
    return { title, content };
  });
};

// 通貨をフォーマットする関数
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', minimumFractionDigits: 0 }).format(amount);
};

// Markdownファイルをダウンロードする関数
export const downloadMarkdown = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


// --- src/components/Sidebar.tsx の内容 ---
interface SidebarProps {
    formData: { purpose: string; projectType: string; budget: number; experienceLevel: string; weeklyHours: string; };
    onFormChange: (field: string, value: string | number) => void;
    onSubmit: () => void;
    isLoading: boolean;
}
const Sidebar: React.FC<SidebarProps> = ({ formData, onFormChange, onSubmit, isLoading }) => {
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(); };
    return (
        <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto flex-shrink-0 p-6"> {/* Padding added */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg"><Bot className="h-6 w-6 text-blue-600" /></div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">AIN Navigator</h2>
                    <p className="text-sm text-gray-500">Your AI Project Partner</p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div><h3 className="text-base font-medium text-gray-900 mb-4">プロジェクトの概要を教えてください</h3></div>
                <div>
                    <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">AIを使って実現したいことは何ですか？</label>
                    <textarea id="purpose" value={formData.purpose} onChange={(e) => onFormChange('purpose', e.target.value)} placeholder="例：顧客データを分析して売上予測を行うシステムを作りたい" className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" required />
                </div>
                <div>
                    <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">プロジェクトの種類</label>
                    <select id="projectType" value={formData.projectType} onChange={(e) => onFormChange('projectType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="Webアプリケーション">Webアプリケーション</option> <option value="モバイルアプリケーション">モバイルアプリケーション</option> <option value="APIバックエンド">APIバックエンド</option> <option value="データ分析基盤">データ分析基盤</option> <option value="その他">その他</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">月額予算（円）</label>
                    <input type="number" id="budget" value={formData.budget} onChange={(e) => onFormChange('budget', parseInt(e.target.value))} min="0" max="100000" step="1000" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1"><span>¥0</span><span>¥100,000</span></div>
                </div>
                <div>
                    <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-2">あなたの開発経験レベル</label>
                    <select id="experienceLevel" value={formData.experienceLevel} onChange={(e) => onFormChange('experienceLevel', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="初心者">初心者</option> <option value="中級者">中級者</option> <option value="上級者">上級者</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="weeklyHours" className="block text-sm font-medium text-gray-700 mb-2">週に使える開発時間</label>
                    <select id="weeklyHours" value={formData.weeklyHours} onChange={(e) => onFormChange('weeklyHours', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="〜5時間">〜5時間</option> <option value="5〜20時間">5〜20時間</option> <option value="20時間以上">20時間以上</option>
                    </select>
                </div>
                <button type="submit" disabled={isLoading || !formData.purpose.trim()} className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors">
                    {isLoading ? (<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>) : (<Send className="h-4 w-4" />)}
                    <span>{isLoading ? '分析中...' : '最適な技術スタックを提案してもらう'}</span>
                </button>
            </form>
        </div>
    );
};

// --- src/components/SpeechBubble.tsx の内容 ---
// typeプロパティを追加し、ユーザーとAIで吹き出しの色と位置を制御できるようにする
const SpeechBubble: React.FC<{ children: React.ReactNode; className?: string; type?: 'user' | 'ai'; }> = ({ children, className = '', type = 'ai' }) => {
    const isUser = type === 'user';
    const bubbleClasses = isUser 
        ? 'bg-blue-600 text-white rounded-xl rounded-br-none' 
        : 'bg-white border border-gray-200 rounded-xl rounded-bl-none';
    const pointerClasses = isUser 
        ? 'absolute -right-2 top-6 w-4 h-4 bg-blue-600 border-r border-t border-blue-600 transform rotate-45' 
        : 'absolute -left-2 top-6 w-4 h-4 bg-white border-l border-b border-gray-200 transform rotate-45';
    
    return (
        <div className={`relative ${className}`}>
            <div className={`p-6 shadow-sm relative ${bubbleClasses}`}>
                <div className={pointerClasses}></div>
                {children}
            </div>
        </div>
    );
};

// --- src/components/MetricCard.tsx の内容 ---
const MetricCard: React.FC<{ title: string; value: string | number; unit?: string; icon?: React.ReactNode; color?: 'blue' | 'green' | 'orange' | 'purple'; }> = ({ title, value, unit = '', icon, color = 'blue' }) => {
  const colorClasses = { blue: 'bg-blue-50 border-blue-200 text-blue-700', green: 'bg-green-50 border-green-200 text-green-700', orange: 'bg-orange-50 border-orange-200 text-orange-700', purple: 'bg-purple-50 border-purple-200 text-purple-700' };
  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}{unit && <span className="text-base font-normal ml-1">{unit}</span>}</p>
        </div>
        {icon && <div className="opacity-70">{icon}</div>}
      </div>
    </div>
  );
};

// --- src/components/ExpandableSection.tsx の内容 ---
const ExpandableSection: React.FC<{ title: string; children: React.ReactNode; defaultExpanded?: boolean; }> = ({ title, children, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center gap-2 text-left font-medium text-gray-900 transition-colors">
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />} {title}
      </button>
      {isExpanded && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
};

// --- src/components/DifficultyChart.tsx の内容 ---
const DifficultyChart: React.FC<{ userLevel: string; projectComplexity?: number; }> = ({ userLevel, projectComplexity = 2 }) => {
  const levelToNumber = { '初心者': 1, '中級者': 2, '上級者': 3 };
  const userLevelNum = levelToNumber[userLevel as keyof typeof levelToNumber] || 2;
  const bars = [{ label: 'あなたのレベル', value: userLevelNum, color: 'bg-blue-500' }, { label: 'プロジェクト難易度', value: projectComplexity, color: 'bg-orange-500' }];
  return (
    <div className="space-y-3">
      {bars.map((bar, index) => (
        <div key={index}>
          <div className="flex justify-between items-center mb-1"><span className="text-sm font-medium text-gray-700">{bar.label}</span><span className="text-sm text-gray-500">{bar.value}/3</span></div>
          <div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${bar.color} transition-all duration-300`} style={{ width: `${(bar.value / 3) * 100}%` }}></div></div>
        </div>
      ))}
    </div>
  );
};

// --- src/components/LoadingSpinner.tsx の内容 ---
const LoadingSpinner: React.FC<{ message: string; }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
    <p className="text-gray-600 text-center">{message}</p>
  </div>
);

// --- src/components/ExecutiveSummary.tsx の内容 ---
interface ExecutiveSummaryProps {
  budget: number;
  duration: number;
  experienceLevel: string;
  projectType: string;
}
const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ budget, duration, experienceLevel, projectType }) => (
  <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
      <Sparkles className="h-6 w-6 text-purple-500" /> エグゼクティブサマリー
    </h3>
    <p className="text-gray-700 mb-4">
      このプロジェクトは、<span className="font-semibold text-blue-600">{projectType}</span> として
      <span className="font-semibold text-green-600">{formatCurrency(budget)}/月</span> の予算内で、
      <span className="font-semibold text-purple-600">{experienceLevel}</span> レベルのスキルを持つ開発者が
      <span className="font-semibold text-orange-600">{duration}ヶ月</span> 程度で実現することを目指します。
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MetricCard title="プロジェクトタイプ" value={projectType} color="blue" />
      <MetricCard title="想定予算" value={formatCurrency(budget)} color="green" />
      <MetricCard title="推定期間" value={`${duration}ヶ月`} color="purple" />
      <MetricCard title="推奨スキル" value={experienceLevel} color="orange" />
    </div>
  </div>
);

// --- src/components/BudgetBreakdownChart.tsx の内容 ---
interface BudgetBreakdownChartProps {
  budget: number;
}
const BudgetBreakdownChart: React.FC<BudgetBreakdownChartProps> = ({ budget }) => {
  const data = [
    { name: 'AIモデル/API', value: budget * 0.4 },
    { name: 'クラウド/インフラ', value: budget * 0.3 },
    { name: 'その他ツール', value: budget * 0.2 },
    { name: '予備', value: budget * 0.1 },
  ];
  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 h-64">
      <h4 className="font-semibold text-gray-900 mb-3">予算内訳 (目安)</h4>
      {/* ここにrechartsなどのグラフコンポーネントを配置 */}
      <p className="text-gray-500 text-sm">グラフは実装予定</p>
    </div>
  );
};

// --- src/components/TimelineChart.tsx の内容 ---
interface TimelineChartProps {
  duration: number;
}
const TimelineChart: React.FC<TimelineChartProps> = ({ duration }) => {
  // ダミーデータ。実際は期間に応じて動的にフェーズを生成
  const phases = [
    { name: '企画・要件定義', duration: duration * 0.2 },
    { name: '環境構築・基盤開発', duration: duration * 0.3 },
    { name: 'コア機能実装', duration: duration * 0.3 },
    { name: 'テスト・デプロイ', duration: duration * 0.2 },
  ];
  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 h-64">
      <h4 className="font-semibold text-gray-900 mb-3">開発ロードマップ (目安)</h4>
      {/* ここにrechartsなどのグラフコンポーネントを配置 */}
      <p className="text-gray-500 text-sm">グラフは実装予定</p>
    </div>
  );
};

// --- src/components/InteractiveAvatar.tsx の内容 ---
interface InteractiveAvatarProps {
  state: 'idle' | 'thinking' | 'happy';
}
const InteractiveAvatar: React.FC<InteractiveAvatarProps> = ({ state }) => {
  const avatarSrc = {
    idle: 'https://placehold.co/150x150/EFEFEF/007BFF?text=AIN&font=sans',
    thinking: 'https://placehold.co/150x150/EFEFEF/007BFF?text=AIN🧠&font=sans', // 思考中の画像
    happy: 'https://placehold.co/150x150/EFEFEF/007BFF?text=AIN✨&font=sans', // 完了時の画像
  };
  const animationClass = state === 'thinking' ? 'animate-bounce' : ''; // 例: 思考中にバウンス
  return (
    <img src={avatarSrc[state]} alt="AIN Avatar" className={`w-24 h-24 rounded-full border-4 border-blue-200 shadow-md transition-all duration-300 ${animationClass}`} />
  );
};

// --- src/components/QuickSuggestions.tsx の内容 ---
interface QuickSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}
const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({ onSuggestionClick }) => {
  const suggestions = [
    '予算をもう少し抑えたバージョンも提案してください。',
    '開発期間を短くするにはどうすればいいですか？',
    'このリスク対策についてもっと詳しく教えてください。',
    '技術スタックのデータベースについて、他の選択肢はありますか？',
    'チーム開発向けの機能について提案してください。'
  ];
  return (
    <div className="mb-6">
      <h4 className="text-base font-semibold text-gray-900 mb-3">クイック提案</h4>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, index) => (
          <button key={index} onClick={() => onSuggestionClick(s)} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full hover:bg-blue-200 transition-colors duration-200">
            {s.split(' ')[0]}...
          </button>
        ))}
      </div>
    </div>
  );
};

// --- src/components/ConversationHistory.tsx の内容 ---
interface ConversationHistoryProps {
  history: ConversationItem[];
}
const ConversationHistory: React.FC<ConversationHistoryProps> = ({ history }) => {
  return (
    <div className="space-y-4 mb-4">
      {history.map((turn, index) => (
        <div key={index} className={`flex ${turn.type === 'user' ? 'justify-end' : 'justify-start'}`}>
          {turn.type === 'user' ? (
            <div className="inline-block bg-blue-600 text-white rounded-xl rounded-br-none p-3 max-w-lg shadow-md">
              <p>{turn.content}</p>
            </div>
          ) : (
            <div className="inline-block bg-white border border-gray-200 rounded-xl rounded-bl-none p-3 max-w-lg shadow-md">
              <ReactMarkdown className="prose prose-sm max-w-none" remarkPlugins={[remarkGfm]}>{turn.content}</ReactMarkdown>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// =================================================================
// Main App Component
// =================================================================

// Conversation item type for chat history (user/ai turns)
type ConversationItem = {
  type: 'user' | 'ai';
  content: string;
  timestamp?: Date;
};

// Conversation turn type for refinement (request/response)
type ConversationTurn = {
  request: string;
  response: string;
  type: 'answer' | 'proposal' | 'rejection';
};

interface AppState {
  initialSuggestion: string;
  fullProposal: string;
  conversationHistory: ConversationItem[];
  userPayload: UserPayload | null;
  refineCount: number;
  isLoadingInitial: boolean;
  isLoadingFull: boolean;
  isLoadingRefinement: boolean;
  error: string;
}

function App() {
  const [formData, setFormData] = useState({
    purpose: '', projectType: 'Webアプリケーション', budget: 5000, experienceLevel: '初心者', weeklyHours: '〜5時間',
  });
  const [refinementText, setRefinementText] = useState('');
  
  const [state, setState] = useState<AppState>({
    initialSuggestion: '',
    fullProposal: '',
    conversationHistory: [],
    userPayload: null,
    refineCount: 0,
    isLoadingInitial: false,
    isLoadingFull: false,
    isLoadingRefinement: false,
    error: '',
  });

  // avatarStateの定義
  let avatarState: 'idle' | 'thinking' | 'happy' = 'idle';
  if (state.isLoadingInitial || state.isLoadingFull || state.isLoadingRefinement) {
    avatarState = 'thinking';
  } else if (state.fullProposal && !state.isLoadingFull && !state.isLoadingRefinement) {
    avatarState = 'happy';
  }

  const chatEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.conversationHistory, state.isLoadingRefinement]);


  const handleFormChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addToConversation = (type: 'user' | 'ai', content: string) => {
    setState(prev => ({
      ...prev,
      conversationHistory: [
        ...prev.conversationHistory,
        { type, content, timestamp: new Date() }
      ]
    }));
  };

  const handleSubmitInitial = async () => {
    if (!formData.purpose.trim()) {
      setState(prev => ({ ...prev, error: '「AIを使って実現したいことは何ですか？」の項目を入力してください。' }));
      return;
    }
    setState(prev => ({ ...prev, isLoadingInitial: true, error: '', initialSuggestion: '', fullProposal: '', conversationHistory: [], refineCount: 0 }));
    const payload: UserPayload = { purpose: formData.purpose, project_type: formData.projectType, budget: formData.budget, experience_level: formData.experienceLevel, weekly_hours: formData.weeklyHours, };
    try {
      const response = await analyzeProject(payload);
      setState(prev => ({ ...prev, initialSuggestion: response.suggestion, userPayload: payload, isLoadingInitial: false }));
      addToConversation('ai', response.suggestion); // Initial suggestion goes into conversation history
    } catch (error: any) {
      console.error("API Request Error (Initial):", error);
      setState(prev => ({ ...prev, error: `初期提案の取得中にエラーが発生しました: ${error.message || 'サーバーとの通信を確認してください。'}`, isLoadingInitial: false }));
    }
  };

  const handleGenerateFullProposal = async () => {
    if (!state.userPayload) { 
      setState(prev => ({ ...prev, error: 'ユーザー情報が不足しています。最初からやり直してください。', isLoadingFull: false }));
      return;
    }
    setState(prev => ({ ...prev, isLoadingFull: true, error: '' }));
    try {
      const response = await generateFullProposal(state.userPayload); 
      setState(prev => ({ ...prev, fullProposal: response.suggestion, isLoadingFull: false }));
      addToConversation('ai', '本格企画書を生成しました！'); // Confirmation message for conversation history
    } catch (error: any) {
      console.error("API Request Error (Full Proposal):", error);
      setState(prev => ({ ...prev, error: `企画書生成中にエラーが発生しました: ${error.message || 'サーバーエラー'}`, isLoadingFull: false }));
    }
  };

  const handleRefinement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementText.trim()) {
      setState(prev => ({ ...prev, error: '修正指示を入力してください。' }));
      return;
    }
    if (!state.userPayload || !state.fullProposal) { 
      setState(prev => ({ ...prev, error: '修正に必要な情報が不足しています。', isLoadingRefinement: false }));
      return;
    }
    if (state.refineCount >= 3) {
      setState(prev => ({ ...prev, error: '無料版での修正回数の上限（3回）に達しました。' }));
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

      const newTurn: ConversationTurn = { 
        request: currentRequest,
        response: response.content,
        type: response.type
      };

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
          { type: 'ai', content: `大変申し訳ありません、リクエストの処理中にエラーが発生しました。(${error.message || '不明なエラー'})`, timestamp: new Date() }
        ],
        refineCount: prev.refineCount + 1, 
        isLoadingRefinement: false 
      }));
    }
  };

  const estimatedDuration = state.fullProposal ? extractDurationFromText(state.fullProposal) : 0;
  const proposalSections = state.fullProposal ? splitProposalIntoSections(state.fullProposal) : [];

  function handleDownloadProposal(event: React.MouseEvent<HTMLButtonElement>): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-sans">
      <Sidebar
        formData={formData}
        onFormChange={handleFormChange}
        onSubmit={handleSubmitInitial}
        isLoading={state.isLoadingInitial}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-6 mb-6">
              <InteractiveAvatar state={avatarState} />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Navigator (AIN)
                </h1>
                <p className="text-gray-600 text-lg mt-2">Your AI Project Partner 🤖</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-500">Powered by Advanced AI</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {state.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
              <p className="text-red-700">{state.error}</p>
            </div>
          )}

          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center">AINからの提案</h2>

            {/* Loading State */}
            {state.isLoadingInitial && (
              <LoadingSpinner message="AINがあなたのための技術スタックを設計しています...🤖" />
            )}

            {/* Initial Suggestion */}
            {state.initialSuggestion && !state.isLoadingInitial && (
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
  　 　 　 　 </div>
    　 　 　 　 <SpeechBubble className="flex-1" type="ai">
    　 　 　 　 　 <div className="prose prose-blue max-w-none break-words">
    　 　 　 　 　 　 <div
    　 　 　 　 　 　 　 dangerouslySetInnerHTML={{
    　 　 　 　 　 　 　   __html: state.initialSuggestion.replace(/\n/g, '<br>')
    　 　 　 　 　 　 　 }}
    　 　 　 　 　 　 />
    　 　 　 　 　 </div>
    　 　 　 　 　 
    　 　 　 　 　 {!state.fullProposal && (
    　 　 　 　 　 　 <div className="mt-6 pt-4 border-t border-gray-200">
    　 　 　 　 　 　   <button
    　 　 　 　 　 　 　   onClick={handleGenerateFullProposal}
    　 　 　 　 　 　 　   disabled={state.isLoadingFull}
    　 　 　 　 　 　 　   className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
    　 　 　 　 　 　 　 >
    　 　 　 　 　 　     {state.isLoadingFull ? (
    　 　 　 　 　 　       <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
    　 　 　 　 　 　     ) : (
    　 　 　 　 　 　       <FileText className="h-5 w-5" />
    　 　 　 　 　 　     )}
    　 　 　 　 　 　     <span>{state.isLoadingFull ? '企画書生成中...' : 'この提案で本格的な企画書を作成する'}</span>
    　 　 　 　 　 　   </button>
    　 　 　 　 　 　 </div>
    　 　 　 　 　 )}
    　 　 　 　 </SpeechBubble>
  　 　 　 　 </div>
  　 　 　 　 )}

    　 　 　   {/* Full Proposal Loading */}
    　 　 　   {state.isLoadingFull && (
    　 　 　     <LoadingSpinner message="本格企画書を生成中です...🤖 これは数分かかる場合があります。" />
    　 　 　   )}

    　 　 　   {/* Full Proposal */}
    　 　 　   {state.fullProposal && !state.isLoadingFull && (
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <FileText className="h-6 w-6 text-white" />
      　 　 　 　 　 </div>
    　 　 　 　 </div>
    　 　 　 　 <SpeechBubble className="flex-1" type="ai">
    　 　 　       <div className="flex items-center justify-between mb-6">
    　 　 　         <h3 className="text-2xl font-bold text-gray-900">
    　 　 　           本格企画書が完成しました！
    　 　 　         </h3>
    　 　 　         <button
    　 　 　           onClick={handleDownloadProposal}
    　 　 　           className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
    　 　 　         >
    　 　 　           <DownloadIcon className="h-4 w-4" /> {/* DownloadIconを使用 */}
    　 　 　           ダウンロード
    　 　 　         </button>
    　 　 　       </div>
    　 　 　       
    　 　 　       {/* Executive Summary */}
    　 　 　       <ExecutiveSummary
    　 　 　         budget={formData.budget}
  　 　 　           duration={estimatedDuration}
  　 　 　           experienceLevel={formData.experienceLevel}
  　 　 　           projectType={formData.projectType}
  　 　 　           />

    　 　 　       {/* Charts Section */}
    　 　 　       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    　 　 　         <BudgetBreakdownChart budget={formData.budget} />
    　 　 　         <TimelineChart duration={estimatedDuration} />
    　 　 　       </div>

    　 　 　       {/* Project Summary Metrics */}
    　 　 　       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    　 　 　         <MetricCard
    　 　 　           title="月額予算目安"
    　 　 　           value={formatCurrency(formData.budget)}
    　 　 　           icon={<TrendingUp className="h-5 w-5" />}
    　 　 　           color="green"
    　 　 　           />
    　 　 　         <MetricCard
    　 　 　           title="開発期間目安"
    　 　 　           value={estimatedDuration}
    　 　 　           unit="ヶ月"
    　 　 　           icon={<Clock className="h-5 w-5" />}
    　 　 　           color="blue"
    　 　 　           />
    　 　 　         <MetricCard
    　 　 　           title="開発難易度"
    　 　 　           value={formData.experienceLevel}
    　 　 　           icon={<Zap className="h-5 w-5" />}
    　 　 　           color="orange"
    　 　 　           />
    　 　 　       </div>

    　 　 　       {/* Difficulty Chart */}
    　 　 　       <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
    　 　 　         <h4 className="font-semibold text-gray-900 mb-4 text-lg">難易度チャート</h4>
    　 　 　         <DifficultyChart userLevel={formData.experienceLevel} />
    　 　 　       </div>

    　 　 　       {/* Expandable Sections */}
    　 　 　       <div className="space-y-3">
    　 　 　         {proposalSections.map((section, index) => (
    　 　 　             section.content.trim() && ( // 空のセクションは表示しない
    　 　 　               <ExpandableSection
    　 　 　                 key={section.title + '-' + index} // keyをタイトルとインデックスでユニークに
    　 　 　                 title={section.title}
    　 　 　                 defaultExpanded={index === 0 || section.title.includes("タスクリスト")} // タスクリストをデフォルトで開く
    　 　 　               >
    　 　 　                 {/* ★ ReactMarkdownを使用し、生のMarkdownテキストをレンダリング ★ */}
    　 　 　                 <div className="prose prose-blue max-w-none break-words overflow-wrap-anywhere">
    　 　 　                   <ReactMarkdown remarkPlugins={[remarkGfm]}>
    　 　 　                     {section.content}
    　 　 　                   </ReactMarkdown>
    　 　 　                 </div>
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
    　 　 　   <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 shadow-sm">
    　 　 　     <div className="flex items-center gap-3 mb-4">
    　 　 　       <MessageCircle className="h-6 w-6 text-blue-600" />
    　 　 　       <h3 className="text-xl font-bold text-blue-900">
    　 　 　         企画書を調整する（AIアドバイザー）
    　 　 　       </h3>
    　 　 　     </div>
    　 　 　     
    　 　 　     {/* Loading Spinner during refinement */}
    　 　 　     {state.isLoadingRefinement && (<div className="my-4"><LoadingSpinner message="AINが応答を考えています...🤖" /></div>)}

    　 　 　     {/* Refinement Form */}
    　 　 　     {state.refineCount < 3 ? (
    　 　 　       <>
    　 　 　         <p className="text-blue-700 mb-4">
    　 　 　           企画書の内容について修正や質問がありましたら、お気軽にお申し付けください。
    　 　 　           <span className="font-medium">（残り修正回数: {3 - state.refineCount}/3回）</span>
    　 　 　         </p>
    　 　 　         <form onSubmit={handleRefinement} className="space-y-4">
    　 　 　           <textarea value={refinementText} onChange={(e) => setRefinementText(e.target.value)} placeholder="例：予算をもう少し抑えたバージョンも提案してください&#10;開発期間を短くするにはどうすればいいですか？&#10;このリスク対策についてもっと詳しく教えてください" className="w-full h-32 px-4 py-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-500" required />
    　 　 　           <button type="submit" disabled={state.isLoadingRefinement || !refinementText.trim()} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
    　 　 　             {state.isLoadingRefinement ? (<div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>) : (<MessageCircle className="h-5 w-5" />)}
    　 　 　             <span>{state.isLoadingRefinement ? '依頼を送信中...' : '修正・質問を依頼する'}</span>
    　 　 　           </button>
    　 　 　         </form>
    　 　 　       </>
    　 　 　     ) : (
    　 　 　       <p className="text-red-600 font-bold text-center p-4 bg-red-50 rounded-lg">実行可能上限に達しました。</p>
    　 　 　     )}

    　 　 　       <div ref={chatEndRef} />
    　 　 　     </div>
  　 　 　 　 </div>
  　 　 　     )}
    　 　 　   </div>
    　 　 　 </div>
  　 　 　 </main>
  　 　 </div>
    );
}

export default App;