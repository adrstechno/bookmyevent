import React from 'react';

const LoadingSpinner = ({ message = "Loading...", fullScreen = false }) => {
  const containerClass = fullScreen 
    ? "fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c6e71] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;