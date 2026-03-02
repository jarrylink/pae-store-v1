'use client';

import React from 'react';
import { useSearchStore } from '@/lib/stores/searchStore';

const StickySearchPanel: React.FC = () => {
  const {
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    clearFilters
  } = useSearchStore();

  const hasActiveFilters = searchQuery || selectedCategory !== 'all';

  const quickSearches = ['Solar 300W', 'Inverter 5KVA', 'Battery 100AH', 'Complete Kit'];

  return (
    <div className="sticky top-16 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Main Search Row */}
        <div className="flex items-center gap-4 mb-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search solar panels, inverters, batteries, complete kits..."
              className="w-full px-4 py-2 pl-10 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent dark:text-white"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="Solar Panel">Solar Panels</option>
            <option value="Inverter">Inverters</option>
            <option value="Battery">Batteries</option>
            <option value="Kit">Kits</option>
            <option value="Accessory">Accessories</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Quick Searches */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Popular:</span>
          {quickSearches.map((search) => (
            <button
              key={search}
              onClick={() => setSearchQuery(search)}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded transition-colors"
            >
              {search}
            </button>
          ))}
        </div>

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Active filters:</span>
            {searchQuery && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                Search: \"{searchQuery}\"
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                Category: {selectedCategory}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StickySearchPanel;
