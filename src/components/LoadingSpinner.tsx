import React from 'react';
import { Brain, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  message: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-6">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className="h-6 w-6 text-blue-600 animate-pulse" />
        </div>
      </div>
      
      <div className="text-center max-w-md">
        <p className="text-gray-700 text-lg font-medium mb-2">{message}</p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
          <span>AI が最適な提案を生成中...</span>
        </div>
      </div>
      
      <div className="mt-6 flex space-x-2">
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;