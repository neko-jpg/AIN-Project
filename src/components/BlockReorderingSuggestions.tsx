import React, { useState, useEffect } from 'react';
import { Brain, ArrowUp, ArrowDown, CheckCircle, RotateCcw } from 'lucide-react';
import { PromptBlock } from '../types';

interface BlockReorderingSuggestionsProps {
  blocks: PromptBlock[];
  onApplyReorder: (reorderedBlocks: PromptBlock[]) => void;
  language: 'en' | 'ja';
}

interface ReorderSuggestion {
  id: string;
  reason: string;
  confidence: number;
  newOrder: PromptBlock[];
}

const BlockReorderingSuggestions: React.FC<BlockReorderingSuggestionsProps> = ({
  blocks,
  onApplyReorder,
  language
}) => {
  const [suggestions, setSuggestions] = useState<ReorderSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const texts = {
    en: {
      title: 'Smart Reordering Suggestions',
      analyzing: 'Analyzing block relationships...',
      confidence: 'Confidence',
      preview: 'Preview Order',
      apply: 'Apply This Order',
      reset: 'Reset to Original',
      noSuggestions: 'No reordering suggestions available',
      reasons: {
        contextFirst: 'Move context and background information to the beginning',
        requirementsAfterContext: 'Place requirements after context for better flow',
        technicalLast: 'Technical details work better at the end',
        priorityBased: 'Reorder based on implementation priority',
        semanticGrouping: 'Group semantically related blocks together'
      }
    },
    ja: {
      title: 'スマート並び替え提案',
      analyzing: 'ブロック関係を分析中...',
      confidence: '信頼度',
      preview: '順序プレビュー',
      apply: 'この順序を適用',
      reset: '元に戻す',
      noSuggestions: '並び替え提案がありません',
      reasons: {
        contextFirst: 'コンテキストと背景情報を最初に移動',
        requirementsAfterContext: 'より良いフローのためにコンテキストの後に要件を配置',
        technicalLast: '技術的詳細は最後の方が効果的',
        priorityBased: '実装優先度に基づいて並び替え',
        semanticGrouping: '意味的に関連するブロックをグループ化'
      }
    }
  };

  const t = texts[language];

  useEffect(() => {
    if (blocks.length >= 2) {
      analyzeBlocks();
    }
  }, [blocks]);

  const analyzeBlocks = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const newSuggestions: ReorderSuggestion[] = [];
      
      // Analyze block content for semantic patterns
      const contextBlocks = blocks.filter(block => 
        /context|background|overview|introduction/i.test(block.content) ||
        /コンテキスト|背景|概要|導入/.test(block.content)
      );
      
      const requirementBlocks = blocks.filter(block =>
        /requirement|feature|function|need|must/i.test(block.content) ||
        /要件|機能|必要|仕様/.test(block.content)
      );
      
      const technicalBlocks = blocks.filter(block =>
        /technical|implementation|code|api|database/i.test(block.content) ||
        /技術|実装|コード|API|データベース/.test(block.content)
      );

      // Suggestion 1: Context-first ordering
      if (contextBlocks.length > 0) {
        const reordered = [
          ...contextBlocks,
          ...blocks.filter(b => !contextBlocks.includes(b))
        ].map((block, index) => ({ ...block, priority: index }));
        
        newSuggestions.push({
          id: 'context-first',
          reason: t.reasons.contextFirst,
          confidence: 85,
          newOrder: reordered
        });
      }

      // Suggestion 2: Logical flow (context → requirements → technical)
      if (contextBlocks.length > 0 && requirementBlocks.length > 0) {
        const otherBlocks = blocks.filter(b => 
          !contextBlocks.includes(b) && 
          !requirementBlocks.includes(b) && 
          !technicalBlocks.includes(b)
        );
        
        const reordered = [
          ...contextBlocks,
          ...requirementBlocks,
          ...otherBlocks,
          ...technicalBlocks
        ].map((block, index) => ({ ...block, priority: index }));
        
        newSuggestions.push({
          id: 'logical-flow',
          reason: t.reasons.requirementsAfterContext,
          confidence: 92,
          newOrder: reordered
        });
      }

      // Suggestion 3: Priority-based ordering
      const priorityOrder = [...blocks].sort((a, b) => {
        const aScore = getBlockPriorityScore(a);
        const bScore = getBlockPriorityScore(b);
        return bScore - aScore;
      }).map((block, index) => ({ ...block, priority: index }));
      
      if (JSON.stringify(priorityOrder) !== JSON.stringify(blocks)) {
        newSuggestions.push({
          id: 'priority-based',
          reason: t.reasons.priorityBased,
          confidence: 78,
          newOrder: priorityOrder
        });
      }

      setSuggestions(newSuggestions);
      setIsAnalyzing(false);
    }, 1500);
  };

  const getBlockPriorityScore = (block: PromptBlock): number => {
    let score = 0;
    const content = block.content.toLowerCase();
    
    // Context and background get high priority
    if (/context|background|overview/.test(content)) score += 10;
    
    // Requirements and features get medium-high priority
    if (/requirement|feature|function/.test(content)) score += 8;
    
    // Goals and objectives get high priority
    if (/goal|objective|purpose/.test(content)) score += 9;
    
    // Technical details get lower priority
    if (/technical|implementation|code/.test(content)) score += 3;
    
    // Longer blocks might be more important
    score += Math.min(5, block.content.length / 100);
    
    return score;
  };

  const applySuggestion = (suggestion: ReorderSuggestion) => {
    onApplyReorder(suggestion.newOrder);
    setSelectedSuggestion(null);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 75) return 'text-blue-600 bg-blue-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (isAnalyzing) {
    return (
      <div className="p-4 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
          <span className="text-blue-800">{t.analyzing}</span>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3 text-gray-600">
          <Brain className="h-5 w-5" />
          <span>{t.noSuggestions}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border-b border-green-200">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="h-5 w-5 text-green-600" />
        <h4 className="font-medium text-green-900">{t.title}</h4>
      </div>
      
      <div className="space-y-3">
        {suggestions.map(suggestion => (
          <div
            key={suggestion.id}
            className="bg-white rounded-lg border border-green-200 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm text-gray-700 mb-2">{suggestion.reason}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{t.confidence}:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                    {suggestion.confidence}%
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSuggestion(
                    selectedSuggestion === suggestion.id ? null : suggestion.id
                  )}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  {t.preview}
                </button>
                <button
                  onClick={() => applySuggestion(suggestion)}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                >
                  {t.apply}
                </button>
              </div>
            </div>
            
            {selectedSuggestion === suggestion.id && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 mb-2">{t.preview}:</h5>
                <div className="space-y-2">
                  {suggestion.newOrder.map((block, index) => (
                    <div key={block.id} className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 truncate">
                        {block.content.substring(0, 60)}...
                      </span>
                      {index !== blocks.findIndex(b => b.id === block.id) && (
                        <div className="flex items-center gap-1 text-orange-600">
                          {index < blocks.findIndex(b => b.id === block.id) ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockReorderingSuggestions;