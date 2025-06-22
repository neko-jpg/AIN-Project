import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Plus, GripVertical, Trash2, Mic, MicOff, Edit3, Send, 
  Zap, Brain, Star, ChevronDown, ChevronUp, Sparkles,
  FileText, Target, AlertCircle, CheckCircle, RotateCcw,
  Download, Upload, Lightbulb, TrendingUp, Clock, Eye,
  Copy, Check, Shuffle, ArrowRight, Play, Layers,
  Settings, Filter, SortAsc, SortDesc, Archive
} from 'lucide-react';
import { PromptBlock, PromptTemplate } from '../types';
import { useVoiceRecording } from '../hooks/useVoiceRecording';

interface EnhancedPromptComposerProps {
  blocks: PromptBlock[];
  onBlocksChange: (blocks: PromptBlock[]) => void;
  onSendToPrompt: (combinedPrompt: string) => void;
  language: 'en' | 'ja';
  developmentTime?: number;
}

const EnhancedPromptComposer: React.FC<EnhancedPromptComposerProps> = ({
  blocks,
  onBlocksChange,
  onSendToPrompt,
  language,
  developmentTime = 6
}) => {
  const [newBlockContent, setNewBlockContent] = useState('');
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showQualityAnalysis, setShowQualityAnalysis] = useState(false);
  const [showReorderSuggestions, setShowReorderSuggestions] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedPrompt, setCompressedPrompt] = useState<string | null>(null);
  const [qualityScore, setQualityScore] = useState<number>(0);
  const [qualityFeedback, setQualityFeedback] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [suggestedOrder, setSuggestedOrder] = useState<PromptBlock[] | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'timestamp' | 'length'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const { isRecording, startRecording, stopRecording, error } = useVoiceRecording();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const texts = {
    en: {
      title: 'Enhanced Prompt Composer',
      addBlock: 'Add prompt block',
      placeholder: 'Enter your prompt component...',
      voiceMemo: 'Voice memo',
      sendToPrompt: 'Send to Prompt',
      compress: 'Compress Prompt',
      reorder: 'Smart Reorder',
      templates: 'Templates',
      quality: 'Quality Analysis',
      priority: 'Priority',
      compressed: 'Compressed Version',
      originalBlocks: 'Original Blocks',
      useCompressed: 'Use Compressed',
      useOriginal: 'Use Original',
      qualityScore: 'Quality Score',
      suggestions: 'Suggestions',
      uploadAudio: 'Upload Audio File',
      processing: 'Processing...',
      reorderSuggestion: 'Suggested Order',
      applyReorder: 'Apply Suggestion',
      exportBlocks: 'Export Blocks',
      importBlocks: 'Import Blocks',
      preview: 'Preview Combined',
      copy: 'Copy',
      copied: 'Copied!',
      noBlocks: 'No blocks yet',
      addFirstBlock: 'Add your first prompt component above',
      dragToReorder: 'Drag to reorder blocks by priority',
      voiceTranscription: 'Voice transcription',
      analyzing: 'Analyzing...',
      optimizing: 'Optimizing order...',
      filter: 'Filter',
      sort: 'Sort',
      collapse: 'Collapse',
      expand: 'Expand',
      bulkActions: 'Bulk Actions',
      selectAll: 'Select All',
      deleteSelected: 'Delete Selected',
      archiveSelected: 'Archive Selected',
      all: 'All',
      text: 'Text',
      voice: 'Voice',
      template: 'Template',
      prioritySort: 'Priority',
      timestampSort: 'Created',
      lengthSort: 'Length'
    },
    ja: {
      title: '高度なプロンプト構成ツール',
      addBlock: 'プロンプトブロックを追加',
      placeholder: 'プロンプト要素を入力...',
      voiceMemo: 'ボイスメモ',
      sendToPrompt: 'プロンプトに送信',
      compress: 'プロンプト圧縮',
      reorder: 'スマート並び替え',
      templates: 'テンプレート',
      quality: '品質分析',
      priority: '優先度',
      compressed: '圧縮版',
      originalBlocks: '元のブロック',
      useCompressed: '圧縮版を使用',
      useOriginal: '元のブロックを使用',
      qualityScore: '品質スコア',
      suggestions: '提案',
      uploadAudio: '音声ファイルをアップロード',
      processing: '処理中...',
      reorderSuggestion: '推奨順序',
      applyReorder: '提案を適用',
      exportBlocks: 'ブロックをエクスポート',
      importBlocks: 'ブロックをインポート',
      preview: '結合プレビュー',
      copy: 'コピー',
      copied: 'コピーしました！',
      noBlocks: 'ブロックがありません',
      addFirstBlock: '上記で最初のプロンプト要素を追加してください',
      dragToReorder: 'ドラッグして優先度順に並び替え',
      voiceTranscription: '音声転写',
      analyzing: '分析中...',
      optimizing: '順序を最適化中...',
      filter: 'フィルター',
      sort: '並び替え',
      collapse: '折りたたみ',
      expand: '展開',
      bulkActions: '一括操作',
      selectAll: 'すべて選択',
      deleteSelected: '選択項目を削除',
      archiveSelected: '選択項目をアーカイブ',
      all: 'すべて',
      text: 'テキスト',
      voice: '音声',
      template: 'テンプレート',
      prioritySort: '優先度',
      timestampSort: '作成日時',
      lengthSort: '文字数'
    }
  };

  const t = texts[language];

  // Calculate quality score based on blocks
  useEffect(() => {
    const calculateQuality = () => {
      if (blocks.length === 0) return 0;
      
      let score = 0;
      let feedback: string[] = [];
      
      // Length and completeness (30%)
      const totalLength = blocks.reduce((sum, block) => sum + block.content.length, 0);
      if (totalLength > 200) score += 30;
      else if (totalLength > 100) score += 20;
      else if (totalLength > 50) score += 10;
      else feedback.push(language === 'en' ? 'Add more detail to your prompts' : 'プロンプトにより詳細を追加してください');
      
      // Diversity of content (25%)
      const uniqueWords = new Set(
        blocks.flatMap(block => 
          block.content.toLowerCase().split(/\s+/).filter(word => word.length > 3)
        )
      );
      if (uniqueWords.size > 30) score += 25;
      else if (uniqueWords.size > 20) score += 20;
      else if (uniqueWords.size > 10) score += 15;
      else feedback.push(language === 'en' ? 'Use more diverse vocabulary' : 'より多様な語彙を使用してください');
      
      // Structure and organization (25%)
      if (blocks.length >= 5) score += 25;
      else if (blocks.length >= 3) score += 20;
      else if (blocks.length >= 2) score += 15;
      else feedback.push(language === 'en' ? 'Break down into more specific components' : 'より具体的な要素に分解してください');
      
      // Context and specificity (20%)
      const hasContext = blocks.some(block => 
        block.content.includes(language === 'en' ? 'context' : 'コンテキスト') ||
        block.content.includes(language === 'en' ? 'background' : '背景') ||
        block.content.includes(language === 'en' ? 'goal' : '目標') ||
        block.content.includes(language === 'en' ? 'requirement' : '要件')
      );
      if (hasContext) score += 20;
      else feedback.push(language === 'en' ? 'Add context and specific goals' : 'コンテキストと具体的な目標を追加してください');
      
      setQualityScore(Math.min(100, score));
      setQualityFeedback(feedback);
    };
    
    calculateQuality();
  }, [blocks, language]);

  const addBlock = useCallback(() => {
    if (!newBlockContent.trim()) return;

    const newBlock: PromptBlock = {
      id: Date.now().toString(),
      content: newBlockContent.trim(),
      priority: blocks.length,
      timestamp: new Date(),
      type: 'text'
    };

    onBlocksChange([...blocks, newBlock]);
    setNewBlockContent('');
  }, [newBlockContent, blocks, onBlocksChange]);

  const updateBlock = useCallback((id: string, content: string) => {
    onBlocksChange(
      blocks.map(block =>
        block.id === id ? { ...block, content } : block
      )
    );
    setEditingBlock(null);
  }, [blocks, onBlocksChange]);

  const deleteBlock = useCallback((id: string) => {
    onBlocksChange(blocks.filter(block => block.id !== id));
  }, [blocks, onBlocksChange]);

  const reorderBlocks = useCallback((draggedId: string, targetId: string) => {
    const draggedIndex = blocks.findIndex(b => b.id === draggedId);
    const targetIndex = blocks.findIndex(b => b.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(targetIndex, 0, draggedBlock);

    const updatedBlocks = newBlocks.map((block, index) => ({
      ...block,
      priority: index
    }));

    onBlocksChange(updatedBlocks);
  }, [blocks, onBlocksChange]);

  // AI-powered prompt compression
  const compressPrompt = useCallback(async () => {
    setIsCompressing(true);
    try {
      const combinedPrompt = blocks
        .sort((a, b) => a.priority - b.priority)
        .map(block => block.content)
        .join('\n\n');
      
      // Simulate AI compression with intelligent summarization
      setTimeout(() => {
        const keyPoints = blocks.map(block => {
          // Extract key information from each block
          const sentences = block.content.split(/[.!?]+/).filter(s => s.trim().length > 10);
          return sentences[0]?.trim() || block.content.substring(0, 50);
        });
        
        const compressed = keyPoints.join('. ') + '.';
        setCompressedPrompt(compressed);
        setIsCompressing(false);
      }, 2000);
      
    } catch (error) {
      console.error('Compression failed:', error);
      setIsCompressing(false);
    }
  }, [blocks]);

  // AI-powered semantic reordering
  const suggestReorder = useCallback(async () => {
    if (blocks.length < 2) return;
    
    setShowReorderSuggestions(true);
    
    // Simulate AI analysis for optimal ordering
    setTimeout(() => {
      const reordered = [...blocks].sort((a, b) => {
        // Prioritize context and background first
        const aIsContext = /context|background|overview|introduction/i.test(a.content);
        const bIsContext = /context|background|overview|introduction/i.test(b.content);
        if (aIsContext && !bIsContext) return -1;
        if (!aIsContext && bIsContext) return 1;
        
        // Then requirements and goals
        const aIsRequirement = /requirement|goal|objective|need/i.test(a.content);
        const bIsRequirement = /requirement|goal|objective|need/i.test(b.content);
        if (aIsRequirement && !bIsRequirement) return -1;
        if (!aIsRequirement && bIsRequirement) return 1;
        
        // Technical details last
        const aIsTechnical = /technical|implementation|code|api/i.test(a.content);
        const bIsTechnical = /technical|implementation|code|api/i.test(b.content);
        if (aIsTechnical && !bIsTechnical) return 1;
        if (!aIsTechnical && bIsTechnical) return -1;
        
        return 0;
      }).map((block, index) => ({ ...block, priority: index }));
      
      setSuggestedOrder(reordered);
    }, 1500);
  }, [blocks]);

  const applyReorder = useCallback(() => {
    if (suggestedOrder) {
      onBlocksChange(suggestedOrder);
      setSuggestedOrder(null);
      setShowReorderSuggestions(false);
    }
  }, [suggestedOrder, onBlocksChange]);

  const handleVoiceRecording = useCallback(async () => {
    if (isRecording) {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        // Simulate voice transcription
        const transcription = language === 'en' 
          ? `Voice input: ${new Date().toLocaleTimeString()} - This is a simulated transcription of your voice memo. In a real implementation, this would be processed by a speech-to-text service.`
          : `音声入力: ${new Date().toLocaleTimeString()} - これはボイスメモのシミュレート転写です。実際の実装では、音声認識サービスで処理されます。`;
        
        const voiceBlock: PromptBlock = {
          id: Date.now().toString(),
          content: transcription,
          priority: blocks.length,
          timestamp: new Date(),
          type: 'voice'
        };

        onBlocksChange([...blocks, voiceBlock]);
      }
    } else {
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording, blocks, onBlocksChange, language]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      // Simulate audio file transcription
      const transcription = language === 'en' 
        ? `Audio file transcription: ${file.name} - This would contain the transcribed content from your uploaded audio file.`
        : `音声ファイル転写: ${file.name} - アップロードされた音声ファイルの転写内容がここに表示されます。`;
      
      const audioBlock: PromptBlock = {
        id: Date.now().toString(),
        content: transcription,
        priority: blocks.length,
        timestamp: new Date(),
        type: 'voice'
      };

      onBlocksChange([...blocks, audioBlock]);
    }
  }, [blocks, onBlocksChange, language]);

  const generateCombinedPrompt = useCallback(() => {
    const sortedBlocks = [...blocks].sort((a, b) => a.priority - b.priority);
    return sortedBlocks.map(block => block.content).join('\n\n');
  }, [blocks]);

  const handleSendToPrompt = useCallback(() => {
    const prompt = compressedPrompt || generateCombinedPrompt();
    onSendToPrompt(prompt);
  }, [compressedPrompt, generateCombinedPrompt, onSendToPrompt]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const exportBlocks = useCallback(() => {
    const dataStr = JSON.stringify(blocks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prompt-blocks.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [blocks]);

  const importBlocks = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedBlocks = JSON.parse(e.target?.result as string);
          onBlocksChange(importedBlocks);
        } catch (error) {
          console.error('Failed to import blocks:', error);
        }
      };
      reader.readAsText(file);
    }
  }, [onBlocksChange]);

  // Filter and sort blocks
  const getFilteredAndSortedBlocks = useCallback(() => {
    let filteredBlocks = [...blocks];
    
    // Apply filter
    if (filterCategory !== 'all') {
      filteredBlocks = filteredBlocks.filter(block => block.type === filterCategory);
    }
    
    // Apply sort
    filteredBlocks.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'priority':
          comparison = a.priority - b.priority;
          break;
        case 'timestamp':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'length':
          comparison = a.content.length - b.content.length;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filteredBlocks;
  }, [blocks, filterCategory, sortBy, sortOrder]);

  const filteredAndSortedBlocks = getFilteredAndSortedBlocks();

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header with enhanced controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
            <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Quality Score Badge */}
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              qualityScore >= 80 ? 'bg-green-100 text-green-800' :
              qualityScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {qualityScore}/100
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors lg:hidden"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {!isCollapsed && (
          <>
            {/* Enhanced Action buttons */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
              >
                <Eye className="h-4 w-4" />
                {t.preview}
              </button>
              
              <button
                onClick={suggestReorder}
                disabled={blocks.length < 2}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-colors text-sm"
              >
                <Shuffle className="h-4 w-4" />
                {t.reorder}
              </button>
              
              <button
                onClick={compressPrompt}
                disabled={isCompressing || blocks.length === 0}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 disabled:opacity-50 transition-colors text-sm"
              >
                <Zap className="h-4 w-4" />
                {isCompressing ? t.processing : t.compress}
              </button>
              
              <button
                onClick={() => setShowQualityAnalysis(!showQualityAnalysis)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm"
              >
                <Target className="h-4 w-4" />
                {t.quality}
              </button>
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">{t.all}</option>
                  <option value="text">{t.text}</option>
                  <option value="voice">{t.voice}</option>
                  <option value="template">{t.template}</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t.sort}:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="priority">{t.prioritySort}</option>
                  <option value="timestamp">{t.timestampSort}</option>
                  <option value="length">{t.lengthSort}</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </button>
              </div>
              
              <div className="text-sm text-gray-500 ml-auto">
                {filteredAndSortedBlocks.length} / {blocks.length} blocks
              </div>
            </div>
            
            {/* Add new block */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBlockContent}
                  onChange={(e) => setNewBlockContent(e.target.value)}
                  placeholder={t.placeholder}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addBlock()}
                />
                <button
                  onClick={addBlock}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {/* Voice and file input */}
              <div className="flex gap-2">
                <button
                  onClick={handleVoiceRecording}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm ${
                    isRecording
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isRecording ? 'Stop' : t.voiceMemo}
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                >
                  <Upload className="h-4 w-4" />
                  Audio
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              
              {error && (
                <p className="text-red-600 text-xs">{error}</p>
              )}
            </div>
          </>
        )}
      </div>

      {!isCollapsed && (
        <>
          {/* Preview Panel */}
          {showPreview && blocks.length > 0 && (
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-blue-900">{t.preview}</h4>
                <button
                  onClick={() => copyToClipboard(generateCombinedPrompt())}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? t.copied : t.copy}
                </button>
              </div>
              <div className="bg-white rounded-lg p-3 text-sm text-gray-700 border border-blue-200 max-h-32 overflow-y-auto">
                {generateCombinedPrompt()}
              </div>
            </div>
          )}

          {/* Quality Analysis Panel */}
          {showQualityAnalysis && (
            <div className="p-4 bg-purple-50 border-b border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">{t.qualityScore}: {qualityScore}/100</span>
              </div>
              
              {qualityFeedback.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-purple-900">{t.suggestions}:</h4>
                  {qualityFeedback.map((feedback, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-purple-800">
                      <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{feedback}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reorder Suggestions */}
          {showReorderSuggestions && (
            <div className="p-4 bg-green-50 border-b border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">{t.reorderSuggestion}</span>
                </div>
                {suggestedOrder && (
                  <div className="flex gap-2">
                    <button
                      onClick={applyReorder}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      {t.applyReorder}
                    </button>
                    <button
                      onClick={() => setShowReorderSuggestions(false)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              
              {!suggestedOrder ? (
                <div className="flex items-center gap-2 text-green-700">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent" />
                  <span className="text-sm">{t.optimizing}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestedOrder.map((block, index) => (
                    <div key={block.id} className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 truncate flex-1">
                        {block.content.substring(0, 60)}...
                      </span>
                      {index !== blocks.findIndex(b => b.id === block.id) && (
                        <ArrowRight className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Compressed Prompt Display */}
          {compressedPrompt && (
            <div className="p-4 bg-orange-50 border-b border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-orange-900">{t.compressed}</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(compressedPrompt)}
                    className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200 transition-colors"
                  >
                    {t.copy}
                  </button>
                  <button
                    onClick={() => setCompressedPrompt(null)}
                    className="text-orange-600 hover:text-orange-800"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 text-sm text-gray-700 border border-orange-200">
                {compressedPrompt}
              </div>
            </div>
          )}

          {/* Blocks list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredAndSortedBlocks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">{t.noBlocks}</p>
                <p className="text-xs mt-1">{t.addFirstBlock}</p>
              </div>
            ) : (
              <>
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <GripVertical className="h-3 w-3" />
                  {t.dragToReorder}
                </div>
                {filteredAndSortedBlocks.map((block, index) => (
                  <div
                    key={block.id}
                    draggable
                    onDragStart={() => setDraggedBlock(block.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedBlock && draggedBlock !== block.id) {
                        reorderBlocks(draggedBlock, block.id);
                      }
                      setDraggedBlock(null);
                    }}
                    className={`p-3 border rounded-lg cursor-move transition-all ${
                      draggedBlock === block.id
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">
                            {t.priority} {index + 1}
                          </span>
                          {block.type === 'voice' && (
                            <div className="flex items-center gap-1">
                              <Mic className="h-3 w-3 text-blue-500" />
                              <span className="text-xs text-blue-600">{t.voiceTranscription}</span>
                            </div>
                          )}
                          <div className="flex-1" />
                          <span className="text-xs text-gray-400">
                            {block.timestamp.toLocaleTimeString()}
                          </span>
                          <span className="text-xs text-gray-400">
                            {block.content.length} chars
                          </span>
                        </div>
                        {editingBlock === block.id ? (
                          <textarea
                            defaultValue={block.content}
                            onBlur={(e) => updateBlock(block.id, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                updateBlock(block.id, e.currentTarget.value);
                              }
                            }}
                            className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                            rows={3}
                            autoFocus
                          />
                        ) : (
                          <p className="text-sm text-gray-700 break-words">
                            {block.content}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingBlock(editingBlock === block.id ? null : block.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => deleteBlock(block.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Export/Import controls */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2 mb-4">
              <button
                onClick={exportBlocks}
                disabled={blocks.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                {t.exportBlocks}
              </button>
              
              <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors text-sm">
                <Upload className="h-4 w-4" />
                {t.importBlocks}
                <input
                  type="file"
                  accept=".json"
                  onChange={importBlocks}
                  className="hidden"
                />
              </label>
            </div>

            {/* Send to prompt button */}
            {blocks.length > 0 && (
              <button
                onClick={handleSendToPrompt}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <Send className="h-4 w-4" />
                {compressedPrompt ? t.useCompressed : t.sendToPrompt}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EnhancedPromptComposer;