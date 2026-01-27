import React from 'react';

interface RingLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RingLoader: React.FC<RingLoaderProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${className} rounded-full border-4 border-gray-300 border-t-red-500 animate-spin`}
    />
  );
};

export default RingLoader;
