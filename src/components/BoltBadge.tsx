import React from 'react';
import { Zap } from 'lucide-react';

const BoltBadge: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-sm font-medium"
      >
        <Zap className="h-4 w-4" />
        <span>Built on Bolt</span>
      </a>
    </div>
  );
};

export default BoltBadge;