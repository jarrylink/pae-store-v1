'use client';

import React, { useState, useEffect } from 'react';

const HeaderSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggleSearch = (event: CustomEvent) => {
      if (event.detail?.forceClose) {
        setIsOpen(false);
      } else {
        setIsOpen(prev => !prev);
      }
    };
    
    window.addEventListener('toggleSearchPanel', handleToggleSearch as EventListener);
    return () => window.removeEventListener('toggleSearchPanel', handleToggleSearch as EventListener);
  }, []);

  const toggleSearch = () => {
    const event = new CustomEvent('toggleSearchPanel');
    window.dispatchEvent(event);
  };

  return (
    <button
      onClick={toggleSearch}
      className={`p-2 transition-all duration-300 hover:scale-110 ${
        isOpen 
          ? 'text-[#40b553] dark:text-green-400' 
          : 'text-gray-600 dark:text-gray-300 animate-heartbeat'
      }`}
      aria-label="Search"
    >
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
  );
};

export default HeaderSearch;
