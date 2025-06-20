import React, { useState } from 'react';
import { X, Search, FileText, Zap, Brain, Globe, Smartphone, Database, Shield, Code, Layers, Target, Sparkles, Clock, Users, TrendingUp } from 'lucide-react';
import { PromptTemplate } from '../types';

interface PromptTemplateLibraryProps {
  onSelectTemplate: (template: PromptTemplate) => void;
  onClose: () => void;
  language: 'en' | 'ja';
  developmentTime: number;
}

const PromptTemplateLibrary: React.FC<PromptTemplateLibraryProps> = ({
  onSelectTemplate,
  onClose,
  language,
  developmentTime
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const texts = {
    en: {
      title: 'Prompt Template Library',
      search: 'Search templates...',
      categories: 'Categories',
      all: 'All',
      webApp: 'Web App',
      mobileApp: 'Mobile App',
      aiAssistant: 'AI Assistant',
      dataAnalysis: 'Data Analysis',
      ecommerce: 'E-commerce',
      productivity: 'Productivity',
      security: 'Security',
      useTemplate: 'Use Template',
      close: 'Close',
      preview: 'Preview',
      difficulty: 'Difficulty',
      estimatedTime: 'Est. Time',
      features: 'Features'
    },
    ja: {
      title: 'プロンプトテンプレートライブラリ',
      search: 'テンプレートを検索...',
      categories: 'カテゴリ',
      all: 'すべて',
      webApp: 'Webアプリ',
      mobileApp: 'モバイルアプリ',
      aiAssistant: 'AIアシスタント',
      dataAnalysis: 'データ分析',
      ecommerce: 'Eコマース',
      productivity: '生産性',
      security: 'セキュリティ',
      useTemplate: 'テンプレートを使用',
      close: '閉じる',
      preview: 'プレビュー',
      difficulty: '難易度',
      estimatedTime: '推定時間',
      features: '特徴'
    }
  };

  const t = texts[language];

  const templates: PromptTemplate[] = [
    {
      id: 'saas-web-app',
      name: language === 'en' ? 'SaaS Web Application' : 'SaaS Webアプリケーション',
      description: language === 'en' 
        ? 'Complete template for building a SaaS web application with user management'
        : 'ユーザー管理機能付きSaaS Webアプリケーション構築用の完全テンプレート',
      category: 'webApp',
      icon: <Globe className="h-5 w-5" />,
      difficulty: 'intermediate',
      estimatedTime: `${developmentTime}ヶ月`,
      features: language === 'en' 
        ? ['User Authentication', 'Subscription Management', 'Dashboard', 'API Integration']
        : ['ユーザー認証', 'サブスクリプション管理', 'ダッシュボード', 'API統合'],
      blocks: [
        language === 'en' 
          ? `Project Context: Build a SaaS web application for ${developmentTime} months development timeline`
          : `プロジェクトコンテキスト: ${developmentTime}ヶ月の開発期間でSaaS Webアプリケーションを構築`,
        language === 'en'
          ? 'Core Features: User authentication, subscription management, dashboard, API integration'
          : 'コア機能: ユーザー認証、サブスクリプション管理、ダッシュボード、API統合',
        language === 'en'
          ? 'Technical Requirements: React/Next.js frontend, Node.js backend, PostgreSQL database, Stripe payments'
          : '技術要件: React/Next.jsフロントエンド、Node.jsバックエンド、PostgreSQLデータベース、Stripe決済',
        language === 'en'
          ? 'Deployment: Cloud hosting with CI/CD pipeline, monitoring, and security best practices'
          : 'デプロイ: CI/CDパイプライン、モニタリング、セキュリティベストプラクティス付きクラウドホスティング'
      ]
    },
    {
      id: 'ai-chatbot',
      name: language === 'en' ? 'AI Chatbot Assistant' : 'AIチャットボットアシスタント',
      description: language === 'en'
        ? 'Intelligent chatbot with natural language processing capabilities'
        : '自然言語処理機能を持つインテリジェントチャットボット',
      category: 'aiAssistant',
      icon: <Brain className="h-5 w-5" />,
      difficulty: 'advanced',
      estimatedTime: `${Math.max(4, developmentTime - 2)}ヶ月`,
      features: language === 'en'
        ? ['NLP Processing', 'Context Awareness', 'Multi-turn Conversations', 'Intent Recognition']
        : ['自然言語処理', 'コンテキスト認識', 'マルチターン会話', '意図認識'],
      blocks: [
        language === 'en'
          ? `AI Assistant Context: Develop an intelligent chatbot for ${developmentTime} months timeline`
          : `AIアシスタントコンテキスト: ${developmentTime}ヶ月の期間でインテリジェントチャットボットを開発`,
        language === 'en'
          ? 'NLP Features: Intent recognition, entity extraction, context awareness, multi-turn conversations'
          : 'NLP機能: 意図認識、エンティティ抽出、コンテキスト認識、マルチターン会話',
        language === 'en'
          ? 'AI Integration: OpenAI GPT, Anthropic Claude, or Google Gemini API integration'
          : 'AI統合: OpenAI GPT、Anthropic Claude、またはGoogle Gemini API統合',
        language === 'en'
          ? 'Deployment: Scalable backend with real-time messaging and conversation history'
          : 'デプロイ: リアルタイムメッセージングと会話履歴を持つスケーラブルバックエンド'
      ]
    },
    {
      id: 'mobile-app',
      name: language === 'en' ? 'Cross-Platform Mobile App' : 'クロスプラットフォームモバイルアプリ',
      description: language === 'en'
        ? 'React Native app with offline capabilities and push notifications'
        : 'オフライン機能とプッシュ通知付きReact Nativeアプリ',
      category: 'mobileApp',
      icon: <Smartphone className="h-5 w-5" />,
      difficulty: 'intermediate',
      estimatedTime: `${Math.max(3, developmentTime - 1)}ヶ月`,
      features: language === 'en'
        ? ['Cross-Platform', 'Offline Sync', 'Push Notifications', 'App Store Ready']
        : ['クロスプラットフォーム', 'オフライン同期', 'プッシュ通知', 'アプリストア対応'],
      blocks: [
        language === 'en'
          ? `Mobile App Context: Create cross-platform mobile application in ${developmentTime} months`
          : `モバイルアプリコンテキスト: ${developmentTime}ヶ月でクロスプラットフォームモバイルアプリケーションを作成`,
        language === 'en'
          ? 'Platform Features: iOS and Android compatibility, offline data sync, push notifications'
          : 'プラットフォーム機能: iOS・Android対応、オフラインデータ同期、プッシュ通知',
        language === 'en'
          ? 'Technology Stack: React Native, Expo, Firebase/Supabase backend, AsyncStorage'
          : '技術スタック: React Native、Expo、Firebase/Supabaseバックエンド、AsyncStorage',
        language === 'en'
          ? 'App Store: Deployment to Apple App Store and Google Play Store with proper CI/CD'
          : 'アプリストア: 適切なCI/CDでApple App StoreとGoogle Play Storeにデプロイ'
      ]
    },
    {
      id: 'data-analytics',
      name: language === 'en' ? 'Data Analytics Platform' : 'データ分析プラットフォーム',
      description: language === 'en'
        ? 'Business intelligence dashboard with real-time data visualization'
        : 'リアルタイムデータ可視化付きビジネスインテリジェンスダッシュボード',
      category: 'dataAnalysis',
      icon: <Database className="h-5 w-5" />,
      difficulty: 'advanced',
      estimatedTime: `${Math.max(6, developmentTime + 2)}ヶ月`,
      features: language === 'en'
        ? ['Real-time Analytics', 'Data Visualization', 'ETL Pipelines', 'ML Integration']
        : ['リアルタイム分析', 'データ可視化', 'ETLパイプライン', 'ML統合'],
      blocks: [
        language === 'en'
          ? `Analytics Platform Context: Build comprehensive data analytics solution in ${developmentTime} months`
          : `分析プラットフォームコンテキスト: ${developmentTime}ヶ月で包括的データ分析ソリューションを構築`,
        language === 'en'
          ? 'Data Processing: ETL pipelines, real-time streaming, data warehousing, ML model integration'
          : 'データ処理: ETLパイプライン、リアルタイムストリーミング、データウェアハウジング、MLモデル統合',
        language === 'en'
          ? 'Visualization: Interactive dashboards, custom charts, drill-down capabilities, export features'
          : '可視化: インタラクティブダッシュボード、カスタムチャート、ドリルダウン機能、エクスポート機能',
        language === 'en'
          ? 'Infrastructure: Cloud data warehouse, API layer, caching, security and access control'
          : 'インフラ: クラウドデータウェアハウス、APIレイヤー、キャッシング、セキュリティ・アクセス制御'
      ]
    },
    {
      id: 'ecommerce-platform',
      name: language === 'en' ? 'E-commerce Platform' : 'Eコマースプラットフォーム',
      description: language === 'en'
        ? 'Full-featured online store with payment processing and inventory management'
        : '決済処理と在庫管理機能付きフル機能オンラインストア',
      category: 'ecommerce',
      icon: <Zap className="h-5 w-5" />,
      difficulty: 'intermediate',
      estimatedTime: `${Math.max(5, developmentTime + 1)}ヶ月`,
      features: language === 'en'
        ? ['Payment Processing', 'Inventory Management', 'Order Tracking', 'Admin Panel']
        : ['決済処理', '在庫管理', '注文追跡', '管理パネル'],
      blocks: [
        language === 'en'
          ? `E-commerce Context: Develop complete online store platform in ${developmentTime} months`
          : `Eコマースコンテキスト: ${developmentTime}ヶ月で完全なオンラインストアプラットフォームを開発`,
        language === 'en'
          ? 'Store Features: Product catalog, shopping cart, checkout, order management, customer accounts'
          : 'ストア機能: 商品カタログ、ショッピングカート、チェックアウト、注文管理、顧客アカウント',
        language === 'en'
          ? 'Payment & Shipping: Stripe/PayPal integration, tax calculation, shipping options, inventory tracking'
          : '決済・配送: Stripe/PayPal統合、税計算、配送オプション、在庫追跡',
        language === 'en'
          ? 'Admin Panel: Product management, order processing, analytics, customer support tools'
          : '管理パネル: 商品管理、注文処理、分析、カスタマーサポートツール'
      ]
    },
    {
      id: 'productivity-app',
      name: language === 'en' ? 'Productivity Application' : '生産性アプリケーション',
      description: language === 'en'
        ? 'Task management and collaboration tool with team features'
        : 'チーム機能付きタスク管理・コラボレーションツール',
      category: 'productivity',
      icon: <FileText className="h-5 w-5" />,
      difficulty: 'beginner',
      estimatedTime: `${Math.max(3, developmentTime - 1)}ヶ月`,
      features: language === 'en'
        ? ['Task Management', 'Team Collaboration', 'Time Tracking', 'Reporting']
        : ['タスク管理', 'チームコラボレーション', '時間追跡', 'レポート'],
      blocks: [
        language === 'en'
          ? `Productivity App Context: Create team productivity solution in ${developmentTime} months`
          : `生産性アプリコンテキスト: ${developmentTime}ヶ月でチーム生産性ソリューションを作成`,
        language === 'en'
          ? 'Core Features: Task management, project planning, time tracking, team collaboration'
          : 'コア機能: タスク管理、プロジェクト計画、時間追跡、チームコラボレーション',
        language === 'en'
          ? 'Collaboration: Real-time updates, comments, file sharing, notifications, calendar integration'
          : 'コラボレーション: リアルタイム更新、コメント、ファイル共有、通知、カレンダー統合',
        language === 'en'
          ? 'Analytics: Productivity metrics, reporting, goal tracking, performance insights'
          : '分析: 生産性メトリクス、レポート、目標追跡、パフォーマンス洞察'
      ]
    }
  ];

  const categories = [
    { id: 'all', name: t.all, icon: <FileText className="h-4 w-4" /> },
    { id: 'webApp', name: t.webApp, icon: <Globe className="h-4 w-4" /> },
    { id: 'mobileApp', name: t.mobileApp, icon: <Smartphone className="h-4 w-4" /> },
    { id: 'aiAssistant', name: t.aiAssistant, icon: <Brain className="h-4 w-4" /> },
    { id: 'dataAnalysis', name: t.dataAnalysis, icon: <Database className="h-4 w-4" /> },
    { id: 'ecommerce', name: t.ecommerce, icon: <Zap className="h-4 w-4" /> },
    { id: 'productivity', name: t.productivity, icon: <Code className="h-4 w-4" /> }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return language === 'en' ? 'Beginner' : '初心者';
      case 'intermediate': return language === 'en' ? 'Intermediate' : '中級者';
      case 'advanced': return language === 'en' ? 'Advanced' : '上級者';
      default: return difficulty;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                <Layers className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.search}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Categories Sidebar */}
          <div className="w-64 border-r border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">{t.categories}</h3>
            <div className="space-y-1">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.icon}
                  <span className="text-sm">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200 bg-white"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {template.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                          {getDifficultyText(template.difficulty)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {template.description}
                      </p>
                      
                      {/* Features */}
                      <div className="mb-4">
                        <h4 className="text-xs font-medium text-gray-700 mb-2">{t.features}:</h4>
                        <div className="flex flex-wrap gap-1">
                          {template.features.map((feature, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Time estimate */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Clock className="h-4 w-4" />
                        <span>{t.estimatedTime}: {template.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview blocks */}
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium text-gray-700">{t.preview}:</h4>
                    {template.blocks.slice(0, 2).map((block, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {block}
                        </p>
                      </div>
                    ))}
                    {template.blocks.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{template.blocks.length - 2} more blocks
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onSelectTemplate(template)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    {t.useTemplate}
                  </button>
                </div>
              ))}
            </div>
            
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {language === 'en' ? 'No templates found matching your search.' : '検索に一致するテンプレートが見つかりません。'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptTemplateLibrary;