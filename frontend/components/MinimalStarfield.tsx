import React from 'react';

/**
 * MinimalStarfield
 * 
 * A simple static starfield background for authentication pages
 * and other places where a less intense background is needed.
 */
const MinimalStarfield: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 bg-gray-900 overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(1px 1px at ${Math.random() * 100}% ${Math.random() * 100}%, rgba(255, 255, 255, 0.4) 0%, transparent 100%),
                           radial-gradient(1px 1px at ${Math.random() * 100}% ${Math.random() * 100}%, rgba(255, 255, 255, 0.4) 0%, transparent 100%),
                           radial-gradient(1px 1px at ${Math.random() * 100}% ${Math.random() * 100}%, rgba(255, 255, 255, 0.4) 0%, transparent 100%),
                           radial-gradient(2px 2px at ${Math.random() * 100}% ${Math.random() * 100}%, rgba(255, 255, 255, 0.3) 0%, transparent 100%),
                           radial-gradient(2px 2px at ${Math.random() * 100}% ${Math.random() * 100}%, rgba(255, 255, 255, 0.3) 0%, transparent 100%),
                           radial-gradient(1px 1px at ${Math.random() * 100}% ${Math.random() * 100}%, rgba(255, 255, 255, 0.5) 0%, transparent 100%)`,
          backgroundSize: '1600px 1600px',
          backgroundPosition: '50% 50%',
          backgroundRepeat: 'repeat',
        }}
      />
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-gray-900 opacity-70" />
    </div>
  );
};

export default MinimalStarfield; 