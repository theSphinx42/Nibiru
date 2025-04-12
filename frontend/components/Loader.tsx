import React from 'react';

interface LoaderProps {
  fullScreen?: boolean;
  message?: string;
}

/**
 * Loader
 * 
 * A simple loading spinner component that can be displayed
 * in full screen or inline.
 */
const Loader: React.FC<LoaderProps> = ({ 
  fullScreen = false, 
  message = 'Loading...' 
}) => {
  const loaderContent = (
    <div className="flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-gray-300 rounded-full border-t-blue-500 animate-spin"></div>
      {message && <p className="mt-4 text-gray-300">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      {loaderContent}
    </div>
  );
};

export default Loader; 