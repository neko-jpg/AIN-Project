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

  // Don't render if no content
  if (!children) return null;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100 flex items-center gap-3 text-left font-semibold text-gray-900 transition-all duration-200"
      >
        <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
          <ChevronDown className="h-5 w-5 text-blue-600" />
        </div>
        <span className="flex-1">{title}</span>
      </button>
      {isExpanded && (
        <div className="p-6 bg-white border-t border-gray-100">
          <div className="break-words overflow-wrap-anywhere">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpandableSection;