import React from 'react';

interface SpeechBubbleProps {
  children: React.ReactNode;
  className?: string;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative">
        {/* Speech bubble arrow */}
        <div className="absolute -left-2 top-6 w-4 h-4 bg-white border-l border-b border-gray-200 transform rotate-45"></div>
        {children}
      </div>
    </div>
  );
};

export default SpeechBubble;