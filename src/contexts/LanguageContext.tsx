import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Comprehensive translation object
const translations = {
  en: {
    // Common
    'common.back': 'Back',
    'common.next': 'Next',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.copy': 'Copy',
    'common.copied': 'Copied!',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Information',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.send': 'Send',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.add': 'Add',
    'common.remove': 'Remove',
    'common.clear': 'Clear',
    'common.reset': 'Reset',
    'common.apply': 'Apply',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.tryAgain': 'Try Again',

    // App Title & Navigation
    'app.title': 'AI Navigator',
    'app.subtitle': 'Your AI Project Partner',
    'app.description': 'Realize Your AI Project in the Optimal Way',
    'app.tagline': 'Select the interaction mode that best fits your thinking style',

    // Language Selection
    'language.title': 'Choose Your Language',
    'language.description': 'Select your preferred language for the AI Navigator experience',
    'language.continue': 'Continue to AI Navigator',
    'language.english': 'English',
    'language.japanese': '日本語',
    'language.englishDesc': 'Interface and AI responses in English',
    'language.japaneseDesc': 'インターフェースとAI応答を日本語で表示',

    // Mode Selection
    'modes.chooseMode': 'Choose Your AI Navigation Style',
    'modes.freeExperience': 'All modes are free to experience',
    'modes.features': 'Free to start',
    'modes.autoGenerate': 'Auto-generate proposals',
    'modes.aiOptimized': 'AI-optimized suggestions',

    // Dialog Mode
    'dialog.title': 'Dialog Mode',
    'dialog.subtitle': 'AI Navigator with Advanced Prompt Engineering',
    'dialog.description': 'Chat with AI to create optimal technology stacks and comprehensive project proposals. Now with advanced prompt composition and editing capabilities.',
    'dialog.features.stepByStep': 'Step-by-step guidance',
    'dialog.features.promptEngineering': 'Prompt engineering workspace',
    'dialog.features.interactiveRefinement': 'Interactive refinement',
    'dialog.features.visualComposition': 'Visual prompt composition',
    'dialog.difficulty': 'Beginner',
    'dialog.estimatedTime': '10-15 min',

    // Ball Mode
    'ball.title': 'Ball Mode',
    'ball.subtitle': 'Interactive Discovery',
    'ball.description': 'Tap interesting balls to let AI learn your interest patterns and suggest optimal projects.',
    'ball.features.intuitive': 'Intuitive interaction',
    'ball.features.visual': 'Visual-focused',
    'ball.features.patternLearning': 'Pattern learning',
    'ball.features.discoveries': 'New discoveries',
    'ball.difficulty': 'Intermediate',
    'ball.estimatedTime': '5-10 min',

    // Tree Mode
    'tree.title': 'Tree Mode',
    'tree.subtitle': 'Structured Planning',
    'tree.description': 'Organize project elements in a tree structure while AI suggests optimal combinations and implementation order.',
    'tree.features.structured': 'Structured thinking',
    'tree.features.visualization': 'Dependency visualization',
    'tree.features.phased': 'Phased planning',
    'tree.features.advanced': 'Advanced users',
    'tree.difficulty': 'Advanced',
    'tree.estimatedTime': '15-20 min',

    // Difficulty Levels
    'difficulty.beginner': 'Beginner',
    'difficulty.intermediate': 'Intermediate',
    'difficulty.advanced': 'Advanced',

    // Form Fields
    'form.purpose': 'What do you want to achieve with AI?',
    'form.purposePlaceholder': 'e.g., Analyze customer data to predict sales trends',
    'form.projectType': 'Project Type',
    'form.projectTypes.webApp': 'Web Application',
    'form.projectTypes.mobileApp': 'Mobile Application',
    'form.projectTypes.apiBackend': 'API Backend',
    'form.projectTypes.dataAnalysis': 'Data Analysis Platform',
    'form.projectTypes.other': 'Other',
    'form.budget': 'Monthly Budget (USD)',
    'form.experienceLevel': 'Your Development Experience Level',
    'form.experienceLevels.beginner': 'Beginner',
    'form.experienceLevels.intermediate': 'Intermediate',
    'form.experienceLevels.advanced': 'Advanced',
    'form.weeklyHours': 'Weekly Development Time',
    'form.weeklyHours.low': '~5 hours',
    'form.weeklyHours.medium': '5~20 hours',
    'form.weeklyHours.high': '20+ hours',
    'form.developmentTime': 'Development Time Investment',
    'form.developmentTimeDesc': 'How much time do you want to invest in this project?',
    'form.months': 'months',
    'form.submit': 'Get Optimal Tech Stack Recommendation',

    // Steps
    'steps.initialAnalysis': 'Initial Analysis',
    'steps.fullProposal': 'Full Proposal',
    'steps.interactiveRefinement': 'Interactive Refinement',
    'steps.promptEngineering': 'Prompt Engineering',

    // Loading States
    'loading.generating': 'Generating AI analysis...',
    'loading.generatingProposal': 'Creating comprehensive proposal...',
    'loading.refining': 'Processing refinement...',
    'loading.analyzing': 'Analyzing...',

    // Prompt Engineering
    'prompt.title': 'Enhanced Prompt Composer',
    'prompt.addBlock': 'Add prompt block',
    'prompt.placeholder': 'Enter your prompt component...',
    'prompt.voiceMemo': 'Voice memo',
    'prompt.sendToPrompt': 'Send to Prompt',
    'prompt.compress': 'Compress Prompt',
    'prompt.reorder': 'Smart Reorder',
    'prompt.templates': 'Templates',
    'prompt.quality': 'Quality Analysis',
    'prompt.priority': 'Priority',
    'prompt.preview': 'Preview Combined',
    'prompt.execute': 'Execute Prompt',
    'prompt.result': 'Prompt Result',

    // Quality Analysis
    'quality.score': 'Quality Score',
    'quality.excellent': 'Excellent',
    'quality.good': 'Good',
    'quality.needsWork': 'Needs Work',
    'quality.clarity': 'Clarity & Specificity',
    'quality.structure': 'Structure & Organization',
    'quality.context': 'Context & Background',
    'quality.completeness': 'Completeness',

    // Error Messages
    'error.networkError': 'Network connection error. Please check your internet connection.',
    'error.serverError': 'Server error occurred. Please try again later.',
    'error.invalidInput': 'Invalid input. Please check your data.',
    'error.backendUnavailable': 'Backend server is not accessible. Please ensure the backend is running.',

    // Success Messages
    'success.proposalGenerated': 'Proposal generated successfully!',
    'success.dataSaved': 'Data saved successfully!',
    'success.settingsUpdated': 'Settings updated successfully!',

    // Buttons
    'button.selectMode': 'Select This Mode',
    'button.generateProposal': 'Generate Full Proposal',
    'button.downloadProposal': 'Download Proposal',
    'button.viewFullProposal': 'View Full Proposal',
    'button.backToProposal': 'Back to Proposal',
    'button.startRecording': 'Start Recording',
    'button.stopRecording': 'Stop Recording',
    'button.uploadAudio': 'Upload Audio File',

    // Time Labels
    'time.quick': 'Quick',
    'time.standard': 'Standard',
    'time.comprehensive': 'Comprehensive',
    'time.estimatedCompletion': 'Estimated completion: {date}',

    // Metrics
    'metrics.budget': 'Budget',
    'metrics.duration': 'Development Period',
    'metrics.experience': 'Experience Level',
    'metrics.weeklyTime': 'Weekly Time',
    'metrics.riskLevel': 'Risk Level',
    'metrics.efficiency': 'Budget Efficiency',
    'metrics.skillMatch': 'Skill Match',

    // Risk Levels
    'risk.low': 'Low',
    'risk.medium': 'Medium',
    'risk.high': 'High',

    // Project Summary
    'summary.projectOverview': 'Project Overview',
    'summary.executiveSummary': 'Executive Summary',
    'summary.budgetBreakdown': 'Budget Breakdown',
    'summary.timeline': 'Development Phases',
    'summary.riskAnalysis': 'Risk Analysis and Countermeasures',

    // Refinement
    'refinement.askQuestion': 'Ask a question or request changes...',
    'refinement.quickSuggestions': 'Quick Suggestions (Click to auto-fill)',
    'refinement.conversationHistory': 'Conversation History',

    // Voice Input
    'voice.transcription': 'Voice transcription',
    'voice.processing': 'Processing...',
    'voice.uploadFile': 'Upload Audio File',
    'voice.noFiles': 'No audio files yet',
    'voice.duration': 'Duration',
    'voice.transcribe': 'Transcribe',
    'voice.play': 'Play',
    'voice.pause': 'Pause',

    // Templates
    'templates.title': 'Prompt Template Library',
    'templates.search': 'Search templates...',
    'templates.categories': 'Categories',
    'templates.all': 'All',
    'templates.webApp': 'Web App',
    'templates.mobileApp': 'Mobile App',
    'templates.aiAssistant': 'AI Assistant',
    'templates.dataAnalysis': 'Data Analysis',
    'templates.ecommerce': 'E-commerce',
    'templates.productivity': 'Productivity',
    'templates.useTemplate': 'Use Template',

    // Built on Bolt
    'bolt.builtOn': 'Built on Bolt'
  },
  ja: {
    // Common
    'common.back': '戻る',
    'common.next': '次へ',
    'common.cancel': 'キャンセル',
    'common.save': '保存',
    'common.delete': '削除',
    'common.edit': '編集',
    'common.copy': 'コピー',
    'common.copied': 'コピーしました！',
    'common.loading': '読み込み中...',
    'common.error': 'エラー',
    'common.success': '成功',
    'common.warning': '警告',
    'common.info': '情報',
    'common.close': '閉じる',
    'common.open': '開く',
    'common.send': '送信',
    'common.download': 'ダウンロード',
    'common.upload': 'アップロード',
    'common.search': '検索',
    'common.filter': 'フィルター',
    'common.sort': '並び替え',
    'common.add': '追加',
    'common.remove': '削除',
    'common.clear': 'クリア',
    'common.reset': 'リセット',
    'common.apply': '適用',
    'common.confirm': '確認',
    'common.yes': 'はい',
    'common.no': 'いいえ',
    'common.ok': 'OK',
    'common.tryAgain': '再試行',

    // App Title & Navigation
    'app.title': 'AI Navigator',
    'app.subtitle': 'あなたのAIプロジェクトパートナー',
    'app.description': 'あなたのAIプロジェクトを最適な形で実現しよう',
    'app.tagline': 'あなたの思考スタイルに最適なインタラクションモードを選んでください',

    // Language Selection
    'language.title': '言語を選択してください',
    'language.description': 'AI Navigatorエクスペリエンスの言語を選択してください',
    'language.continue': 'AI Navigatorに進む',
    'language.english': 'English',
    'language.japanese': '日本語',
    'language.englishDesc': 'Interface and AI responses in English',
    'language.japaneseDesc': 'インターフェースとAI応答を日本語で表示',

    // Mode Selection
    'modes.chooseMode': 'あなたのAIナビゲーションスタイルを選択',
    'modes.freeExperience': 'どのモードも無料で体験できます',
    'modes.features': '無料で利用開始',
    'modes.autoGenerate': '企画書自動生成',
    'modes.aiOptimized': 'AI最適化提案',

    // Dialog Mode
    'dialog.title': '対話モード',
    'dialog.subtitle': 'プロンプトエンジニアリング対応',
    'dialog.description': 'AIと対話しながら、あなたのプロジェクトに最適な技術スタックと企画書を作成します。高度なプロンプト構成・編集機能を搭載。',
    'dialog.features.stepByStep': 'ステップバイステップガイド',
    'dialog.features.promptEngineering': 'プロンプトエンジニアリング',
    'dialog.features.interactiveRefinement': '対話型調整',
    'dialog.features.visualComposition': 'ビジュアルプロンプト構成',
    'dialog.difficulty': '初心者向け',
    'dialog.estimatedTime': '10-15分',

    // Ball Mode
    'ball.title': 'ボールモード',
    'ball.subtitle': 'Interactive Discovery',
    'ball.description': '興味のあるボールをタップして、AIがあなたの関心パターンを学習し、最適なプロジェクトを提案します。',
    'ball.features.intuitive': '直感的な操作',
    'ball.features.visual': 'ビジュアル重視',
    'ball.features.patternLearning': 'パターン学習',
    'ball.features.discoveries': '新しい発見',
    'ball.difficulty': '中級者向け',
    'ball.estimatedTime': '5-10分',

    // Tree Mode
    'tree.title': '木モード',
    'tree.subtitle': 'Structured Planning',
    'tree.description': 'プロジェクトの要素をツリー構造で整理し、AIが最適な組み合わせと実装順序を提案します。',
    'tree.features.structured': '構造化された思考',
    'tree.features.visualization': '依存関係の可視化',
    'tree.features.phased': '段階的な計画',
    'tree.features.advanced': '上級者向け',
    'tree.difficulty': '上級者向け',
    'tree.estimatedTime': '15-20分',

    // Difficulty Levels
    'difficulty.beginner': '初心者向け',
    'difficulty.intermediate': '中級者向け',
    'difficulty.advanced': '上級者向け',

    // Form Fields
    'form.purpose': 'AIを使って実現したいことは何ですか？',
    'form.purposePlaceholder': '例：顧客データを分析して売上予測を行うシステムを作りたい',
    'form.projectType': 'プロジェクトの種類',
    'form.projectTypes.webApp': 'Webアプリケーション',
    'form.projectTypes.mobileApp': 'モバイルアプリケーション',
    'form.projectTypes.apiBackend': 'APIバックエンド',
    'form.projectTypes.dataAnalysis': 'データ分析基盤',
    'form.projectTypes.other': 'その他',
    'form.budget': '月額予算（円）',
    'form.experienceLevel': 'あなたの開発経験レベル',
    'form.experienceLevels.beginner': '初心者',
    'form.experienceLevels.intermediate': '中級者',
    'form.experienceLevels.advanced': '上級者',
    'form.weeklyHours': '週に使える開発時間',
    'form.weeklyHours.low': '〜5時間',
    'form.weeklyHours.medium': '5〜20時間',
    'form.weeklyHours.high': '20時間以上',
    'form.developmentTime': '開発時間の投資',
    'form.developmentTimeDesc': 'このプロジェクトにどのくらいの時間を投資したいですか？',
    'form.months': 'ヶ月',
    'form.submit': '最適な技術スタックを提案してもらう',

    // Steps
    'steps.initialAnalysis': '初期分析',
    'steps.fullProposal': '完全企画書',
    'steps.interactiveRefinement': '対話型調整',
    'steps.promptEngineering': 'プロンプトエンジニアリング',

    // Loading States
    'loading.generating': 'AI分析を生成中...',
    'loading.generatingProposal': '包括的な企画書を作成中...',
    'loading.refining': '調整を処理中...',
    'loading.analyzing': '分析中...',

    // Prompt Engineering
    'prompt.title': '高度なプロンプト構成ツール',
    'prompt.addBlock': 'プロンプトブロックを追加',
    'prompt.placeholder': 'プロンプト要素を入力...',
    'prompt.voiceMemo': 'ボイスメモ',
    'prompt.sendToPrompt': 'プロンプトに送信',
    'prompt.compress': 'プロンプト圧縮',
    'prompt.reorder': 'スマート並び替え',
    'prompt.templates': 'テンプレート',
    'prompt.quality': '品質分析',
    'prompt.priority': '優先度',
    'prompt.preview': '結合プレビュー',
    'prompt.execute': 'プロンプトを実行',
    'prompt.result': 'プロンプト結果',

    // Quality Analysis
    'quality.score': '品質スコア',
    'quality.excellent': '優秀',
    'quality.good': '良好',
    'quality.needsWork': '要改善',
    'quality.clarity': '明確性・具体性',
    'quality.structure': '構造・整理',
    'quality.context': 'コンテキスト・背景',
    'quality.completeness': '完全性',

    // Error Messages
    'error.networkError': 'ネットワーク接続エラーです。インターネット接続を確認してください。',
    'error.serverError': 'サーバーエラーが発生しました。しばらく後に再試行してください。',
    'error.invalidInput': '無効な入力です。データを確認してください。',
    'error.backendUnavailable': 'バックエンドサーバーにアクセスできません。バックエンドが実行されていることを確認してください。',

    // Success Messages
    'success.proposalGenerated': '企画書が正常に生成されました！',
    'success.dataSaved': 'データが正常に保存されました！',
    'success.settingsUpdated': '設定が正常に更新されました！',

    // Buttons
    'button.selectMode': 'このモードを選択',
    'button.generateProposal': '完全企画書を生成',
    'button.downloadProposal': '企画書をダウンロード',
    'button.viewFullProposal': '完全企画書を表示',
    'button.backToProposal': '企画書に戻る',
    'button.startRecording': '録音開始',
    'button.stopRecording': '録音停止',
    'button.uploadAudio': '音声ファイルをアップロード',

    // Time Labels
    'time.quick': 'クイック',
    'time.standard': 'スタンダード',
    'time.comprehensive': '包括的',
    'time.estimatedCompletion': '完了予定: {date}',

    // Metrics
    'metrics.budget': '予算',
    'metrics.duration': '開発期間',
    'metrics.experience': '経験レベル',
    'metrics.weeklyTime': '週間時間',
    'metrics.riskLevel': 'リスクレベル',
    'metrics.efficiency': '予算効率',
    'metrics.skillMatch': 'スキルマッチ',

    // Risk Levels
    'risk.low': '低',
    'risk.medium': '中',
    'risk.high': '高',

    // Project Summary
    'summary.projectOverview': 'プロジェクト概要',
    'summary.executiveSummary': 'エグゼクティブサマリー',
    'summary.budgetBreakdown': '予算内訳',
    'summary.timeline': '開発フェーズ',
    'summary.riskAnalysis': 'リスク分析と対策',

    // Refinement
    'refinement.askQuestion': '質問や変更要求を入力...',
    'refinement.quickSuggestions': 'よくある質問（クリックで自動入力）',
    'refinement.conversationHistory': '会話履歴',

    // Voice Input
    'voice.transcription': '音声転写',
    'voice.processing': '処理中...',
    'voice.uploadFile': '音声ファイルをアップロード',
    'voice.noFiles': '音声ファイルがありません',
    'voice.duration': '長さ',
    'voice.transcribe': '転写',
    'voice.play': '再生',
    'voice.pause': '一時停止',

    // Templates
    'templates.title': 'プロンプトテンプレートライブラリ',
    'templates.search': 'テンプレートを検索...',
    'templates.categories': 'カテゴリ',
    'templates.all': 'すべて',
    'templates.webApp': 'Webアプリ',
    'templates.mobileApp': 'モバイルアプリ',
    'templates.aiAssistant': 'AIアシスタント',
    'templates.dataAnalysis': 'データ分析',
    'templates.ecommerce': 'Eコマース',
    'templates.productivity': '生産性',
    'templates.useTemplate': 'テンプレートを使用',

    // Built on Bolt
    'bolt.builtOn': 'Built on Bolt'
  }
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get language from localStorage first
    const saved = localStorage.getItem('ain-language');
    return (saved as Language) || 'ja'; // Default to Japanese
  });

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ain-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Translation function with parameter interpolation
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" not found for language "${language}"`);
      return key; // Return the key itself as fallback
    }
    
    // Replace parameters in the translation
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match: string, paramKey: string) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};