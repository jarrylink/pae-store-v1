'use client';

import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  fullScreen?: boolean;
  text?: string;
}

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3'
};

const colors = {
  primary: 'border-[#1a2a8a] border-t-transparent dark:border-green-400',
  white: 'border-white border-t-transparent',
  gray: 'border-gray-300 border-t-transparent dark:border-gray-600'
};

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  color = 'primary',
  fullScreen = false,
  text
}) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`
          ${sizes[size]}
          ${colors[color]}
          rounded-full
          animate-spin
        `}
      />
      {text && (
        <p className={`mt-2 text-sm ${color === 'white' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};
