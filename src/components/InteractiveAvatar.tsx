import React from 'react';
import { Brain, Sparkles, CheckCircle } from 'lucide-react';

interface InteractiveAvatarProps {
  state: 'idle' | 'thinking' | 'happy';
}

const InteractiveAvatar: React.FC<InteractiveAvatarProps> = ({ state }) => {
  const getAvatarContent = () => {
    switch (state) {
      case 'thinking':
        return (
          <div className="relative">
            <img
              src="https://placehold.co/150x150/EFEFEF/007BFF?text=AIN&font=sans"
              alt="AIN Avatar"
              className="w-24 h-24 rounded-full border-4 border-blue-200 shadow-lg"
            />
            <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-2 animate-pulse">
              <Brain className="h-4 w-4 text-white animate-spin" />
            </div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        );
      case 'happy':
        return (
          <div className="relative">
            <img
              src="https://placehold.co/150x150/EFEFEF/00C851?text=AIN&font=sans"
              alt="AIN Avatar"
              className="w-24 h-24 rounded-full border-4 border-green-200 shadow-lg transform hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <div className="absolute -top-1 -left-1">
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
            </div>
          </div>
        );
      default:
        return (
          <div className="relative">
            <img
              src="https://placehold.co/150x150/EFEFEF/007BFF?text=AIN&font=sans"
              alt="AIN Avatar"
              className="w-24 h-24 rounded-full border-4 border-blue-100 shadow-lg transform hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-shrink-0">
      {getAvatarContent()}
    </div>
  );
};

export default InteractiveAvatar;