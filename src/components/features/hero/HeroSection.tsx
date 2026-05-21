'use client';

import React from 'react';
import Link from 'next/link';

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-transparent">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Main Header */}
        <div className="text-center">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
            <span className="block text-brand-gradient">
              The Smarter Way
            </span>
            <span className="block text-brand-gradient">
              to Buy Energy Solutions
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto font-semibold">
            You no longer have to struggle to find the right energy solution. We make the process easier, safer, and smarter.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
