import React from 'react';
import { Bot, User } from 'lucide-react';
import SpeechBubble from './SpeechBubble';

interface ConversationItem {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ConversationHistoryProps {
  history: ConversationItem[];
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ history }) => {
  if (history.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 text-center">会話履歴</h3>
      <div className="space-y-4">
        {history.map((item, index) => (
          <div key={index} className={`flex gap-4 ${item.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {item.type === 'ai' && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
            
            <SpeechBubble className="flex-1 max-w-3xl" type={item.type}>
              <div className={`prose max-w-none break-words ${item.type === 'user' ? 'prose-invert' : 'prose-blue'}`}>
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: item.content.replace(/\n/g, '<br>') 
                  }} 
                />
              </div>
              <div className={`text-xs mt-2 opacity-70 ${item.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {item.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </SpeechBubble>

            {item.type === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center shadow-md">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationHistory;