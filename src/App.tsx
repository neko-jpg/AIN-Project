import React, { useState } from 'react';
import { Bot, FileText, Zap, Clock, TrendingUp, MessageCircle, Download, Sparkles } from 'lucide-react';
import Sidebar from './components/Sidebar';
import SpeechBubble from './components/SpeechBubble';
import MetricCard from './components/MetricCard';
import ExpandableSection from './components/ExpandableSection';
import DifficultyChart from './components/DifficultyChart';
import LoadingSpinner from './components/LoadingSpinner';
import ExecutiveSummary from './components/ExecutiveSummary';
import BudgetBreakdownChart from './components/BudgetBreakdownChart';
import TimelineChart from './components/TimelineChart';
import InteractiveAvatar from './components/InteractiveAvatar';
import QuickSuggestions from './components/QuickSuggestions';
import ConversationHistory from './components/ConversationHistory';
import { analyzeProject, generateFullProposal, refineProposal, UserPayload } from './utils/api';
import { extractDurationFromText, splitProposalIntoSections, formatCurrency, downloadMarkdown } from './utils/textProcessing';

interface ConversationItem {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AppState {
  initialSuggestion: string;
  fullProposal: string;
  userPayload: UserPayload | null;
  refineCount: number;
  isLoadingInitial: boolean;
  isLoadingFull: boolean;
  isLoadingRefinement: boolean;
  error: string;
  conversationHistory: ConversationItem[];
}

function App() {
  const [formData, setFormData] = useState({
    purpose: '',
    projectType: 'Webアプリケーション',
    budget: 5000,
    experienceLevel: '初心者',
    weeklyHours: '〜5時間',
  });

  const [refinementText, setRefinementText] = useState('');
  
  const [state, setState] = useState<AppState>({
    initialSuggestion: '',
    fullProposal: '',
    userPayload: null,
    refineCount: 0,
    isLoadingInitial: false,
    isLoadingFull: false,
    isLoadingRefinement: false,
    error: '',
    conversationHistory: [],
  });

  const handleFormChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    setState(prev => ({ ...prev, isLoadingInitial: true, error: '' }));
    
    const payload: UserPayload = {
      purpose: formData.purpose,
      project_type: formData.projectType,
      budget: formData.budget,
      experience_level: formData.experienceLevel,
      weekly_hours: formData.weeklyHours,
    };

    try {
      const response = await analyzeProject(payload);
      setState(prev => ({
        ...prev,
        initialSuggestion: response.suggestion,
        userPayload: payload,
        isLoadingInitial: false,
      }));
      addToConversation('ai', response.suggestion);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: '通信エラーが発生しました。FastAPIサーバーが起動していることを確認してください。',
        isLoadingInitial: false,
      }));
    }
  };

  const handleGenerateFullProposal = async () => {
    if (!state.userPayload) return;

    setState(prev => ({ ...prev, isLoadingFull: true, error: '' }));

    try {
      const response = await generateFullProposal(state.userPayload);
      setState(prev => ({
        ...prev,
        fullProposal: response.suggestion,
        isLoadingFull: false,
      }));
      addToConversation('ai', '本格企画書を生成しました！');
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: '企画書生成中にエラーが発生しました。',
        isLoadingFull: false,
      }));
    }
  };

  const handleRefinement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementText.trim() || !state.userPayload || !state.fullProposal) return;
    if (state.refineCount >= 3) {
      setState(prev => ({ ...prev, error: '修正回数の上限（3回）に達しました。' }));
      return;
    }

    setState(prev => ({ ...prev, isLoadingRefinement: true, error: '' }));
    addToConversation('user', refinementText);

    try {
      const response = await refineProposal({
        user_payload: state.userPayload,
        current_proposal: state.fullProposal,
        refinement_request: refinementText,
      });

      setState(prev => ({
        ...prev,
        fullProposal: response.suggestion,
        refineCount: prev.refineCount + 1,
        isLoadingRefinement: false,
      }));
      addToConversation('ai', response.suggestion);
      setRefinementText('');
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: '修正リクエスト中にエラーが発生しました。',
        isLoadingRefinement: false,
      }));
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setRefinementText(suggestion);
  };

  const handleDownloadProposal = () => {
    if (state.fullProposal) {
      downloadMarkdown(state.fullProposal, 'AIN_企画書.md');
    }
  };

  const estimatedDuration = state.fullProposal ? extractDurationFromText(state.fullProposal) : 0;
  const proposalSections = state.fullProposal ? splitProposalIntoSections(state.fullProposal) : [];

  const avatarState = state.isLoadingInitial || state.isLoadingFull || state.isLoadingRefinement 
    ? 'thinking' 
    : state.fullProposal 
    ? 'happy' 
    : 'idle';

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
                        {/* [修正点] isLoading状態に応じて、要素の構造を変えずにアイコンとテキストの中身だけを切り替える */}
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
                        <Download className="h-4 w-4" />
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
                        value="レベル分析"
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
                        section.content.trim() && (
                          <ExpandableSection
                            key={index}
                            title={section.title}
                            defaultExpanded={index === 0}
                          >
                            <div className="prose prose-blue max-w-none break-words overflow-wrap-anywhere">
                              <div 
                                dangerouslySetInnerHTML={{ 
                                  __html: section.content.replace(/\n/g, '<br>') 
                                }} 
                              />
                            </div>
                          </ExpandableSection>
                        )
                      ))}
                    </div>
                  </SpeechBubble>
                </div>

                {/* Conversation History */}
                {state.conversationHistory.length > 2 && (
                  <ConversationHistory history={state.conversationHistory.slice(2)} />
                )}

                {/* Refinement Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-blue-900">
                      企画書を調整する（AIアドバイザー）
                    </h3>
                  </div>
                  
                  <p className="text-blue-700 mb-6 text-lg">
                    企画書の内容について修正や質問がありましたら、お気軽にお申し付けください。
                    <span className="font-semibold ml-2 px-3 py-1 bg-blue-100 rounded-full text-sm">
                      残り修正回数: {3 - state.refineCount}/3回
                    </span>
                  </p>

                  {/* Quick Suggestions */}
                  <QuickSuggestions onSuggestionClick={handleQuickSuggestion} />

                  {state.refineCount < 3 && (
                    <form onSubmit={handleRefinement} className="space-y-4">
                      <textarea
                        value={refinementText}
                        onChange={(e) => setRefinementText(e.target.value)}
                        placeholder="例：予算をもう少し抑えたバージョンも提案してください&#10;開発期間を短くするにはどうすればいいですか？&#10;このリスク対策についてもっと詳しく教えてください"
                        className="w-full h-32 px-4 py-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-500"
                        required
                      />
                      <button
                        type="submit"
                        disabled={state.isLoadingRefinement || !refinementText.trim()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        {/* [修正点] isLoading状態に応じて、要素の構造を変えずにアイコンとテキストの中身だけを切り替える */}
                        {state.isLoadingRefinement ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <MessageCircle className="h-5 w-5" />
                        )}
                        <span>{state.isLoadingRefinement ? '修正中...' : '修正・質問を依頼する'}</span>
                      </button>
                    </form>
                  )}

                  {state.isLoadingRefinement && (
                    <div className="mt-6">
                      <LoadingSpinner message="企画書を修正中です...🤖" />
                    </div>
                  )}
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
