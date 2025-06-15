import React from 'react';

interface SpeechBubbleProps {
  children: React.ReactNode;
  className?: string;
  type?: 'ai' | 'user';
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ children, className = '', type = 'ai' }) => {
  const isUser = type === 'user';
  
  return (
    <div className={`relative ${className}`}>
      <div className={`relative rounded-2xl p-6 shadow-lg border ${
        isUser 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300 ml-8' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Speech bubble arrow */}
        <div className={`absolute top-6 w-4 h-4 transform rotate-45 ${
          isUser 
            ? '-right-2 bg-blue-500 border-r border-b border-blue-300' 
            : '-left-2 bg-white border-l border-b border-gray-200'
        }`}></div>
        <div className="relative z-10 break-words overflow-wrap-anywhere">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SpeechBubble;