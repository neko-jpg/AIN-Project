import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Zap } from 'lucide-react';
import { PromptBlock, AppSettings } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import PromptComposer from '../components/PromptComposer';
import PromptPreview from '../components/PromptPreview';
import DevelopmentTimeSlider from '../components/DevelopmentTimeSlider';
import ResizablePanel from '../components/ResizablePanel';

interface EnhancedDialogModeScreenProps {
  onBack: () => void;
  language: 'en' | 'ja';
}

const EnhancedDialogModeScreen: React.FC<EnhancedDialogModeScreenProps> = ({
  onBack,
  language
}) => {
  const [settings, setSettings] = useLocalStorage<AppSettings>('ain-settings', {
    language,
    developmentTime: 6,
    promptBlocks: [],
    voiceMemos: []
  });

  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const texts = {
    en: {
      title: 'Enhanced Dialog Mode',
      subtitle: 'Advanced prompt engineering workspace',
      settings: 'Project Settings',
      promptWorkspace: 'Prompt Engineering Workspace',
      noPrompt: 'Use the prompt composer to build your AI request, then send it here for final editing.',
      executing: 'Executing AI prompt...'
    },
    ja: {
      title: '拡張対話モード',
      subtitle: '高度なプロンプトエンジニアリングワークスペース',
      settings: 'プロジェクト設定',
      promptWorkspace: 'プロンプトエンジニアリングワークスペース',
      noPrompt: 'プロンプトコンポーザーを使用してAIリクエストを構築し、最終編集のためにここに送信してください。',
      executing: 'AIプロンプトを実行中...'
    }
  };

  const t = texts[language];

  // Update settings when language or development time changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      language,
      developmentTime: prev.developmentTime
    }));
  }, [language, setSettings]);

  const handleBlocksChange = (blocks: PromptBlock[]) => {
    setSettings(prev => ({
      ...prev,
      promptBlocks: blocks
    }));
  };

  const handleDevelopmentTimeChange = (time: number) => {
    setSettings(prev => ({
      ...prev,
      developmentTime: time
    }));
  };

  const handleSendToPrompt = (combinedPrompt: string) => {
    // Generate enhanced prompt with context
    const enhancedPrompt = `
${language === 'en' ? 'Project Context:' : 'プロジェクトコンテキスト:'}
${language === 'en' ? `- Development time budget: ${settings.developmentTime} months` : `- 開発時間予算: ${settings.developmentTime}ヶ月`}
${language === 'en' ? `- Language preference: ${language === 'en' ? 'English' : 'Japanese'}` : `- 言語設定: ${language === 'en' ? '英語' : '日本語'}`}

${language === 'en' ? 'User Requirements:' : 'ユーザー要件:'}
${combinedPrompt}

${language === 'en' ? 'Please provide a comprehensive project proposal based on the above requirements and constraints.' : '上記の要件と制約に基づいて、包括的なプロジェクト提案を提供してください。'}
    `.trim();

    setCurrentPrompt(enhancedPrompt);
    setShowPromptPreview(true);
  };

  const handleExecutePrompt = async () => {
    setIsExecuting(true);
    
    // Simulate AI execution
    setTimeout(() => {
      setIsExecuting(false);
      // Here you would integrate with your AI API
      console.log('Executing prompt:', currentPrompt);
    }, 3000);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Panel - Settings */}
      <ResizablePanel
        position="left"
        isCollapsed={leftPanelCollapsed}
        onToggle={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
        defaultWidth={300}
        minWidth={250}
        maxWidth={400}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">{t.settings}</h3>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <DevelopmentTimeSlider
              value={settings.developmentTime}
              onChange={handleDevelopmentTimeChange}
              language={language}
            />
            
            {/* Additional settings can be added here */}
          </div>
        </div>
      </ResizablePanel>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{language === 'en' ? 'Back' : '戻る'}</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-gray-600 text-sm">{t.subtitle}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-600">
                {language === 'en' ? 'Powered by AI' : 'AI駆動'}
              </span>
            </div>
          </div>
        </div>

        {/* Main workspace */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.promptWorkspace}</h2>
            
            {showPromptPreview ? (
              <PromptPreview
                prompt={currentPrompt}
                onPromptChange={setCurrentPrompt}
                onExecute={handleExecutePrompt}
                isLoading={isExecuting}
                language={language}
              />
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {language === 'en' ? 'Ready for Prompt Engineering' : 'プロンプトエンジニアリング準備完了'}
                  </h3>
                  <p className="text-gray-600 text-sm">{t.noPrompt}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Prompt Composer */}
      <ResizablePanel
        position="right"
        isCollapsed={rightPanelCollapsed}
        onToggle={() => setRightPanelCollapsed(!rightPanelCollapsed)}
        defaultWidth={350}
        minWidth={300}
        maxWidth={500}
      >
        <PromptComposer
          blocks={settings.promptBlocks}
          onBlocksChange={handleBlocksChange}
          onSendToPrompt={handleSendToPrompt}
          language={language}
        />
      </ResizablePanel>
    </div>
  );
};

export default EnhancedDialogModeScreen;