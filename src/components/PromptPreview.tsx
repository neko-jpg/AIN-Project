import React, { useState } from 'react';
import { Eye, Edit3, Send, Copy, Check } from 'lucide-react';

interface PromptPreviewProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onExecute: () => void;
  isLoading: boolean;
  language: 'en' | 'ja';
}

const PromptPreview: React.FC<PromptPreviewProps> = ({
  prompt,
  onPromptChange,
  onExecute,
  isLoading,
  language
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const texts = {
    en: {
      title: 'Prompt Preview & Editor',
      description: 'Review and customize your AI prompt before execution',
      edit: 'Edit Prompt',
      save: 'Save Changes',
      execute: 'Execute Prompt',
      copy: 'Copy Prompt',
      copied: 'Copied!',
      placeholder: 'Enter your custom prompt here...'
    },
    ja: {
      title: 'プロンプトプレビュー & エディター',
      description: '実行前にAIプロンプトを確認・カスタマイズ',
      edit: 'プロンプトを編集',
      save: '変更を保存',
      execute: 'プロンプトを実行',
      copy: 'プロンプトをコピー',
      copied: 'コピーしました！',
      placeholder: 'カスタムプロンプトをここに入力...'
    }
  };

  const t = texts[language];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? t.copied : t.copy}
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              {isEditing ? t.save : t.edit}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">{t.description}</p>
      </div>

      <div className="p-4">
        {isEditing ? (
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder={t.placeholder}
            className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
          />
        ) : (
          <div className="h-64 p-3 bg-gray-50 border border-gray-200 rounded-lg overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {prompt || t.placeholder}
            </pre>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onExecute}
            disabled={isLoading || !prompt.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isLoading ? 'Executing...' : t.execute}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptPreview;