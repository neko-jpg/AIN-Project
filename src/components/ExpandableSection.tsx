import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({ 
  title, 
  children, 
  defaultExpanded = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center gap-2 text-left font-medium text-gray-900 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        {title}
      </button>
      {isExpanded && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

export default ExpandableSection;