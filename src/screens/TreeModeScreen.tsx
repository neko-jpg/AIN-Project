// src/screens/TreeModeScreen.tsx
// 木モード - ツリー構造でプロジェクト要素を整理

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, GitBranch, Leaf, TreePine, Zap, Database, Shield, Smartphone, Globe, Brain } from 'lucide-react';

interface TreeNode {
  id: string;
  label: string;
  icon: React.ReactNode;
  level: number;
  parentId?: string;
  children: string[];
  isExpanded: boolean;
  isSelected: boolean;
  color: string;
  description: string;
}

interface TreeModeScreenProps {
  onBack: () => void;
}

const TreeModeScreen: React.FC<TreeModeScreenProps> = ({ onBack }) => {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialize tree structure
  useEffect(() => {
    const initialNodes: TreeNode[] = [
      {
        id: 'root',
        label: 'AIプロジェクト',
        icon: <TreePine className="h-6 w-6" />,
        level: 0,
        children: ['frontend', 'backend', 'ai-core', 'infrastructure'],
        isExpanded: true,
        isSelected: false,
        color: 'from-green-600 to-green-800',
        description: 'プロジェクトの全体構成'
      },
      {
        id: 'frontend',
        label: 'フロントエンド',
        icon: <Globe className="h-5 w-5" />,
        level: 1,
        parentId: 'root',
        children: ['react', 'mobile-app'],
        isExpanded: false,
        isSelected: false,
        color: 'from-blue-500 to-blue-700',
        description: 'ユーザーインターフェース'
      },
      {
        id: 'backend',
        label: 'バックエンド',
        icon: <Database className="h-5 w-5" />,
        level: 1,
        parentId: 'root',
        children: ['api', 'database'],
        isExpanded: false,
        isSelected: false,
        color: 'from-purple-500 to-purple-700',
        description: 'サーバーサイド処理'
      },
      {
        id: 'ai-core',
        label: 'AI・機械学習',
        icon: <Brain className="h-5 w-5" />,
        level: 1,
        parentId: 'root',
        children: ['model-training', 'inference'],
        isExpanded: false,
        isSelected: false,
        color: 'from-orange-500 to-orange-700',
        description: 'AI機能の中核'
      },
      {
        id: 'infrastructure',
        label: 'インフラ',
        icon: <Shield className="h-5 w-5" />,
        level: 1,
        parentId: 'root',
        children: ['cloud', 'security'],
        isExpanded: false,
        isSelected: false,
        color: 'from-gray-500 to-gray-700',
        description: 'システム基盤'
      },
      // Level 2 nodes
      {
        id: 'react',
        label: 'React Web App',
        icon: <Leaf className="h-4 w-4" />,
        level: 2,
        parentId: 'frontend',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-cyan-400 to-cyan-600',
        description: 'Reactベースのウェブアプリケーション'
      },
      {
        id: 'mobile-app',
        label: 'モバイルアプリ',
        icon: <Smartphone className="h-4 w-4" />,
        level: 2,
        parentId: 'frontend',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-pink-400 to-pink-600',
        description: 'iOS/Androidアプリ'
      },
      {
        id: 'api',
        label: 'REST API',
        icon: <Zap className="h-4 w-4" />,
        level: 2,
        parentId: 'backend',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-indigo-400 to-indigo-600',
        description: 'RESTful API設計'
      },
      {
        id: 'database',
        label: 'データベース',
        icon: <Database className="h-4 w-4" />,
        level: 2,
        parentId: 'backend',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-emerald-400 to-emerald-600',
        description: 'データ永続化層'
      },
      {
        id: 'model-training',
        label: 'モデル学習',
        icon: <Brain className="h-4 w-4" />,
        level: 2,
        parentId: 'ai-core',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-yellow-400 to-yellow-600',
        description: '機械学習モデルの訓練'
      },
      {
        id: 'inference',
        label: '推論エンジン',
        icon: <Zap className="h-4 w-4" />,
        level: 2,
        parentId: 'ai-core',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-red-400 to-red-600',
        description: 'リアルタイム推論処理'
      },
      {
        id: 'cloud',
        label: 'クラウド基盤',
        icon: <Globe className="h-4 w-4" />,
        level: 2,
        parentId: 'infrastructure',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-blue-400 to-blue-600',
        description: 'AWS/GCP/Azure'
      },
      {
        id: 'security',
        label: 'セキュリティ',
        icon: <Shield className="h-4 w-4" />,
        level: 2,
        parentId: 'infrastructure',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-gray-400 to-gray-600',
        description: '認証・認可・暗号化'
      }
    ];
    setNodes(initialNodes);
  }, []);

  // Toggle node expansion
  const toggleNode = (nodeId: string) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, isExpanded: !node.isExpanded }
        : node
    ));
  };

  // Select/deselect node
  const selectNode = (nodeId: string) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, isSelected: !node.isSelected }
        : node
    ));

    // Update selected path
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      if (selectedPath.includes(nodeId)) {
        setSelectedPath(prev => prev.filter(id => id !== nodeId));
      } else {
        setSelectedPath(prev => [...prev, nodeId]);
        triggerAIAnalysis(nodeId);
      }
    }
  };

  // Simulate AI analysis
  const triggerAIAnalysis = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setIsAnalyzing(true);
    
    setTimeout(() => {
      const suggestions = [
        `🌟 ${node.label}の実装に最適なツールを提案します`,
        `🔗 ${node.label}と他のコンポーネントの連携方法`,
        `⚡ ${node.label}のパフォーマンス最適化案`,
        `🛡️ ${node.label}のセキュリティ考慮事項`
      ];
      
      setAiSuggestions(prev => [...prev.slice(-2), ...suggestions.slice(0, 2)]);
      setIsAnalyzing(false);
    }, 1500);
  };

  // Render tree connections
  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    nodes.forEach(node => {
      if (node.parentId) {
        const parent = nodes.find(n => n.id === node.parentId);
        if (parent && parent.isExpanded) {
          const parentLevel = parent.level;
          const nodeLevel = node.level;
          
          connections.push(
            <div
              key={`connection-${node.id}`}
              className="absolute border-l-2 border-white/30"
              style={{
                left: `${20 + parentLevel * 40}px`,
                top: `${60 + parentLevel * 80 + 40}px`,
                height: `${(nodeLevel - parentLevel) * 80 - 20}px`,
                width: '20px',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
                borderBottomLeftRadius: '8px'
              }}
            />
          );
        }
      }
    });
    
    return connections;
  };

  // Get visible nodes (considering expansion state)
  const getVisibleNodes = () => {
    const visible: TreeNode[] = [];
    
    const addNodeAndChildren = (nodeId: string) => {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        visible.push(node);
        if (node.isExpanded) {
          node.children.forEach(childId => addNodeAndChildren(childId));
        }
      }
    };
    
    addNodeAndChildren('root');
    return visible;
  };

  const visibleNodes = getVisibleNodes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
      {/* Header */}
      <div className="p-4 lg:p-6">
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
              木モード
            </h1>
            <p className="text-white/80 text-sm lg:text-base">
              プロジェクトの構成要素をツリーで整理し、AIが最適な組み合わせを提案
            </p>
          </div>
          
          <div className="w-20" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 px-4 lg:px-6">
        {/* Tree Visualization */}
        <div className="flex-1">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 min-h-[60vh]">
            <div className="relative">
              {renderConnections()}
              
              {visibleNodes.map((node, index) => (
                <div
                  key={node.id}
                  className="relative flex items-center mb-4 animate-fade-in"
                  style={{
                    marginLeft: `${node.level * 40}px`,
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  {/* Expand/Collapse button */}
                  {node.children.length > 0 && (
                    <button
                      onClick={() => toggleNode(node.id)}
                      className="mr-3 p-1 text-white/60 hover:text-white transition-colors"
                    >
                      {node.isExpanded ? (
                        <Minus className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  
                  {/* Node */}
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      node.isSelected 
                        ? 'bg-white/20 border-2 border-white shadow-lg' 
                        : 'bg-white/10 border border-white/30 hover:bg-white/15'
                    }`}
                    onClick={() => selectNode(node.id)}
                  >
                    <div className={`p-2 bg-gradient-to-r ${node.color} rounded-lg text-white`}>
                      {node.icon}
                    </div>
                    <div>
                      <div className="text-white font-medium">{node.label}</div>
                      <div className="text-white/60 text-xs">{node.description}</div>
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  {node.isSelected && (
                    <div className="absolute -right-2 -top-2">
                      <div className="w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Analysis Panel */}
        <div className="lg:w-80">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <GitBranch className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg">AI構成分析</h3>
              {isAnalyzing && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              )}
            </div>
            
            {/* Selected components */}
            <div className="mb-6">
              <h4 className="text-white/80 text-sm font-medium mb-2">選択中のコンポーネント</h4>
              <div className="space-y-2">
                {selectedPath.length === 0 ? (
                  <p className="text-white/60 text-sm">コンポーネントを選択してください</p>
                ) : (
                  selectedPath.map(nodeId => {
                    const node = nodes.find(n => n.id === nodeId);
                    return node ? (
                      <div key={nodeId} className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                        <div className={`p-1 bg-gradient-to-r ${node.color} rounded text-white`}>
                          {node.icon}
                        </div>
                        <span className="text-white text-sm">{node.label}</span>
                      </div>
                    ) : null;
                  })
                )}
              </div>
            </div>
            
            {/* AI Suggestions */}
            <div className="mb-6">
              <h4 className="text-white/80 text-sm font-medium mb-2">AI提案</h4>
              <div className="space-y-2">
                {aiSuggestions.length === 0 ? (
                  <p className="text-white/60 text-sm">
                    コンポーネントを選択すると、AIが最適化提案を行います
                  </p>
                ) : (
                  aiSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="bg-white/10 rounded-lg p-3 text-white text-sm animate-fade-in"
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      {suggestion}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Generate button */}
            {selectedPath.length >= 2 && (
              <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-6 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                この構成で企画書を生成
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TreeModeScreen;