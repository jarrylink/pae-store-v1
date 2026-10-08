'use client';
import React from 'react';

export default function WhyChooseUs() {
  return (
    <section className="my-12 py-8 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold text-center mb-8">Why Choose Power Afric</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">Tier 1 Quality</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Authentic solar components direct from global manufacturers.</p>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">Nationwide Delivery</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Fast and secure shipping across all states.</p>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">Expert Support</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Professional guidance for system sizing and installation.</p>
        </div>
      </div>
    </section>
  );
}