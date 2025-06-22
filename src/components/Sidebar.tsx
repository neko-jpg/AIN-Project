import React from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';

interface SidebarProps {
  formData: {
    purpose: string;
    projectType: string;
    budget: number;
    experienceLevel: string;
    weeklyHours: string;
  };
  onFormChange: (field: keyof SidebarProps['formData'], value: string | number) => void;
  onSubmit: () => void;
  onQuickGenerate: () => void;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  formData, 
  onFormChange, 
  onSubmit, 
  isLoading, 
  onQuickGenerate 
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.purpose.trim()) return;
    onSubmit();
  };

  const handleQuickGenerateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!formData.purpose.trim()) return;
    onQuickGenerate();
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bot className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Navigator</h2>
            <p className="text-sm text-gray-500">Your AI Project Partner</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What do you want to achieve with AI?
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) => onFormChange('purpose', e.target.value)}
              placeholder="e.g., Analyze customer data to predict sales trends"
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Type
            </label>
            <select
              value={formData.projectType}
              onChange={(e) => onFormChange('projectType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Web Application">Web Application</option>
              <option value="Mobile Application">Mobile Application</option>
              <option value="API Backend">API Backend</option>
              <option value="Data Analysis Platform">Data Analysis Platform</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Budget (USD)
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => onFormChange('budget', Number(e.target.value) || 0)}
              min="0"
              max="10000"
              step="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$0</span>
              <span>$10,000</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Development Experience Level
            </label>
            <select
              value={formData.experienceLevel}
              onChange={(e) => onFormChange('experienceLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weekly Development Time
            </label>
            <select
              value={formData.weeklyHours}
              onChange={(e) => onFormChange('weeklyHours', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="~5 hours">~5 hours</option>
              <option value="5~20 hours">5~20 hours</option>
              <option value="20+ hours">20+ hours</option>
            </select>
          </div>
          
          <button
            type="button" 
            onClick={handleQuickGenerateClick}
            disabled={isLoading || !formData.purpose.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 px-4 rounded-md hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-all duration-200"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>{isLoading ? 'Generating...' : 'Quick Generate'}</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || !formData.purpose.trim()}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{isLoading ? 'Analyzing...' : 'Detailed Analysis'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;