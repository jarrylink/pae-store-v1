'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const AdvancedSearchPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('any');
  const [wattage, setWattage] = useState('any');
  const router = useRouter();

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'solar-panels', label: 'Solar Panels' },
    { value: 'inverters', label: 'Inverters' },
    { value: 'batteries', label: 'Batteries' },
    { value: 'kits', label: 'Complete Kits' },
    { value: 'accessories', label: 'Accessories' }
  ];

  const priceRanges = [
    { value: 'any', label: 'Any Price' },
    { value: '0-50000', label: 'Under ₦50,000' },
    { value: '50000-200000', label: '₦50,000 - ₦200,000' },
    { value: '200000-500000', label: '₦200,000 - ₦500,000' },
    { value: '500000+', label: 'Over ₦500,000' }
  ];

  const wattageOptions = [
    { value: 'any', label: 'Any Wattage' },
    { value: '100-300', label: '100W - 300W' },
    { value: '300-500', label: '300W - 500W' },
    { value: '500-1000', label: '500W - 1kW' },
    { value: '1000+', label: '1kW+' }
  ];

  const handleAdvancedSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (selectedCategory !== 'all') params.append('category', selectedCategory);
    if (priceRange !== 'any') params.append('price', priceRange);
    if (wattage !== 'any') params.append('wattage', wattage);
    
    router.push(`/search?${params.toString()}`);
  };

  const quickFilters = [
    { label: 'Best Sellers', icon: '🏆', query: 'best-sellers' },
    { label: 'New Arrivals', icon: '🆕', query: 'new' },
    { label: 'On Sale', icon: '💰', query: 'sale' },
    { label: 'Eco-Friendly', icon: '🌱', query: 'eco-friendly' }
  ];

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20 dark:border-gray-700/50">
      <div className="max-w-6xl mx-auto">
        {/* Main Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleAdvancedSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for solar panels, inverters, batteries, complete kits..."
              className="w-full px-6 py-4 text-lg bg-white/90 dark:bg-gray-700/90 border border-gray-300 dark:border-gray-600 rounded-2xl shadow-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-white pr-40"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </form>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white/90 dark:bg-gray-700/90 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-white"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price Range
            </label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-3 py-2 bg-white/90 dark:bg-gray-700/90 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-white"
            >
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Wattage Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Wattage
            </label>
            <select
              value={wattage}
              onChange={(e) => setWattage(e.target.value)}
              className="w-full px-3 py-2 bg-white/90 dark:bg-gray-700/90 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-white"
            >
              {wattageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Quick Filters
          </h3>
          <div className="flex flex-wrap gap-3">
            {quickFilters.map((filter) => (
              <button
                key={filter.query}
                onClick={() => router.push(`/search?filter=${filter.query}`)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Tips */}
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>💡 <strong>Search tips:</strong> Try "solar panel 300W mono", "5KVA inverter", or "lithium battery 100AH"</p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchPanel;
