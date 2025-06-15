import React from 'react';
import { Download } from 'lucide-react';

interface DownloadButtonProps {
  content: string;
  filename?: string;
  className?: string;
  children?: React.ReactNode;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ 
  content, 
  filename = 'proposal.md', 
  className = '',
  children 
}) => {
  const handleDownload = () => {
    // UTF-8エンコーディングでBlobを作成
    const blob = new Blob([content], { 
      type: 'text/markdown;charset=utf-8' 
    });
    
    // ダウンロード用のURLを作成
    const url = URL.createObjectURL(blob);
    
    // 一時的なリンク要素を作成してクリック
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // クリーンアップ
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 ${className}`}
    >
      <Download className="h-4 w-4" />
      {children || 'ダウンロード'}
    </button>
  );
};

export default DownloadButton;