import React, { useState } from 'react';
import { Bot, FileText, Zap, Clock, TrendingUp, MessageCircle } from 'lucide-react';
import Sidebar from './components/Sidebar';
import SpeechBubble from './components/SpeechBubble';
import MetricCard from './components/MetricCard';
import ExpandableSection from './components/ExpandableSection';
import DifficultyChart from './components/DifficultyChart';
import LoadingSpinner from './components/LoadingSpinner';
import { analyzeProject, generateFullProposal, refineProposal, UserPayload } from './utils/api';
import { extractDurationFromText, splitProposalIntoSections, formatCurrency } from './utils/textProcessing';

interface AppState {
  initialSuggestion: string;
  fullProposal: string;
  userPayload: UserPayload | null;
  refineCount: number;
  isLoadingInitial: boolean;
  isLoadingFull: boolean;
  isLoadingRefinement: boolean;
  error: string;
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
  });

  const handleFormChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      setRefinementText('');
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: '修正リクエスト中にエラーが発生しました。',
        isLoadingRefinement: false,
      }));
    }
  };

  const estimatedDuration = state.fullProposal ? extractDurationFromText(state.fullProposal) : 0;
  const proposalSections = state.fullProposal ? splitProposalIntoSections(state.fullProposal) : [];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        formData={formData}
        onFormChange={handleFormChange}
        onSubmit={handleSubmitInitial}
        isLoading={state.isLoadingInitial}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img
                src="https://placehold.co/150x150/EFEFEF/007BFF?text=AIN&font=sans"
                alt="AIN Avatar"
                className="w-20 h-20 rounded-full border-4 border-blue-100"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Navigator (AIN)</h1>
                <p className="text-gray-600">Your AI Project Partner 🤖</p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {state.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{state.error}</p>
            </div>
          )}

          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-900">AINからの提案</h2>

            {/* Loading State */}
            {state.isLoadingInitial && (
              <LoadingSpinner message="AINがあなたのための技術スタックを設計しています...🤖" />
            )}

            {/* Initial Suggestion */}
            {state.initialSuggestion && !state.isLoadingInitial && (
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <SpeechBubble className="flex-1">
                  <div className="prose prose-blue max-w-none">
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
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
                      >
                        {state.isLoadingFull ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            企画書生成中...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4" />
                            この提案で本格的な企画書を作成する
                          </>
                        )}
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
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <SpeechBubble className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      本格企画書が完成しました！
                    </h3>
                    
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
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">難易度チャート</h4>
                      <DifficultyChart userLevel={formData.experienceLevel} />
                    </div>

                    {/* Expandable Sections */}
                    <div className="space-y-3">
                      {proposalSections.map((section, index) => (
                        <ExpandableSection
                          key={index}
                          title={section.title}
                          defaultExpanded={index === 0}
                        >
                          <div 
                            className="prose prose-blue max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: section.content.replace(/\n/g, '<br>') 
                            }} 
                          />
                        </ExpandableSection>
                      ))}
                    </div>
                  </SpeechBubble>
                </div>

                {/* Refinement Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-900">
                      企画書を調整する（AIアドバイザー）
                    </h3>
                  </div>
                  
                  <p className="text-blue-700 mb-4">
                    企画書の内容について修正や質問がありましたら、お気軽にお申し付けください。
                    <span className="font-medium">（残り修正回数: {3 - state.refineCount}/3回）</span>
                  </p>

                  {state.refineCount < 3 && (
                    <form onSubmit={handleRefinement} className="space-y-4">
                      <textarea
                        value={refinementText}
                        onChange={(e) => setRefinementText(e.target.value)}
                        placeholder="例：予算をもう少し抑えたバージョンも提案してください"
                        className="w-full h-24 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        required
                      />
                      <button
                        type="submit"
                        disabled={state.isLoadingRefinement || !refinementText.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
                      >
                        {state.isLoadingRefinement ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            修正中...
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-4 w-4" />
                            修正・質問を依頼する
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {state.isLoadingRefinement && (
                    <div className="mt-4">
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