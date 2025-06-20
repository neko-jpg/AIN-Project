import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, GitBranch, Leaf, TreePine, Zap, Database, Shield, Smartphone, Globe, Brain, Code, Cloud, Palette, Users, Settings, Target, CheckCircle } from 'lucide-react';

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
  category: 'core' | 'feature' | 'infrastructure' | 'design';
  priority: number;
}

interface TreeModeScreenProps {
  onBack: () => void;
  language: 'en' | 'ja';
}

const TreeModeScreen: React.FC<TreeModeScreenProps> = ({ onBack, language }) => {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNodeData, setNewNodeData] = useState({ label: '', description: '', category: 'feature' as const });

  const texts = {
    en: {
      title: 'Tree Mode',
      subtitle: 'Organize project elements in a tree structure and let AI suggest optimal combinations',
      back: 'Back',
      addElement: 'Add Element',
      aiAnalysis: 'AI Configuration Analysis',
      selectedComponents: 'Selected Components',
      selectComponentsPrompt: 'Please select components',
      aiSuggestions: 'AI Suggestions',
      aiSuggestionsPrompt: 'Select components and AI will provide optimization suggestions',
      generateProposal: 'Generate Proposal with This Configuration',
      addNewElement: 'Add New Element',
      elementName: 'Element Name',
      elementNamePlaceholder: 'e.g., Chat Feature',
      description: 'Description',
      descriptionPlaceholder: 'Detailed description of this element...',
      category: 'Category',
      cancel: 'Cancel',
      add: 'Add',
      categories: {
        feature: 'Feature',
        infrastructure: 'Infrastructure',
        design: 'Design',
        core: 'Core'
      },
      nodeLabels: {
        'root': 'AI Project',
        'frontend': 'Frontend',
        'backend': 'Backend',
        'ai-core': 'AI・Machine Learning',
        'infrastructure': 'Infrastructure',
        'react-app': 'React Web App',
        'mobile-app': 'Mobile App',
        'ui-design': 'UI/UX Design',
        'api-server': 'REST API',
        'database': 'Database',
        'auth-system': 'Authentication System',
        'model-training': 'Model Training',
        'inference-engine': 'Inference Engine',
        'data-pipeline': 'Data Pipeline',
        'cloud-platform': 'Cloud Platform',
        'security': 'Security',
        'monitoring': 'Monitoring'
      },
      nodeDescriptions: {
        'root': 'Overall project configuration',
        'frontend': 'User interface layer',
        'backend': 'Server-side processing',
        'ai-core': 'Core AI functionality',
        'infrastructure': 'System foundation',
        'react-app': 'React-based web application',
        'mobile-app': 'iOS/Android app',
        'ui-design': 'User experience design',
        'api-server': 'RESTful API design',
        'database': 'Data persistence layer',
        'auth-system': 'User authentication & authorization',
        'model-training': 'Machine learning model training',
        'inference-engine': 'Real-time inference processing',
        'data-pipeline': 'Data processing flow',
        'cloud-platform': 'AWS/GCP/Azure',
        'security': 'Authentication, authorization, encryption',
        'monitoring': 'System monitoring & log management'
      },
      insights: {
        coreFeature: '🎯 Good balance between core and additional features',
        infrastructure: '🏗️ Infrastructure elements included, enabling scalable design',
        design: '🎨 UX/UI considered, improving user experience',
        coreImportant: '🌟 {label} requires coordination with other components',
        featurePriority: '⚡ Consider implementation priority for {label}',
        complex: '🚀 Complex system, but achievable with phased development',
        moderate: '💡 Moderate complexity, easy to implement',
        newElement: 'New element added'
      }
    },
    ja: {
      title: '木モード',
      subtitle: 'プロジェクトの構成要素をツリー構造で整理し、AIが最適な組み合わせと実装順序を提案',
      back: '戻る',
      addElement: '要素を追加',
      aiAnalysis: 'AI構成分析',
      selectedComponents: '選択中のコンポーネント',
      selectComponentsPrompt: 'コンポーネントを選択してください',
      aiSuggestions: 'AI提案',
      aiSuggestionsPrompt: 'コンポーネントを選択すると、AIが最適化提案を行います',
      generateProposal: 'この構成で企画書を生成',
      addNewElement: '新しい要素を追加',
      elementName: '要素名',
      elementNamePlaceholder: '例: チャット機能',
      description: '説明',
      descriptionPlaceholder: 'この要素の詳細説明...',
      category: 'カテゴリ',
      cancel: 'キャンセル',
      add: '追加',
      categories: {
        feature: '機能',
        infrastructure: 'インフラ',
        design: 'デザイン',
        core: 'コア'
      },
      nodeLabels: {
        'root': 'AIプロジェクト',
        'frontend': 'フロントエンド',
        'backend': 'バックエンド',
        'ai-core': 'AI・機械学習',
        'infrastructure': 'インフラ',
        'react-app': 'React Webアプリ',
        'mobile-app': 'モバイルアプリ',
        'ui-design': 'UI/UXデザイン',
        'api-server': 'REST API',
        'database': 'データベース',
        'auth-system': '認証システム',
        'model-training': 'モデル学習',
        'inference-engine': '推論エンジン',
        'data-pipeline': 'データパイプライン',
        'cloud-platform': 'クラウド基盤',
        'security': 'セキュリティ',
        'monitoring': 'モニタリング'
      },
      nodeDescriptions: {
        'root': 'プロジェクトの全体構成',
        'frontend': 'ユーザーインターフェース層',
        'backend': 'サーバーサイド処理',
        'ai-core': 'AI機能の中核',
        'infrastructure': 'システム基盤',
        'react-app': 'Reactベースのウェブアプリケーション',
        'mobile-app': 'iOS/Androidアプリ',
        'ui-design': 'ユーザーエクスペリエンス設計',
        'api-server': 'RESTful API設計',
        'database': 'データ永続化層',
        'auth-system': 'ユーザー認証・認可',
        'model-training': '機械学習モデルの訓練',
        'inference-engine': 'リアルタイム推論処理',
        'data-pipeline': 'データ処理フロー',
        'cloud-platform': 'AWS/GCP/Azure',
        'security': '認証・認可・暗号化',
        'monitoring': 'システム監視・ログ管理'
      },
      insights: {
        coreFeature: '🎯 コア機能と追加機能のバランスが良好です',
        infrastructure: '🏗️ インフラ要素が含まれており、スケーラブルな設計が可能です',
        design: '🎨 UX/UIが考慮されており、ユーザー体験が向上します',
        coreImportant: '🌟 {label}は他のコンポーネントとの連携が重要です',
        featurePriority: '⚡ {label}の実装優先度を検討しましょう',
        complex: '🚀 複雑なシステムですが、段階的な開発で実現可能です',
        moderate: '💡 適度な複雑さで、実装しやすいプロジェクトです',
        newElement: '新しく追加された要素'
      }
    }
  };

  const t = texts[language];

  // Initialize tree structure
  useEffect(() => {
    const initialNodes: TreeNode[] = [
      {
        id: 'root',
        label: t.nodeLabels.root,
        icon: <TreePine className="h-6 w-6" />,
        level: 0,
        children: ['frontend', 'backend', 'ai-core', 'infrastructure'],
        isExpanded: true,
        isSelected: false,
        color: 'from-emerald-600 to-emerald-800',
        description: t.nodeDescriptions.root,
        category: 'core',
        priority: 1
      },
      // Level 1 - Core Components
      {
        id: 'frontend',
        label: t.nodeLabels.frontend,
        icon: <Globe className="h-5 w-5" />,
        level: 1,
        parentId: 'root',
        children: ['react-app', 'mobile-app', 'ui-design'],
        isExpanded: false,
        isSelected: false,
        color: 'from-blue-500 to-blue-700',
        description: t.nodeDescriptions.frontend,
        category: 'core',
        priority: 2
      },
      {
        id: 'backend',
        label: t.nodeLabels.backend,
        icon: <Database className="h-5 w-5" />,
        level: 1,
        parentId: 'root',
        children: ['api-server', 'database', 'auth-system'],
        isExpanded: false,
        isSelected: false,
        color: 'from-purple-500 to-purple-700',
        description: t.nodeDescriptions.backend,
        category: 'core',
        priority: 3
      },
      {
        id: 'ai-core',
        label: t.nodeLabels['ai-core'],
        icon: <Brain className="h-5 w-5" />,
        level: 1,
        parentId: 'root',
        children: ['model-training', 'inference-engine', 'data-pipeline'],
        isExpanded: false,
        isSelected: false,
        color: 'from-orange-500 to-orange-700',
        description: t.nodeDescriptions['ai-core'],
        category: 'core',
        priority: 4
      },
      {
        id: 'infrastructure',
        label: t.nodeLabels.infrastructure,
        icon: <Shield className="h-5 w-5" />,
        level: 1,
        parentId: 'root',
        children: ['cloud-platform', 'security', 'monitoring'],
        isExpanded: false,
        isSelected: false,
        color: 'from-gray-500 to-gray-700',
        description: t.nodeDescriptions.infrastructure,
        category: 'infrastructure',
        priority: 5
      },
      // Level 2 - Detailed Components
      {
        id: 'react-app',
        label: t.nodeLabels['react-app'],
        icon: <Code className="h-4 w-4" />,
        level: 2,
        parentId: 'frontend',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-cyan-400 to-cyan-600',
        description: t.nodeDescriptions['react-app'],
        category: 'feature',
        priority: 6
      },
      {
        id: 'mobile-app',
        label: t.nodeLabels['mobile-app'],
        icon: <Smartphone className="h-4 w-4" />,
        level: 2,
        parentId: 'frontend',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-pink-400 to-pink-600',
        description: t.nodeDescriptions['mobile-app'],
        category: 'feature',
        priority: 7
      },
      {
        id: 'ui-design',
        label: t.nodeLabels['ui-design'],
        icon: <Palette className="h-4 w-4" />,
        level: 2,
        parentId: 'frontend',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-rose-400 to-rose-600',
        description: t.nodeDescriptions['ui-design'],
        category: 'design',
        priority: 8
      },
      {
        id: 'api-server',
        label: t.nodeLabels['api-server'],
        icon: <Zap className="h-4 w-4" />,
        level: 2,
        parentId: 'backend',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-indigo-400 to-indigo-600',
        description: t.nodeDescriptions['api-server'],
        category: 'feature',
        priority: 9
      },
      {
        id: 'database',
        label: t.nodeLabels.database,
        icon: <Database className="h-4 w-4" />,
        level: 2,
        parentId: 'backend',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-emerald-400 to-emerald-600',
        description: t.nodeDescriptions.database,
        category: 'infrastructure',
        priority: 10
      },
      {
        id: 'auth-system',
        label: t.nodeLabels['auth-system'],
        icon: <Users className="h-4 w-4" />,
        level: 2,
        parentId: 'backend',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-violet-400 to-violet-600',
        description: t.nodeDescriptions['auth-system'],
        category: 'feature',
        priority: 11
      },
      {
        id: 'model-training',
        label: t.nodeLabels['model-training'],
        icon: <Brain className="h-4 w-4" />,
        level: 2,
        parentId: 'ai-core',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-yellow-400 to-yellow-600',
        description: t.nodeDescriptions['model-training'],
        category: 'feature',
        priority: 12
      },
      {
        id: 'inference-engine',
        label: t.nodeLabels['inference-engine'],
        icon: <Zap className="h-4 w-4" />,
        level: 2,
        parentId: 'ai-core',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-red-400 to-red-600',
        description: t.nodeDescriptions['inference-engine'],
        category: 'feature',
        priority: 13
      },
      {
        id: 'data-pipeline',
        label: t.nodeLabels['data-pipeline'],
        icon: <Settings className="h-4 w-4" />,
        level: 2,
        parentId: 'ai-core',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-amber-400 to-amber-600',
        description: t.nodeDescriptions['data-pipeline'],
        category: 'infrastructure',
        priority: 14
      },
      {
        id: 'cloud-platform',
        label: t.nodeLabels['cloud-platform'],
        icon: <Cloud className="h-4 w-4" />,
        level: 2,
        parentId: 'infrastructure',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-sky-400 to-sky-600',
        description: t.nodeDescriptions['cloud-platform'],
        category: 'infrastructure',
        priority: 15
      },
      {
        id: 'security',
        label: t.nodeLabels.security,
        icon: <Shield className="h-4 w-4" />,
        level: 2,
        parentId: 'infrastructure',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-slate-400 to-slate-600',
        description: t.nodeDescriptions.security,
        category: 'infrastructure',
        priority: 16
      },
      {
        id: 'monitoring',
        label: t.nodeLabels.monitoring,
        icon: <Target className="h-4 w-4" />,
        level: 2,
        parentId: 'infrastructure',
        children: [],
        isExpanded: false,
        isSelected: false,
        color: 'from-teal-400 to-teal-600',
        description: t.nodeDescriptions.monitoring,
        category: 'infrastructure',
        priority: 17
      }
    ];
    setNodes(initialNodes);
  }, [language]);

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

  // Add new node
  const addNewNode = () => {
    if (!newNodeData.label.trim()) return;

    const newNode: TreeNode = {
      id: `custom-${Date.now()}`,
      label: newNodeData.label,
      icon: <Leaf className="h-4 w-4" />,
      level: 2,
      parentId: 'root',
      children: [],
      isExpanded: false,
      isSelected: false,
      color: 'from-green-400 to-green-600',
      description: newNodeData.description || t.insights.newElement,
      category: newNodeData.category,
      priority: nodes.length + 1
    };

    setNodes(prev => [...prev, newNode]);
    
    // Add to root's children
    setNodes(prev => prev.map(node => 
      node.id === 'root' 
        ? { ...node, children: [...node.children, newNode.id] }
        : node
    ));

    setNewNodeData({ label: '', description: '', category: 'feature' });
    setShowAddModal(false);
  };

  // Advanced AI analysis
  const triggerAIAnalysis = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setIsAnalyzing(true);
    
    setTimeout(() => {
      const selectedNodes = nodes.filter(n => selectedPath.includes(n.id) || n.id === nodeId);
      const categories = [...new Set(selectedNodes.map(n => n.category))];
      
      let suggestions: string[] = [];
      
      // Category-based analysis
      if (categories.includes('core') && categories.includes('feature')) {
        suggestions.push(t.insights.coreFeature);
      }
      
      if (categories.includes('infrastructure')) {
        suggestions.push(t.insights.infrastructure);
      }
      
      if (categories.includes('design')) {
        suggestions.push(t.insights.design);
      }
      
      // Specific node analysis
      if (node.category === 'core') {
        suggestions.push(t.insights.coreImportant.replace('{label}', node.label));
      } else if (node.category === 'feature') {
        suggestions.push(t.insights.featurePriority.replace('{label}', node.label));
      }
      
      // Complexity analysis
      const complexity = selectedNodes.length;
      if (complexity >= 5) {
        suggestions.push(t.insights.complex);
      } else if (complexity >= 3) {
        suggestions.push(t.insights.moderate);
      }
      
      setAiSuggestions(prev => [...prev.slice(-3), ...suggestions.slice(0, 3)]);
      setIsAnalyzing(false);
    }, 1200);
  };

  // Render tree connections
  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    nodes.forEach(node => {
      if (node.parentId) {
        const parent = nodes.find(n => n.id === node.parentId);
        if (parent && parent.isExpanded) {
          connections.push(
            <div
              key={`connection-${node.id}`}
              className="absolute border-l-2 border-white/30"
              style={{
                left: `${20 + parent.level * 40}px`,
                top: `${60 + parent.level * 80 + 40}px`,
                height: `${(node.level - parent.level) * 80 - 20}px`,
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

  // Get visible nodes
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
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">{t.addElement}</span>
          </button>
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
                        ? 'bg-white/20 border-2 border-white shadow-lg shadow-white/20' 
                        : 'bg-white/10 border border-white/30 hover:bg-white/15'
                    }`}
                    onClick={() => selectNode(node.id)}
                  >
                    <div className={`p-2 bg-gradient-to-r ${node.color} rounded-lg text-white shadow-lg`}>
                      {node.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{node.label}</div>
                      <div className="text-white/60 text-xs">{node.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          node.category === 'core' ? 'bg-blue-500/20 text-blue-300' :
                          node.category === 'feature' ? 'bg-green-500/20 text-green-300' :
                          node.category === 'infrastructure' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-pink-500/20 text-pink-300'
                        }`}>
                          {t.categories[node.category]}
                        </span>
                        <span className="text-white/40 text-xs">
                          {language === 'en' ? `Priority: ${node.priority}` : `優先度: ${node.priority}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  {node.isSelected && (
                    <div className="absolute -right-2 -top-2">
                      <div className="w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
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
              <h3 className="text-white font-semibold text-lg">{t.aiAnalysis}</h3>
              {isAnalyzing && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              )}
            </div>
            
            {/* Selected components */}
            <div className="mb-6">
              <h4 className="text-white/80 text-sm font-medium mb-2">
                {t.selectedComponents} ({selectedPath.length})
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedPath.length === 0 ? (
                  <p className="text-white/60 text-sm">{t.selectComponentsPrompt}</p>
                ) : (
                  selectedPath.map(nodeId => {
                    const node = nodes.find(n => n.id === nodeId);
                    return node ? (
                      <div key={nodeId} className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                        <div className={`p-1 bg-gradient-to-r ${node.color} rounded text-white`}>
                          {node.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-white text-sm block truncate">{node.label}</span>
                          <span className={`text-xs px-1 py-0.5 rounded ${
                            node.category === 'core' ? 'bg-blue-500/20 text-blue-300' :
                            node.category === 'feature' ? 'bg-green-500/20 text-green-300' :
                            node.category === 'infrastructure' ? 'bg-purple-500/20 text-purple-300' :
                            'bg-pink-500/20 text-pink-300'
                          }`}>
                            {t.categories[node.category]}
                          </span>
                        </div>
                      </div>
                    ) : null;
                  })
                )}
              </div>
            </div>
            
            {/* AI Suggestions */}
            <div className="mb-6">
              <h4 className="text-white/80 text-sm font-medium mb-2">{t.aiSuggestions}</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {aiSuggestions.length === 0 ? (
                  <p className="text-white/60 text-sm">
                    {t.aiSuggestionsPrompt}
                  </p>
                ) : (
                  aiSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="bg-white/10 rounded-lg p-3 text-white text-sm animate-fade-in border border-white/20"
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      {suggestion}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Generate button */}
            {selectedPath.length >= 3 && (
              <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-6 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                <Target className="h-5 w-5" />
                {t.generateProposal}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Node Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t.addNewElement}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.elementName}</label>
                <input
                  type="text"
                  value={newNodeData.label}
                  onChange={(e) => setNewNodeData(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={t.elementNamePlaceholder}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.description}</label>
                <textarea
                  value={newNodeData.description}
                  onChange={(e) => setNewNodeData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  placeholder={t.descriptionPlaceholder}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.category}</label>
                <select
                  value={newNodeData.category}
                  onChange={(e) => setNewNodeData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="feature">{t.categories.feature}</option>
                  <option value="infrastructure">{t.categories.infrastructure}</option>
                  <option value="design">{t.categories.design}</option>
                  <option value="core">{t.categories.core}</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={addNewNode}
                disabled={!newNodeData.label.trim()}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t.add}
              </button>
            </div>
          </div>
        </div>
      )}

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