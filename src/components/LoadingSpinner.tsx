import React from 'react';

interface LoadingSpinnerProps {
  message: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-200 border-t-blue-600 mb-4"></div>
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  );
};

export default LoadingSpinner;