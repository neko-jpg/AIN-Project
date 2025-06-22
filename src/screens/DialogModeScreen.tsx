import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Send, Sparkles, Edit3, AlertTriangle, X, Download as DownloadIcon, PanelLeftOpen, PanelRightOpen, PanelTopOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Components
import Sidebar from '../components/Sidebar';
import DownloadButton from '../components/DownloadButton';
import EnhancedPromptComposer from '../components/EnhancedPromptComposer';
import { analyzeProject, executeCustomPrompt } from '../utils/api';
import { PromptBlock } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface DialogModeScreenProps {
  onBack: () => void;
  language: 'en' | 'ja';
}

const DialogModeScreen: React.FC<DialogModeScreenProps> = ({ onBack, language }) => {
  // Use language context
  const { t } = useLanguage();

  // State Management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<'desktop' | 'mobile'>('desktop');

  const [formData, setFormData] = useState({
    purpose: '',
    projectType: 'Webアプリケーション',
    budget: 10000,
    experienceLevel: '初心者',
    weeklyHours: '〜5時間',
  });
  const [developmentTime, setDevelopmentTime] = useState(3);
  const [promptBlocks, setPromptBlocks] = useState<PromptBlock[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setLayoutMode(window.innerWidth >= 1024 ? 'desktop' : 'mobile');
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiResult]);

  // Handle form changes
  const handleFormChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle traditional form submission (detailed analysis)
  const handleFormSubmit = async () => {
    if (!formData.purpose.trim()) return;

    setIsLoading(true);
    setError(null);
    setIsBottomPanelOpen(true);

    try {
      const payload = {
        purpose: formData.purpose,
        project_type: formData.projectType,
        budget: formData.budget,
        experience_level: formData.experienceLevel,
        weekly_hours: formData.weeklyHours,
        development_time: developmentTime,
        language
      };

      const response = await analyzeProject(payload);
      setAiResult(response.suggestion);
    } catch (err) {
      console.error('API Request Error (Form Submit):', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick generation (generate AI prompt from form data)
  const handleQuickGenerate = async () => {
    if (!formData.purpose.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create a prompt request to generate an AI prompt based on form data
      const promptRequest = `Based on the following project requirements, generate a comprehensive AI prompt that can be used to get optimal technology stack recommendations:

Project Purpose: ${formData.purpose}
Project Type: ${formData.projectType}
Budget: ${formData.budget} ${language === 'en' ? 'USD' : '円'} per month
Experience Level: ${formData.experienceLevel}
Weekly Hours: ${formData.weeklyHours}
Development Time: ${developmentTime} months
Language: ${language}

Please create a detailed prompt that includes:
1. Clear project context and goals
2. Technical requirements and constraints
3. Budget and timeline considerations
4. Experience level considerations
5. Request for specific technology recommendations

The generated prompt should be ready to send to an AI system to get comprehensive technology stack recommendations.`;

      const response = await executeCustomPrompt(promptRequest, language);
      
      // Set the generated prompt in the editor
      setCurrentPrompt(response.suggestion);
      
      // Auto-generate prompt blocks from the response
      const autoBlocks: PromptBlock[] = [
        {
          id: 'generated-prompt',
          content: response.suggestion,
          priority: 0,
          timestamp: new Date(),
          type: 'text'
        }
      ];

      setPromptBlocks(autoBlocks);

    } catch (err) {
      console.error('API Request Error (Quick Generate):', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
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
    setIsBottomPanelOpen(true); // Auto-open results panel

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
              <span>{t('common.back')}</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-900">{t('dialog.title')}</h1>
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
                <h3 className="text-lg font-semibold text-gray-900">{t('formPanel')}</h3>
              </div>
              
              <Sidebar
                formData={formData}
                developmentTime={developmentTime}
                onFormChange={handleFormChange}
                onDevelopmentTimeChange={setDevelopmentTime}
                onSubmit={handleFormSubmit}
                onQuickGenerate={handleQuickGenerate}
                isLoading={isLoading}
              />
              
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
                  <h3 className="text-lg font-semibold text-gray-900">{t('editorPanel')}</h3>
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
                  {isLoading ? t('loading.generating') : t('sendToAI')}
                </button>
              </div>
              
              <textarea
                value={currentPrompt}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                placeholder={currentPrompt ? t('promptPlaceholder') : t('noPromptYet')}
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
                  <h3 className="text-lg font-semibold text-gray-900">{t('resultPanel')}</h3>
                </div>
                
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-red-800 font-medium">{t('common.error')}</p>
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
                      <span className="font-medium text-gray-900">{t('prompt.result')}</span>
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
                <h3 className="text-lg font-semibold text-gray-900">{t('formPanel')}</h3>
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
              developmentTime={developmentTime}
              onFormChange={handleFormChange}
              onDevelopmentTimeChange={setDevelopmentTime}
              onSubmit={handleFormSubmit}
              onQuickGenerate={handleQuickGenerate}
              isLoading={isLoading}
            />
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
                <span>{t('common.back')}</span>
              </button>
              
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t('dialog.title')}</h1>
                <p className="text-sm text-gray-600">{t('dialog.subtitle')}</p>
              </div>
            </div>

            {/* Panel Toggle Controls */}
            <div className="flex items-center gap-2">
              {!isLeftPanelOpen && (
                <button
                  onClick={() => setIsLeftPanelOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  title={t('toggleLeftPanel')}
                >
                  <PanelLeftOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('formPanel')}</span>
                </button>
              )}
              
              {!isRightPanelOpen && (
                <button
                  onClick={() => setIsRightPanelOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  title={t('toggleRightPanel')}
                >
                  <PanelRightOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('promptPanel')}</span>
                </button>
              )}
              
              <button
                onClick={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isBottomPanelOpen 
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                }`}
                title={t('toggleBottomPanel')}
              >
                <PanelTopOpen className="h-4 w-4" />
                <span className="hidden sm:inline">{t('resultPanel')}</span>
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
                    <h3 className="text-lg font-semibold text-gray-900">{t('editorPanel')}</h3>
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
                    {isLoading ? t('loading.generating') : t('sendToAI')}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <textarea
                  value={currentPrompt}
                  onChange={(e) => setCurrentPrompt(e.target.value)}
                  placeholder={currentPrompt ? t('promptPlaceholder') : t('noPromptYet')}
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
                    <p className="text-red-800 font-medium">{t('common.error')}</p>
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
                    <h3 className="text-lg font-semibold text-gray-900">{t('promptPanel')}</h3>
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
                  <h3 className="text-lg font-semibold text-gray-900">{t('resultPanel')}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <DownloadButton
                    content={aiResult}
                    filename="ai-result.md"
                    className="text-sm"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    {t('common.download')}
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