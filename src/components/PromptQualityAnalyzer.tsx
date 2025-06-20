import React from 'react';
import { Target, CheckCircle, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { PromptBlock } from '../types';

interface PromptQualityAnalyzerProps {
  blocks: PromptBlock[];
  language: 'en' | 'ja';
}

interface QualityMetric {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
  suggestions: string[];
}

const PromptQualityAnalyzer: React.FC<PromptQualityAnalyzerProps> = ({ blocks, language }) => {
  const texts = {
    en: {
      title: 'Prompt Quality Analysis',
      overallScore: 'Overall Score',
      metrics: 'Quality Metrics',
      suggestions: 'Improvement Suggestions',
      clarity: 'Clarity & Specificity',
      structure: 'Structure & Organization',
      context: 'Context & Background',
      completeness: 'Completeness',
      excellent: 'Excellent',
      good: 'Good',
      needsWork: 'Needs Work'
    },
    ja: {
      title: 'プロンプト品質分析',
      overallScore: '総合スコア',
      metrics: '品質指標',
      suggestions: '改善提案',
      clarity: '明確性・具体性',
      structure: '構造・整理',
      context: 'コンテキスト・背景',
      completeness: '完全性',
      excellent: '優秀',
      good: '良好',
      needsWork: '要改善'
    }
  };

  const t = texts[language];

  const analyzeQuality = (): { metrics: QualityMetric[]; overallScore: number } => {
    const metrics: QualityMetric[] = [];
    
    // Clarity & Specificity
    const totalLength = blocks.reduce((sum, block) => sum + block.content.length, 0);
    const avgLength = blocks.length > 0 ? totalLength / blocks.length : 0;
    const clarityScore = Math.min(25, Math.floor(avgLength / 10));
    
    metrics.push({
      name: t.clarity,
      score: clarityScore,
      maxScore: 25,
      feedback: clarityScore >= 20 ? t.excellent : clarityScore >= 15 ? t.good : t.needsWork,
      suggestions: clarityScore < 20 ? [
        language === 'en' ? 'Add more specific details' : 'より具体的な詳細を追加',
        language === 'en' ? 'Use precise terminology' : '正確な用語を使用'
      ] : []
    });

    // Structure & Organization
    const structureScore = Math.min(25, blocks.length * 5);
    metrics.push({
      name: t.structure,
      score: structureScore,
      maxScore: 25,
      feedback: structureScore >= 20 ? t.excellent : structureScore >= 15 ? t.good : t.needsWork,
      suggestions: structureScore < 20 ? [
        language === 'en' ? 'Break down into more components' : 'より多くの要素に分解',
        language === 'en' ? 'Organize by priority' : '優先度で整理'
      ] : []
    });

    // Context & Background
    const hasContext = blocks.some(block => 
      /context|background|goal|objective|purpose/i.test(block.content) ||
      /コンテキスト|背景|目標|目的/.test(block.content)
    );
    const contextScore = hasContext ? 25 : 10;
    
    metrics.push({
      name: t.context,
      score: contextScore,
      maxScore: 25,
      feedback: contextScore >= 20 ? t.excellent : t.needsWork,
      suggestions: contextScore < 20 ? [
        language === 'en' ? 'Add project context' : 'プロジェクトのコンテキストを追加',
        language === 'en' ? 'Specify goals and constraints' : '目標と制約を明記'
      ] : []
    });

    // Completeness
    const hasRequirements = blocks.some(block => 
      /requirement|feature|function|need/i.test(block.content) ||
      /要件|機能|必要/.test(block.content)
    );
    const completenessScore = hasRequirements ? 25 : 15;
    
    metrics.push({
      name: t.completeness,
      score: completenessScore,
      maxScore: 25,
      feedback: completenessScore >= 20 ? t.excellent : t.good,
      suggestions: completenessScore < 20 ? [
        language === 'en' ? 'Include functional requirements' : '機能要件を含める',
        language === 'en' ? 'Add technical constraints' : '技術的制約を追加'
      ] : []
    });

    const overallScore = metrics.reduce((sum, metric) => sum + metric.score, 0);
    
    return { metrics, overallScore };
  };

  const { metrics, overallScore } = analyzeQuality();

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Target className="h-6 w-6 text-purple-600" />
        <h3 className="text-xl font-semibold text-gray-900">{t.title}</h3>
      </div>

      {/* Overall Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-medium text-gray-900">{t.overallScore}</span>
          <span className={`text-2xl font-bold ${getScoreColor(overallScore, 100)}`}>
            {overallScore}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              overallScore >= 80 ? 'bg-green-500' :
              overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${overallScore}%` }}
          />
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">{t.metrics}</h4>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{metric.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getScoreColor(metric.score, metric.maxScore)}`}>
                    {metric.score}/{metric.maxScore}
                  </span>
                  {metric.score >= metric.maxScore * 0.8 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    metric.score >= metric.maxScore * 0.8 ? 'bg-green-500' :
                    metric.score >= metric.maxScore * 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(metric.score / metric.maxScore) * 100}%` }}
                />
              </div>
              
              <p className={`text-sm px-2 py-1 rounded ${getScoreBg(metric.score, metric.maxScore)}`}>
                {metric.feedback}
              </p>
              
              {metric.suggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {metric.suggestions.map((suggestion, suggestionIndex) => (
                    <div key={suggestionIndex} className="flex items-start gap-2 text-sm text-gray-600">
                      <Lightbulb className="h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Overall Suggestions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">{t.suggestions}</span>
        </div>
        <div className="space-y-1 text-sm text-blue-800">
          {overallScore < 60 && (
            <p>• {language === 'en' ? 'Focus on adding more detailed context and requirements' : 'より詳細なコンテキストと要件の追加に重点を置く'}</p>
          )}
          {blocks.length < 3 && (
            <p>• {language === 'en' ? 'Break down your prompt into more specific components' : 'プロンプトをより具体的な要素に分解する'}</p>
          )}
          {overallScore >= 80 && (
            <p>• {language === 'en' ? 'Excellent! Your prompt is well-structured and comprehensive' : '素晴らしい！プロンプトは良く構造化され包括的です'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptQualityAnalyzer;