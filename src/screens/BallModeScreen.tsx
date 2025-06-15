// src/screens/BallModeScreen.tsx
// ボールモード - インタラクティブなアイデア探索UI

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Zap, Brain, Target, Lightbulb, Rocket } from 'lucide-react';

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
}

interface BallModeScreenProps {
  onBack: () => void;
}

const BallModeScreen: React.FC<BallModeScreenProps> = ({ onBack }) => {
  const [balls, setBalls] = useState<Ball[]>([]);
  const [selectedBalls, setSelectedBalls] = useState<string[]>([]);
  const [aiThinking, setAiThinking] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);

  // Initialize balls
  useEffect(() => {
    const initialBalls: Ball[] = [
      {
        id: 'ai-ml',
        x: 20,
        y: 30,
        size: 80,
        color: 'from-blue-400 to-blue-600',
        label: 'AI・機械学習',
        icon: <Brain className="h-6 w-6 text-white" />,
        isActive: false,
        energy: 0
      },
      {
        id: 'web-dev',
        x: 60,
        y: 20,
        size: 70,
        color: 'from-green-400 to-green-600',
        label: 'Web開発',
        icon: <Target className="h-5 w-5 text-white" />,
        isActive: false,
        energy: 0
      },
      {
        id: 'mobile',
        x: 80,
        y: 60,
        size: 65,
        color: 'from-purple-400 to-purple-600',
        label: 'モバイルアプリ',
        icon: <Rocket className="h-5 w-5 text-white" />,
        isActive: false,
        energy: 0
      },
      {
        id: 'data',
        x: 15,
        y: 70,
        size: 75,
        color: 'from-orange-400 to-orange-600',
        label: 'データ分析',
        icon: <Zap className="h-5 w-5 text-white" />,
        isActive: false,
        energy: 0
      },
      {
        id: 'automation',
        x: 45,
        y: 55,
        size: 60,
        color: 'from-pink-400 to-pink-600',
        label: '自動化',
        icon: <Lightbulb className="h-4 w-4 text-white" />,
        isActive: false,
        energy: 0
      },
      {
        id: 'iot',
        x: 70,
        y: 85,
        size: 55,
        color: 'from-cyan-400 to-cyan-600',
        label: 'IoT',
        icon: <Sparkles className="h-4 w-4 text-white" />,
        isActive: false,
        energy: 0
      }
    ];
    setBalls(initialBalls);
  }, []);

  // Handle ball click
  const handleBallClick = (ballId: string) => {
    setBalls(prev => prev.map(ball => {
      if (ball.id === ballId) {
        const newEnergy = Math.min(ball.energy + 25, 100);
        const isActive = newEnergy > 50;
        
        if (isActive && !selectedBalls.includes(ballId)) {
          setSelectedBalls(prev => [...prev, ballId]);
        }
        
        return {
          ...ball,
          energy: newEnergy,
          isActive
        };
      }
      return ball;
    }));

    // Trigger AI analysis after interaction
    if (selectedBalls.length >= 1) {
      triggerAIAnalysis();
    }
  };

  // Simulate AI analysis
  const triggerAIAnalysis = () => {
    setAiThinking(true);
    
    setTimeout(() => {
      const newInsights = [
        "🤖 AIが興味のパターンを検出しました",
        "💡 Web開発とAIの組み合わせが有望です",
        "🚀 自動化プロジェクトの提案を準備中...",
        "📊 あなたの技術的関心度: 85%"
      ];
      
      setInsights(prev => {
        const combined = [...prev, ...newInsights];
        return combined.slice(-4); // Keep only last 4 insights
      });
      setAiThinking(false);
    }, 2000);
  };

  // Floating animation for balls
  const getFloatingStyle = (ball: Ball) => ({
    left: `${ball.x}%`,
    top: `${ball.y}%`,
    width: `${ball.size}px`,
    height: `${ball.size}px`,
    transform: `translate(-50%, -50%) scale(${ball.isActive ? 1.1 : 1})`,
    animation: `float-${ball.id} 3s ease-in-out infinite`,
    animationDelay: `${Math.random() * 2}s`
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
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
            <span>戻る</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2">
              ボールモード
            </h1>
            <p className="text-white/80 text-sm lg:text-base">
              興味のあるボールをタップして、AIにあなたの関心を学習させよう
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
              className={`absolute cursor-pointer transition-all duration-300 ease-out hover:scale-110 ${
                ball.isActive ? 'animate-pulse' : ''
              }`}
              style={getFloatingStyle(ball)}
              onClick={() => handleBallClick(ball.id)}
            >
              <div
                className={`w-full h-full bg-gradient-to-br ${ball.color} rounded-full shadow-2xl flex flex-col items-center justify-center text-white font-medium text-xs lg:text-sm border-4 ${
                  ball.isActive ? 'border-white' : 'border-white/30'
                } hover:border-white transition-all duration-300`}
              >
                <div className="mb-1">{ball.icon}</div>
                <div className="text-center px-2 leading-tight">{ball.label}</div>
                
                {/* Energy bar */}
                {ball.energy > 0 && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-500"
                      style={{ width: `${ball.energy}%` }}
                    />
                  </div>
                )}
              </div>
              
              {/* Ripple effect on click */}
              {ball.isActive && (
                <div className="absolute inset-0 rounded-full border-4 border-white animate-ping opacity-75" />
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
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                );
              })}
            </svg>
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
            <h3 className="text-white font-semibold text-lg">AI分析結果</h3>
            {aiThinking && (
              <div className="flex items-center gap-2 text-white/80">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span className="text-sm">分析中...</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {insights.length === 0 ? (
              <p className="text-white/60 text-sm">
                ボールをタップして、AIにあなたの興味を教えてください
              </p>
            ) : (
              insights.map((insight, index) => (
                <div
                  key={index}
                  className="bg-white/10 rounded-lg p-3 text-white text-sm animate-fade-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {insight}
                </div>
              ))
            )}
          </div>
          
          {selectedBalls.length >= 2 && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                この組み合わせで企画書を生成
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for floating animations */}
      <style jsx>{`
        @keyframes float-ai-ml {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px) scale(1); }
          50% { transform: translate(-50%, -50%) translateY(-10px) scale(1); }
        }
        @keyframes float-web-dev {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px) scale(1); }
          50% { transform: translate(-50%, -50%) translateY(-8px) scale(1); }
        }
        @keyframes float-mobile {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px) scale(1); }
          50% { transform: translate(-50%, -50%) translateY(-12px) scale(1); }
        }
        @keyframes float-data {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px) scale(1); }
          50% { transform: translate(-50%, -50%) translateY(-6px) scale(1); }
        }
        @keyframes float-automation {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px) scale(1); }
          50% { transform: translate(-50%, -50%) translateY(-14px) scale(1); }
        }
        @keyframes float-iot {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px) scale(1); }
          50% { transform: translate(-50%, -50%) translateY(-9px) scale(1); }
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