'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from './header/Header';
import StickySearchPanel from '../features/search/StickySearchPanel';

const StickyHeaderWrapper: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const pathname = usePathname();
  
  // Hide search on products page
  const isProductsPage = pathname === '/products' || pathname?.startsWith('/products/');

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleScroll = () => {
      if (window.scrollY > 0) {
        wrapper.style.position = 'fixed';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.right = '0';
        wrapper.style.zIndex = '9999';
      } else {
        wrapper.style.position = 'relative';
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleToggle = (event: CustomEvent) => {
      if (event.detail?.forceClose) {
        setIsSearchVisible(false);
      } else {
        setIsSearchVisible(prev => !prev);
      }
    };

    window.addEventListener('toggleSearchPanel', handleToggle as EventListener);
    return () => window.removeEventListener('toggleSearchPanel', handleToggle as EventListener);
  }, []);

  return (
    <div ref={wrapperRef} className="w-full bg-white dark:bg-gray-900">
      <Header />
      {!isProductsPage && (
        <div className={`transition-all duration-300 ease-in-out ${
          isSearchVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-full pointer-events-none absolute w-full'
        }`}>
          <StickySearchPanel />
        </div>
      )}
    </div>
  );
};

export default StickyHeaderWrapper;
