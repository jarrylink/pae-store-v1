'use client';

import React from 'react';

const CompactAdBanner: React.FC = () => {
  const ads = [
    {
      id: 1,
      title: '🔥 Summer Sale',
      subtitle: '20% off solar panels',
      cta: 'Shop Now',
      bg: 'bg-gradient-to-r from-orange-500 to-red-500'
    },
    {
      id: 2,
      title: '⚡ Free Installation',
      subtitle: 'With complete kits',
      cta: 'Learn More', 
      bg: 'bg-gradient-to-r from-green-500 to-emerald-500'
    },
    {
      id: 3,
      title: '🏠 Home Solutions',
      subtitle: 'Custom solar systems',
      cta: 'Get Quote',
      bg: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    }
  ];

  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ads.map((ad) => (
            <div 
              key={ad.id}
              className={`${ad.bg} rounded-lg p-3 text-white shadow-sm transform hover:scale-105 transition-all duration-200 cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">{ad.title}</h3>
                  <p className="text-xs opacity-90">{ad.subtitle}</p>
                </div>
                <button className="bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-1 rounded transition-colors border border-white/30">
                  {ad.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompactAdBanner;
