import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  position: 'left' | 'right';
  isCollapsed: boolean;
  onToggle: () => void;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  defaultWidth = 320,
  minWidth = 280,
  maxWidth = 600,
  position,
  isCollapsed,
  onToggle
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return;

      const rect = panelRef.current.getBoundingClientRect();
      let newWidth;
      
      if (position === 'left') {
        newWidth = e.clientX - rect.left;
      } else {
        newWidth = rect.right - e.clientX;
      }

      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, position, minWidth, maxWidth]);

  return (
    <div
      ref={panelRef}
      className={`relative bg-white border-gray-200 transition-all duration-300 ${
        position === 'left' ? 'border-r' : 'border-l'
      } ${isCollapsed ? 'w-0 overflow-hidden' : ''}`}
      style={{ width: isCollapsed ? 0 : width }}
    >
      {/* Resize handle */}
      {!isCollapsed && (
        <div
          className={`absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors ${
            position === 'left' ? 'right-0' : 'left-0'
          } ${isResizing ? 'bg-blue-500' : 'bg-transparent'}`}
          onMouseDown={() => setIsResizing(true)}
        />
      )}

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className={`absolute top-1/2 transform -translate-y-1/2 z-10 w-6 h-12 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center ${
          position === 'left' 
            ? isCollapsed ? 'left-2' : 'right-2'
            : isCollapsed ? 'right-2' : 'left-2'
        }`}
      >
        {position === 'left' ? (
          isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
        ) : (
          isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {/* Panel content */}
      <div className="h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default ResizablePanel;