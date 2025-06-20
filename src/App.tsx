import React, { useState } from 'react';
import { MessageCircle, Sparkles, GitBranch, Brain, Zap, TreePine, Target, ArrowRight, Star } from 'lucide-react';

// Screen components
import DialogModeScreen from './screens/DialogModeScreen';
import BallModeScreen from './screens/BallModeScreen';
import TreeModeScreen from './screens/TreeModeScreen';
import BoltBadge from './components/BoltBadge';
import LanguageSelector from './components/LanguageSelector';
import { useLocalStorage } from './hooks/useLocalStorage';

type AppMode = 'language' | 'intro' | 'dialog' | 'ball' | 'tree';

interface ModeCard {
  id: AppMode;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  features: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  isNew?: boolean;
}

function App() {
  const [language, setLanguage] = useLocalStorage<'en' | 'ja'>('ain-language', 'ja');
  const [currentMode, setCurrentMode] = useState<AppMode>('language');

  const texts = {
    en: {
      chooseMode: 'Choose Your AI Navigation Style',
      subtitle: 'Select the interaction mode that best fits your thinking style',
      features: 'Free to start',
      autoGenerate: 'Auto-generate proposals',
      aiOptimized: 'AI-optimized suggestions',
      modes: {
        'dialog': {
          title: 'Dialog Mode',
          subtitle: 'AI Navigator with Prompt Engineering',
          description: 'Chat with AI to create optimal technology stacks and comprehensive project proposals. Now with advanced prompt composition and editing capabilities.',
          features: ['Step-by-step guidance', 'Prompt engineering workspace', 'Interactive refinement', 'Visual prompt composition'],
          difficulty: 'beginner',
          estimatedTime: '10-15 min'
        },
        'ball': {
          title: 'Ball Mode',
          subtitle: 'Interactive Discovery',
          description: 'Tap interesting balls to let AI learn your interest patterns and suggest optimal projects.',
          features: ['Intuitive interaction', 'Visual-focused', 'Pattern learning', 'New discoveries'],
          difficulty: 'intermediate',
          estimatedTime: '5-10 min'
        },
        'tree': {
          title: 'Tree Mode',
          subtitle: 'Structured Planning',
          description: 'Organize project elements in a tree structure while AI suggests optimal combinations and implementation order.',
          features: ['Structured thinking', 'Dependency visualization', 'Phased planning', 'Advanced users'],
          difficulty: 'advanced',
          estimatedTime: '15-20 min'
        }
      },
      difficulties: {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced'
      },
      selectMode: 'Select This Mode',
      freeExperience: 'All modes are free to experience'
    },
    ja: {
      chooseMode: 'あなたのAIナビゲーションスタイルを選択',
      subtitle: 'あなたの思考スタイルに最適なインタラクションモードを選んでください',
      features: '無料で利用開始',
      autoGenerate: '企画書自動生成',
      aiOptimized: 'AI最適化提案',
      modes: {
        'dialog': {
          title: '対話モード',
          subtitle: 'プロンプトエンジニアリング対応',
          description: 'AIと対話しながら、あなたのプロジェクトに最適な技術スタックと企画書を作成します。高度なプロンプト構成・編集機能を搭載。',
          features: ['ステップバイステップガイド', 'プロンプトエンジニアリング', '対話型調整', 'ビジュアルプロンプト構成'],
          difficulty: 'beginner',
          estimatedTime: '10-15分'
        },
        'ball': {
          title: 'ボールモード',
          subtitle: 'Interactive Discovery',
          description: '興味のあるボールをタップして、AIがあなたの関心パターンを学習し、最適なプロジェクトを提案します。',
          features: ['直感的な操作', 'ビジュアル重視', 'パターン学習', '新しい発見'],
          difficulty: 'intermediate',
          estimatedTime: '5-10分'
        },
        'tree': {
          title: '木モード',
          subtitle: 'Structured Planning',
          description: 'プロジェクトの要素をツリー構造で整理し、AIが最適な組み合わせと実装順序を提案します。',
          features: ['構造化された思考', '依存関係の可視化', '段階的な計画', '上級者向け'],
          difficulty: 'advanced',
          estimatedTime: '15-20分'
        }
      },
      difficulties: {
        beginner: '初心者向け',
        intermediate: '中級者向け',
        advanced: '上級者向け'
      },
      selectMode: 'このモードを選択',
      freeExperience: 'どのモードも無料で体験できます'
    }
  };

  const t = texts[language];

  const modes: ModeCard[] = [
    {
      id: 'dialog',
      title: t.modes.dialog.title,
      subtitle: t.modes.dialog.subtitle,
      description: t.modes.dialog.description,
      icon: <MessageCircle className="h-8 w-8" />,
      gradient: 'from-blue-500 via-blue-600 to-purple-600',
      features: t.modes.dialog.features,
      difficulty: 'beginner',
      estimatedTime: t.modes.dialog.estimatedTime,
      isNew: true
    },
    {
      id: 'ball',
      title: t.modes.ball.title,
      subtitle: t.modes.ball.subtitle,
      description: t.modes.ball.description,
      icon: <Sparkles className="h-8 w-8" />,
      gradient: 'from-purple-500 via-pink-500 to-orange-500',
      features: t.modes.ball.features,
      difficulty: 'intermediate',
      estimatedTime: t.modes.ball.estimatedTime
    },
    {
      id: 'tree',
      title: t.modes.tree.title,
      subtitle: t.modes.tree.subtitle,
      description: t.modes.tree.description,
      icon: <GitBranch className="h-8 w-8" />,
      gradient: 'from-green-500 via-emerald-500 to-teal-600',
      features: t.modes.tree.features,
      difficulty: 'advanced',
      estimatedTime: t.modes.tree.estimatedTime
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Language selection screen
  if (currentMode === 'language') {
    return (
      <LanguageSelector
        selectedLanguage={language}
        onLanguageChange={setLanguage}
        onContinue={() => setCurrentMode('intro')}
      />
    );
  }

  // Render different screens based on current mode
  if (currentMode === 'dialog') {
    return (
      <>
        <DialogModeScreen 
          onBack={() => setCurrentMode('intro')} 
          language={language}
        />
        <BoltBadge />
      </>
    );
  }

  if (currentMode === 'ball') {
    return <BallModeScreen onBack={() => setCurrentMode('intro')} language={language} />;
  }

  if (currentMode === 'tree') {
    return <TreeModeScreen onBack={() => setCurrentMode('intro')} language={language} />;
  }

  // Main intro screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  AI Navigator
                </h1>
                <p className="text-white/70 text-sm lg:text-base">
                  Your AI Project Partner
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentMode('language')}
                className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white text-sm hover:bg-white/15 transition-colors"
              >
                {language === 'en' ? '🇺🇸 EN' : '🇯🇵 JP'}
              </button>
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-white text-sm font-medium">v2.0 Enhanced</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-4 lg:px-8 pb-8 lg:pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero content */}
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-white text-sm font-medium">
                {language === 'en' ? '3 Revolutionary Approaches' : '3つの革新的なアプローチ'}
              </span>
            </div>
            
            <h2 className="text-3xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {language === 'en' ? (
                <>
                  Realize Your
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {' '}AI Project{' '}
                  </span>
                  in the<br />
                  Optimal Way
                </>
              ) : (
                <>
                  あなたの
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    AIプロジェクト
                  </span>
                  を<br />
                  最適な形で実現しよう
                </>
              )}
            </h2>
            
            <p className="text-lg lg:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-white/60">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="text-sm">{t.features}</span>
              </div>
              <div className="flex items-center gap-2">
                <TreePine className="h-4 w-4" />
                <span className="text-sm">{t.autoGenerate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="text-sm">{t.aiOptimized}</span>
              </div>
            </div>
          </div>

          {/* Mode Selection Cards - Optimized for Mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {modes.map((mode, index) => (
              <div
                key={mode.id}
                className="group relative"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Card */}
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 lg:p-8 hover:bg-white/15 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl h-full flex flex-col">
                  {/* New badge */}
                  {mode.isNew && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      ENHANCED
                    </div>
                  )}
                  
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-4 bg-gradient-to-r ${mode.gradient} rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {mode.icon}
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(mode.difficulty)}`}>
                          {t.difficulties[mode.difficulty]}
                        </span>
                      </div>
                    </div>
                    
                    {/* Title and subtitle */}
                    <div className="mb-4">
                      <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">
                        {mode.title}
                      </h3>
                      <p className="text-white/60 text-sm font-medium">
                        {mode.subtitle}
                      </p>
                    </div>
                    
                    {/* Description */}
                    <p className="text-white/80 text-sm lg:text-base leading-relaxed mb-6 flex-grow">
                      {mode.description}
                    </p>
                    
                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="text-white font-medium text-sm mb-3">
                        {language === 'en' ? 'Key Features' : '主な機能'}
                      </h4>
                      <ul className="space-y-2">
                        {mode.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2 text-white/70 text-sm">
                            <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Time estimate */}
                    <div className="flex items-center gap-2 text-white/60 text-sm mb-6">
                      <Zap className="h-4 w-4" />
                      <span>
                        {language === 'en' ? 'Time required: ' : '所要時間: '}{mode.estimatedTime}
                      </span>
                    </div>
                    
                    {/* CTA Button */}
                    <button
                      onClick={() => setCurrentMode(mode.id)}
                      className={`w-full bg-gradient-to-r ${mode.gradient} text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 group-hover:shadow-xl mt-auto`}
                    >
                      <span>{t.selectMode}</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12 lg:mt-16">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white/80">
              <Brain className="h-5 w-5" />
              <span className="text-sm">{t.freeExperience}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Built on Bolt Badge */}
      <BoltBadge />

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default App;