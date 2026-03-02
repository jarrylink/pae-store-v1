'use client';

import React from 'react';
import Link from 'next/link';

const HeroSection: React.FC = () => {
  const categories = [
    {
      name: 'Solar Panels',
      description: 'High-efficiency monocrystalline panels',
      icon: '☀️',
      href: '/solar-panels',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      name: 'Inverters',
      description: 'Pure sine wave & hybrid inverters',
      icon: '⚡',
      href: '/inverters',
      color: 'from-blue-500 to-purple-600'
    },
    {
      name: 'Batteries',
      description: 'Lithium & gel deep cycle batteries',
      icon: '🔋',
      href: '/batteries',
      color: 'from-green-500 to-teal-600'
    },
    {
      name: 'Complete Kits',
      description: 'Ready-to-install solar systems',
      icon: '📦',
      href: '/kits',
      color: 'from-red-500 to-pink-600'
    }
  ];

  return (
    <section className="relative overflow-hidden bg-transparent">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Main Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
            <span className="block text-brand-gradient">
              Number One Africa&apos;s
            </span>
            <span className="block text-brand-gradient">
              Solar Energy Store
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-6 font-semibold">
            Nigeria&apos;s most trusted supplier of premium solar panels, inverters, batteries,
            and complete installation services across Katsina State and beyond.
          </p>
        </div>

        {/* Category Grid - Made transparent */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/30 dark:border-gray-700/50 overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className={`text-4xl mb-4 inline-flex p-3 rounded-2xl bg-gradient-to-r ${category.color} text-white`}>
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {category.description}
                </p>
                <div className="mt-4 text-[#1a2a8a] dark:text-blue-400 font-bold text-sm group-hover:underline">
                  Shop Now →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Trust Bar - Made transparent */}
        <div className="text-center border-t border-gray-300/50 dark:border-gray-600/50 pt-8">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-full py-2 px-6 inline-block font-semibold">
            TRUSTED BY THOUSANDS OF NIGERIAN HOMES & BUSINESSES
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-bold bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
              <span className="text-green-500">✓</span> 5-Year Warranty
            </div>
            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-bold bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
              <span className="text-green-500">✓</span> Free Installation
            </div>
            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-bold bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
              <span className="text-green-500">✓</span> 24/7 Support
            </div>
            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-bold bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
              <span className="text-green-500">✓</span> NERC Certified
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
