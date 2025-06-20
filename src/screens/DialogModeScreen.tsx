import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MessageCircle, Send, Sparkles, Brain, Lightbulb, Zap, Plus, Settings, Eye, Edit3, Copy, Check, Mic, MicOff, GripVertical, Trash2, FileText, Clock, TrendingUp, Target, AlertTriangle, User, Briefcase, ChevronDown, ChevronRight, Download as DownloadIcon, Menu, X, Bot } from 'lucide-react';
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
  const [currentStep, setCurrentStep] = useState<'initial' | 'proposal' | 'refinement' | 'prompt-engineering'>('initial');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
  const [initialSuggestion, setInitialSuggestion] = useState<string>('');
  const [fullProposal, setFullProposal] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ConversationItem[]>([]);
  
  // Refinement
  const [refinementInput, setRefinementInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // Prompt Engineering
  const [promptBlocks, setPromptBlocks] = useState<PromptBlock[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [promptResult, setPromptResult] = useState<string>('');
  const [isPromptComposerOpen, setIsPromptComposerOpen] = useState(true);
  const [isPromptPreviewOpen, setIsPromptPreviewOpen] = useState(true);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const refinementInputRef = useRef<HTMLTextAreaElement>(null);

  const texts = {
    en: {
      title: 'Dialog Mode',
      subtitle: 'AI Navigator with Advanced Prompt Engineering',
      back: 'Back',
      step1: 'Initial Analysis',
      step2: 'Full Proposal',
      step3: 'Interactive Refinement',
      step4: 'Prompt Engineering',
      generating: 'Generating AI analysis...',
      generatingProposal: 'Creating comprehensive proposal...',
      refining: 'Processing refinement...',
      error: 'Error occurred',
      tryAgain: 'Try Again',
      askQuestion: 'Ask a question or request changes...',
      send: 'Send',
      downloadProposal: 'Download Proposal',
      viewFullProposal: 'View Full Proposal',
      backToProposal: 'Back to Proposal',
      promptEngineering: 'Prompt Engineering',
      promptEngineeringDesc: 'Design and optimize your AI prompts',
      executePrompt: 'Execute Prompt',
      promptResult: 'Prompt Result'
    },
    ja: {
      title: '対話モード',
      subtitle: '高度なプロンプトエンジニアリング対応AIナビゲーター',
      back: '戻る',
      step1: '初期分析',
      step2: '完全企画書',
      step3: '対話型調整',
      step4: 'プロンプトエンジニアリング',
      generating: 'AI分析を生成中...',
      generatingProposal: '包括的な企画書を作成中...',
      refining: '調整を処理中...',
      error: 'エラーが発生しました',
      tryAgain: '再試行',
      askQuestion: '質問や変更要求を入力...',
      send: '送信',
      downloadProposal: '企画書をダウンロード',
      viewFullProposal: '完全企画書を表示',
      backToProposal: '企画書に戻る',
      promptEngineering: 'プロンプトエンジニアリング',
      promptEngineeringDesc: 'AIプロンプトを設計・最適化',
      executePrompt: 'プロンプトを実行',
      promptResult: 'プロンプト結果'
    }
  };

  const t = texts[language];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, fullProposal, promptResult]);

  // Handle form changes
  const handleFormChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Initial submission
  const handleSubmitInitial = async () => {
    if (!formData.purpose.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        development_time: developmentTime,
        language
      };

      const response = await analyzeProject(payload);
      setInitialSuggestion(response.suggestion);
      
      // Extract development time from AI response
      const extractedTime = extractDurationFromText(response.suggestion);
      if (extractedTime !== developmentTime) {
        setDevelopmentTime(extractedTime);
      }

      setCurrentStep('proposal');
    } catch (err) {
      console.error('API Request Error (Initial):', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate full proposal
  const handleGenerateFullProposal = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        development_time: developmentTime,
        language
      };

      const response = await generateFullProposal(payload);
      setFullProposal(response.suggestion);
      setCurrentStep('refinement');
    } catch (err) {
      console.error('API Request Error (Full Proposal):', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refinement
  const handleRefinement = async () => {
    if (!refinementInput.trim()) return;

    setIsRefining(true);
    setError(null);

    const userMessage: ConversationItem = {
      type: 'user',
      content: refinementInput,
      timestamp: new Date()
    };

    setConversationHistory(prev => [...prev, userMessage]);

    try {
      const response = await refineProposal({
        user_payload: {
          ...formData,
          development_time: developmentTime,
          language
        },
        current_proposal: fullProposal,
        refinement_request: refinementInput
      });

      const aiMessage: ConversationItem = {
        type: 'ai',
        content: response.content,
        timestamp: new Date()
      };

      setConversationHistory(prev => [...prev, aiMessage]);

      if (response.type === 'proposal') {
        setFullProposal(response.content);
      }

      setRefinementInput('');
    } catch (err) {
      console.error('API Request Error (Refinement):', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsRefining(false);
    }
  };

  // Handle prompt engineering
  const handlePromptFromComposer = (prompt: string) => {
    setCurrentPrompt(prompt);
  };

  const handleExecutePrompt = async () => {
    if (!currentPrompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await executeCustomPrompt(currentPrompt, language);
      setPromptResult(response.suggestion);
    } catch (err) {
      console.error('API Request Error (Custom Prompt):', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick suggestion handler
  const handleQuickSuggestion = (suggestion: string) => {
    setRefinementInput(suggestion);
    refinementInputRef.current?.focus();
  };

  // Get sections for expandable display
  const proposalSections = fullProposal ? splitProposalIntoSections(fullProposal) : [];

  // Navigation steps
  const steps = [
    { id: 'initial', label: t.step1, completed: currentStep !== 'initial' },
    { id: 'proposal', label: t.step2, completed: ['refinement', 'prompt-engineering'].includes(currentStep) },
    { id: 'refinement', label: t.step3, completed: currentStep === 'prompt-engineering' },
    { id: 'prompt-engineering', label: t.step4, completed: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden">
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Settings</h2>
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
                onSubmit={handleSubmitInitial}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          formData={formData}
          onFormChange={handleFormChange}
          onSubmit={handleSubmitInitial}
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
                <p className="text-sm text-gray-600">{t.subtitle}</p>
              </div>
            </div>

            {/* Step Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => {
                      if (step.id === 'prompt-engineering') {
                        setCurrentStep('prompt-engineering');
                      } else if (step.completed || step.id === currentStep) {
                        setCurrentStep(step.id as any);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentStep === step.id
                        ? 'bg-blue-100 text-blue-700'
                        : step.completed
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                    disabled={!step.completed && step.id !== currentStep && step.id !== 'prompt-engineering'}
                  >
                    {step.label}
                  </button>
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {currentStep === 'prompt-engineering' ? (
              /* Prompt Engineering Mode */
              <div className="flex-1 flex">
                {/* Left Panel - Prompt Composer */}
                <ResizablePanel
                  position="left"
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
                  <PromptPreview
                    prompt={currentPrompt}
                    onPromptChange={setCurrentPrompt}
                    onExecute={handleExecutePrompt}
                    isLoading={isLoading}
                    language={language}
                  />

                  {/* Development Time Slider */}
                  <DevelopmentTimeSlider
                    value={developmentTime}
                    onChange={setDevelopmentTime}
                    language={language}
                  />

                  {/* Prompt Result */}
                  {promptResult && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            <h3 className="text-lg font-semibold text-gray-900">{t.promptResult}</h3>
                          </div>
                          <DownloadButton
                            content={promptResult}
                            filename="prompt-result.md"
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
                            {promptResult}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Regular Dialog Mode */
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto">
                  <div className="max-w-6xl mx-auto p-3 lg:p-6">
                    {/* Error Display */}
                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
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

                    {/* Loading State */}
                    {isLoading && (
                      <LoadingSpinner 
                        message={
                          currentStep === 'initial' ? t.generating :
                          currentStep === 'proposal' ? t.generatingProposal :
                          t.refining
                        } 
                      />
                    )}

                    {/* Initial Analysis Result */}
                    {initialSuggestion && currentStep === 'proposal' && !isLoading && (
                      <div className="mb-8">
                        <div className="flex items-center gap-4 mb-6">
                          <InteractiveAvatar state="happy" />
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">初期分析完了！</h2>
                            <p className="text-gray-600">あなたのプロジェクトに最適な技術スタックを分析しました。</p>
                          </div>
                        </div>

                        <SpeechBubble className="mb-6">
                          <div className="prose max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {initialSuggestion}
                            </ReactMarkdown>
                          </div>
                        </SpeechBubble>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <button
                            onClick={handleGenerateFullProposal}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                          >
                            <FileText className="h-5 w-5" />
                            {t.viewFullProposal}
                          </button>
                          
                          <button
                            onClick={() => setCurrentStep('prompt-engineering')}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                          >
                            <Brain className="h-5 w-5" />
                            {t.promptEngineering}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Full Proposal Display */}
                    {fullProposal && (currentStep === 'refinement' || currentStep === 'proposal') && !isLoading && (
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <InteractiveAvatar state="happy" />
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900 mb-2">完全企画書が完成しました！</h2>
                              <p className="text-gray-600">詳細な技術スタックと実装計画をご確認ください。</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <DownloadButton
                              content={fullProposal}
                              filename="ai-project-proposal.md"
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                            >
                              <DownloadIcon className="h-4 w-4" />
                              <span className="hidden sm:inline ml-2">{t.downloadProposal}</span>
                            </DownloadButton>
                            
                            <button
                              onClick={() => setCurrentStep('prompt-engineering')}
                              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2"
                            >
                              <Brain className="h-4 w-4" />
                              <span className="hidden sm:inline">{t.promptEngineering}</span>
                            </button>
                          </div>
                        </div>

                        {/* Executive Summary */}
                        <ExecutiveSummary
                          budget={formData.budget}
                          duration={developmentTime}
                          experienceLevel={formData.experienceLevel}
                          projectType={formData.projectType}
                        />

                        {/* Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                          <MetricCard
                            title="予算"
                            value={formData.budget.toLocaleString()}
                            unit="円/月"
                            icon={<Briefcase className="h-5 w-5" />}
                            color="blue"
                          />
                          <MetricCard
                            title="開発期間"
                            value={developmentTime}
                            unit="ヶ月"
                            icon={<Clock className="h-5 w-5" />}
                            color="green"
                          />
                          <MetricCard
                            title="経験レベル"
                            value={formData.experienceLevel}
                            icon={<User className="h-5 w-5" />}
                            color="orange"
                          />
                          <MetricCard
                            title="週間時間"
                            value={formData.weeklyHours}
                            icon={<TrendingUp className="h-5 w-5" />}
                            color="purple"
                          />
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                          <BudgetBreakdownChart budget={formData.budget} />
                          <TimelineChart duration={developmentTime} />
                        </div>

                        {/* Expandable Sections */}
                        <div className="space-y-4 mb-8">
                          {proposalSections.map((section, index) => (
                            <ExpandableSection
                              key={index}
                              title={section.title}
                              defaultExpanded={index === 0}
                            >
                              <div className="prose max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {section.content}
                                </ReactMarkdown>
                              </div>
                            </ExpandableSection>
                          ))}
                        </div>

                        {currentStep === 'refinement' && (
                          <>
                            {/* Conversation History */}
                            {conversationHistory.length > 0 && (
                              <div className="mb-8">
                                <ConversationHistory history={conversationHistory} />
                              </div>
                            )}

                            {/* Quick Suggestions */}
                            <QuickSuggestions onSuggestionClick={handleQuickSuggestion} />

                            {/* Refinement Input */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                              <div className="flex items-center gap-3 mb-4">
                                <MessageCircle className="h-6 w-6 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">企画書を調整・改善</h3>
                              </div>
                              
                              <div className="space-y-4">
                                <textarea
                                  ref={refinementInputRef}
                                  value={refinementInput}
                                  onChange={(e) => setRefinementInput(e.target.value)}
                                  placeholder={t.askQuestion}
                                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                  disabled={isRefining}
                                />
                                
                                <div className="flex justify-end">
                                  <button
                                    onClick={handleRefinement}
                                    disabled={isRefining || !refinementInput.trim()}
                                    className="bg-blue-600 text-white py-2.5 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
                                  >
                                    {isRefining ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    ) : (
                                      <Send className="h-4 w-4" />
                                    )}
                                    <span>{isRefining ? t.refining : t.send}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogModeScreen;