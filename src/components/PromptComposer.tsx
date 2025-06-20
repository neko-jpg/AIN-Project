import React, { useState } from 'react';
import { Plus, GripVertical, Trash2, Mic, MicOff, Edit3, Send } from 'lucide-react';
import { PromptBlock } from '../types';
import { useVoiceRecording } from '../hooks/useVoiceRecording';

interface PromptComposerProps {
  blocks: PromptBlock[];
  onBlocksChange: (blocks: PromptBlock[]) => void;
  onSendToPrompt: (combinedPrompt: string) => void;
  language: 'en' | 'ja';
}

const PromptComposer: React.FC<PromptComposerProps> = ({
  blocks,
  onBlocksChange,
  onSendToPrompt,
  language
}) => {
  const [newBlockContent, setNewBlockContent] = useState('');
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const { isRecording, startRecording, stopRecording, error } = useVoiceRecording();

  const texts = {
    en: {
      title: 'Prompt Composition',
      addBlock: 'Add prompt block',
      placeholder: 'Enter your prompt component...',
      voiceMemo: 'Voice memo',
      sendToPrompt: 'Send to Prompt',
      preview: 'Preview combined prompt',
      priority: 'Priority'
    },
    ja: {
      title: 'プロンプト構成',
      addBlock: 'プロンプトブロックを追加',
      placeholder: 'プロンプト要素を入力...',
      voiceMemo: 'ボイスメモ',
      sendToPrompt: 'プロンプトに送信',
      preview: '結合プロンプトをプレビュー',
      priority: '優先度'
    }
  };

  const t = texts[language];

  const addBlock = () => {
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
  };

  const updateBlock = (id: string, content: string) => {
    onBlocksChange(
      blocks.map(block =>
        block.id === id ? { ...block, content } : block
      )
    );
    setEditingBlock(null);
  };

  const deleteBlock = (id: string) => {
    onBlocksChange(blocks.filter(block => block.id !== id));
  };

  const reorderBlocks = (draggedId: string, targetId: string) => {
    const draggedIndex = blocks.findIndex(b => b.id === draggedId);
    const targetIndex = blocks.findIndex(b => b.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(targetIndex, 0, draggedBlock);

    // Update priorities
    const updatedBlocks = newBlocks.map((block, index) => ({
      ...block,
      priority: index
    }));

    onBlocksChange(updatedBlocks);
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        // Simulate transcription (in real app, you'd use speech-to-text API)
        const transcription = language === 'en' 
          ? '[Voice memo transcription would appear here]'
          : '[ボイスメモの転写がここに表示されます]';
        
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
  };

  const generateCombinedPrompt = () => {
    const sortedBlocks = [...blocks].sort((a, b) => a.priority - b.priority);
    return sortedBlocks.map(block => block.content).join('\n\n');
  };

  const handleSendToPrompt = () => {
    const combinedPrompt = generateCombinedPrompt();
    onSendToPrompt(combinedPrompt);
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.title}</h3>
        
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
          
          {/* Voice recording button */}
          <button
            onClick={handleVoiceRecording}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              isRecording
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            <span className="text-sm">
              {isRecording ? 'Stop Recording' : t.voiceMemo}
            </span>
          </button>
          
          {error && (
            <p className="text-red-600 text-xs">{error}</p>
          )}
        </div>
      </div>

      {/* Blocks list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {blocks.map((block, index) => (
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
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
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
                    <Mic className="h-3 w-3 text-blue-500" />
                  )}
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
                  onClick={() => setEditingBlock(block.id)}
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
      </div>

      {/* Send to prompt button */}
      {blocks.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSendToPrompt}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
          >
            <Send className="h-4 w-4" />
            {t.sendToPrompt}
          </button>
        </div>
      )}
    </div>
  );
};

export default PromptComposer;