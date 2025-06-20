import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Zap, Brain, Target, Lightbulb, Rocket, Palette, Database, Shield, Globe, Code, Cpu, Cloud } from 'lucide-react';

interface Ball {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  energy: number;
  velocity: { x: number; y: number };
  category: 'tech' | 'domain' | 'approach';
}

interface BallModeScreenProps {
  onBack: () => void;
  language: 'en' | 'ja';
}

const BallModeScreen: React.FC<BallModeScreenProps> = ({ onBack, language }) => {
  const [balls, setBalls] = useState<Ball[]>([]);
  const [selectedBalls, setSelectedBalls] = useState<string[]>([]);
  const [aiThinking, setAiThinking] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [animationFrame, setAnimationFrame] = useState(0);

  const texts = {
    en: {
      title: 'Ball Mode',
      subtitle: 'Tap interesting balls to let AI learn your interest patterns',
      back: 'Back',
      aiAnalysis: 'AI Analysis Results',
      patternAnalyzing: 'Analyzing patterns...',
      selectedBalls: 'Selected Balls',
      selectBallsPrompt: 'Tap balls to teach AI about your interests',
      generateProposal: 'Generate Proposal with This Combination',
      ballLabels: {
        'ai-ml': 'AI・Machine Learning',
        'web-dev': 'Web Development',
        'mobile': 'Mobile Apps',
        'data': 'Data Analytics',
        'automation': 'Automation',
        'security': 'Security',
        'design': 'UI/UX Design',
        'cloud': 'Cloud',
        'api': 'API Development',
        'performance': 'Performance'
      },
      insights: {
        techDomain: '🎯 Detected combination of technology and domain',
        practical: '💡 High potential for practical solutions',
        aiCentric: '🤖 AI・Machine Learning will play a central role',
        complex: '🚀 Complex approach expected for innovative projects',
        interest: '📊 Your technical interest level'
      }
    },
    ja: {
      title: 'ボールモード',
      subtitle: '興味のあるボールをタップして、AIにあなたの関心パターンを学習させよう',
      back: '戻る',
      aiAnalysis: 'AI分析結果',
      patternAnalyzing: 'パターン分析中...',
      selectedBalls: '選択されたボール',
      selectBallsPrompt: 'ボールをタップして、AIにあなたの興味を教えてください',
      generateProposal: 'この組み合わせで企画書を生成',
      ballLabels: {
        'ai-ml': 'AI・機械学習',
        'web-dev': 'Web開発',
        'mobile': 'モバイルアプリ',
        'data': 'データ分析',
        'automation': '自動化',
        'security': 'セキュリティ',
        'design': 'UI/UXデザイン',
        'cloud': 'クラウド',
        'api': 'API開発',
        'performance': 'パフォーマンス'
      },
      insights: {
        techDomain: '🎯 技術とドメインの組み合わせを検出しました',
        practical: '💡 実用的なソリューションの可能性が高いです',
        aiCentric: '🤖 AI・機械学習が中心的な役割を果たします',
        complex: '🚀 複合的なアプローチで革新的なプロジェクトが期待できます',
        interest: '📊 あなたの技術的関心度'
      }
    }
  };

  const t = texts[language];

  // Initialize balls with beautiful floating animation
  useEffect(() => {
    const initialBalls: Ball[] = [
      // Technology balls
      {
        id: 'ai-ml',
        x: 15,
        y: 25,
        size: 90,
        color: 'from-blue-400 via-blue-500 to-blue-600',
        label: t.ballLabels['ai-ml'],
        icon: <Brain className="h-7 w-7 text-white" />,
        isActive: false,
        energy: 0,
        velocity: { x: 0.5, y: 0.3 },
        category: 'tech'
      },
      {
        id: 'web-dev',
        x: 70,
        y: 15,
        size: 85,
        color: 'from-emerald-400 via-emerald-500 to-emerald-600',
        label: t.ballLabels['web-dev'],
        icon: <Globe className="h-6 w-6 text-white" />,
        isActive: false,
        energy: 0,
        velocity: { x: -0.4, y: 0.6 },
        category: 'tech'
      },
      {
        id: 'mobile',
        x: 85,
        y: 65,
        size: 80,
        color: 'from-purple-400 via-purple-500 to-purple-600',
        label: t.ballLabels['mobile'],
        icon: <Rocket className="h-6 w-6 text-white" />,
        isActive: false,
        energy: 0,
        velocity: { x: -0.3, y: -0.4 },
        category: 'tech'
      },
      {
        id: 'data',
        x: 20,
        y: 75,
        size: 88,
        color: 'from-orange-400 via-orange-500 to-orange-600',
        label: t.ballLabels['data'],
        icon: <Database className="h-6 w-6 text-white" />,
        isActive: false,
        energy: 0,
        velocity: { x: 0.6, y: -0.2 },
        category: 'tech'
      },
      // Domain balls
      {
        id: 'automation',
        x: 50,
        y: 45,
        size: 75,
        color: 'from-pink-400 via-pink-500 to-pink-600',
        label: t.ballLabels['automation'],
        icon: <Zap className="h-5 w-5 text-white" />,
        isActive: false,
        energy: 0,
        velocity: { x: -0.2, y: 0.5 },
        category: 'domain'
      },
      {
        id: 'security',
        x: 65,
        y: 85,
        size: 70,
        color: 'from-red-400 via-red-500 to-red-600',
        label: t.ballLabels['security'],
        icon: <Shield className="h-5 w-5 text-white" />,
        isActive: false,
        energy: 0,
        velocity: { x: 0.3, y: -0.6 },
        category: 'domain'
      },
      {
        id: 'design',
        x: 35,
        y: 20,
        size: 65,
        color: 'from-indigo-400 via-indigo-500 to-indigo-600',
        label: t.ballLabels['design'],
        icon: <Palette className="h-4 w-4 text-white" />,
        isActive: false,
        energy: 0,
        velocity: { x: 0.4, y: 0.4 },
        category: 'approach'
      },
      // Approach balls
      {
        id: 'cloud',
        x: 80,
        y: 35,
        size: 72,
        color: 'from-cyan-400 via-cyan-500 to-cyan-600',
        label: t.ballLabels['cloud'],
        icon: <Cloud className="h-5 w-5 text-white" />,
        isActive: false,
        energy: 0,
        velocity: { x: -0.5, y: 0.2 },
        category: 'approach'
      },
      {
        id: 'api',
        x: 45,
        y: 70,
        size: 68,
        color: 'from-teal-400 via-teal-500 to-teal-600',
        label: t.ballLabels['api'],
        icon: <Code className="h-5 w-5 text-white" />,
        isActive: false,
        energy: 0,
        velocity: { x: 0.2, y: -0.3 },
        category: 'approach'
      },
      {
        id: 'performance',
        x: 25,
        y: 50,
        size: 63,
        color: 'from-yellow-400 via-yellow-500 to-yellow-600',
        label: t.ballLabels['performance'],
        icon: <Cpu className="h-4 w-4 text-white" />,
        isActive: false,
        energy: 0,
        velocity: { x: 0.7, y: 0.1 },
        category: 'approach'
      }
    ];
    setBalls(initialBalls);
  }, [language]);

  // Animation loop for floating balls
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
      
      setBalls(prev => prev.map(ball => {
        let newX = ball.x + ball.velocity.x * 0.1;
        let newY = ball.y + ball.velocity.y * 0.1;
        let newVelocityX = ball.velocity.x;
        let newVelocityY = ball.velocity.y;

        // Bounce off walls with some randomness
        if (newX <= 5 || newX >= 90) {
          newVelocityX = -ball.velocity.x + (Math.random() - 0.5) * 0.2;
          newX = Math.max(5, Math.min(90, newX));
        }
        if (newY <= 5 || newY >= 90) {
          newVelocityY = -ball.velocity.y + (Math.random() - 0.5) * 0.2;
          newY = Math.max(5, Math.min(90, newY));
        }

        return {
          ...ball,
          x: newX,
          y: newY,
          velocity: { x: newVelocityX, y: newVelocityY }
        };
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Handle ball click with beautiful interaction
  const handleBallClick = (ballId: string) => {
    setBalls(prev => prev.map(ball => {
      if (ball.id === ballId) {
        const newEnergy = Math.min(ball.energy + 30, 100);
        const isActive = newEnergy > 60;
        
        if (isActive && !selectedBalls.includes(ballId)) {
          setSelectedBalls(prev => [...prev, ballId]);
        }
        
        // Add some velocity on click for dynamic feel
        const clickVelocity = {
          x: ball.velocity.x + (Math.random() - 0.5) * 2,
          y: ball.velocity.y + (Math.random() - 0.5) * 2
        };
        
        return {
          ...ball,
          energy: newEnergy,
          isActive,
          velocity: clickVelocity
        };
      }
      return ball;
    }));

    // Trigger AI analysis after interaction
    if (selectedBalls.length >= 1) {
      triggerAIAnalysis();
    }
  };

  // Advanced AI analysis with pattern recognition
  const triggerAIAnalysis = () => {
    setAiThinking(true);
    
    setTimeout(() => {
      const selectedBallsData = balls.filter(ball => selectedBalls.includes(ball.id));
      const categories = [...new Set(selectedBallsData.map(ball => ball.category))];
      
      let newInsights: string[] = [];
      
      if (categories.includes('tech') && categories.includes('domain')) {
        newInsights.push(t.insights.techDomain);
        newInsights.push(t.insights.practical);
      }
      
      if (selectedBallsData.some(ball => ball.id === 'ai-ml')) {
        newInsights.push(t.insights.aiCentric);
      }
      
      if (selectedBallsData.length >= 3) {
        newInsights.push(t.insights.complex);
      }
      
      const interestLevel = Math.min(95, 60 + selectedBallsData.length * 8);
      newInsights.push(`${t.insights.interest}: ${interestLevel}%`);
      
      setInsights(prev => {
        const combined = [...prev, ...newInsights];
        return combined.slice(-5); // Keep only last 5 insights
      });
      setAiThinking(false);
    }, 1500);
  };

  // Get dynamic style for floating balls
  const getBallStyle = (ball: Ball) => ({
    left: `${ball.x}%`,
    top: `${ball.y}%`,
    width: `${ball.size}px`,
    height: `${ball.size}px`,
    transform: `translate(-50%, -50%) scale(${ball.isActive ? 1.15 : 1})`,
    filter: ball.isActive ? 'brightness(1.2) drop-shadow(0 0 20px rgba(255,255,255,0.5))' : 'none',
    zIndex: ball.isActive ? 10 : 1
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{t.back}</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2">
              {t.title}
            </h1>
            <p className="text-white/80 text-sm lg:text-base">
              {t.subtitle}
            </p>
          </div>
          
          <div className="w-20" />
        </div>
      </div>

      {/* Main interaction area */}
      <div className="relative z-10 h-[60vh] lg:h-[70vh] mx-4 lg:mx-8">
        <div className="relative w-full h-full bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
          {/* Balls */}
          {balls.map((ball) => (
            <div
              key={ball.id}
              className="absolute cursor-pointer transition-all duration-300 ease-out hover:scale-110"
              style={getBallStyle(ball)}
              onClick={() => handleBallClick(ball.id)}
            >
              <div
                className={`w-full h-full bg-gradient-to-br ${ball.color} rounded-full shadow-2xl flex flex-col items-center justify-center text-white font-medium text-xs lg:text-sm border-4 ${
                  ball.isActive ? 'border-white shadow-white/50' : 'border-white/30'
                } hover:border-white transition-all duration-300 relative overflow-hidden`}
              >
                {/* Shimmer effect for active balls */}
                {ball.isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                )}
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="mb-1">{ball.icon}</div>
                  <div className="text-center px-2 leading-tight">{ball.label}</div>
                </div>
                
                {/* Energy bar */}
                {ball.energy > 0 && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-500 rounded-full"
                      style={{ width: `${ball.energy}%` }}
                    />
                  </div>
                )}
              </div>
              
              {/* Ripple effect on active */}
              {ball.isActive && (
                <>
                  <div className="absolute inset-0 rounded-full border-4 border-white animate-ping opacity-75" />
                  <div className="absolute inset-0 rounded-full border-2 border-white animate-pulse opacity-50" />
                </>
              )}
            </div>
          ))}

          {/* Connection lines between active balls */}
          {selectedBalls.length > 1 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {selectedBalls.slice(0, -1).map((ballId, index) => {
                const ball1 = balls.find(b => b.id === ballId);
                const ball2 = balls.find(b => b.id === selectedBalls[index + 1]);
                if (!ball1 || !ball2) return null;
                
                return (
                  <line
                    key={`${ballId}-${selectedBalls[index + 1]}`}
                    x1={`${ball1.x}%`}
                    y1={`${ball1.y}%`}
                    x2={`${ball2.x}%`}
                    y2={`${ball2.y}%`}
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="3"
                    strokeDasharray="8,4"
                    className="animate-pulse"
                  />
                );
              })}
            </svg>
          )}

          {/* Floating instruction */}
          {selectedBalls.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-white/60 animate-pulse">
                <Sparkles className="h-8 w-8 mx-auto mb-2" />
                <p className="text-lg font-medium">
                  {language === 'en' ? 'Tap balls to get started' : 'ボールをタップして始めよう'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="relative z-10 mx-4 lg:mx-8 mt-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg">{t.aiAnalysis}</h3>
            {aiThinking && (
              <div className="flex items-center gap-2 text-white/80">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span className="text-sm">{t.patternAnalyzing}</span>
              </div>
            )}
          </div>
          
          {/* Selected balls display */}
          {selectedBalls.length > 0 && (
            <div className="mb-4">
              <h4 className="text-white/80 text-sm font-medium mb-2">{t.selectedBalls}</h4>
              <div className="flex flex-wrap gap-2">
                {selectedBalls.map(ballId => {
                  const ball = balls.find(b => b.id === ballId);
                  return ball ? (
                    <div key={ballId} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1">
                      <div className={`p-1 bg-gradient-to-r ${ball.color} rounded text-white`}>
                        {ball.icon}
                      </div>
                      <span className="text-white text-sm">{ball.label}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
          
          {/* AI Insights */}
          <div className="space-y-2">
            {insights.length === 0 ? (
              <p className="text-white/60 text-sm">
                {t.selectBallsPrompt}
              </p>
            ) : (
              insights.map((insight, index) => (
                <div
                  key={index}
                  className="bg-white/10 rounded-lg p-3 text-white text-sm animate-fade-in border border-white/20"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {insight}
                </div>
              ))
            )}
          </div>
          
          {selectedBalls.length >= 2 && (
            <div className="mt-6 pt-4 border-t border-white/20">
              <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                <Target className="h-5 w-5" />
                {t.generateProposal}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BallModeScreen;