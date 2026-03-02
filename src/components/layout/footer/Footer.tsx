"use client";

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 py-3">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
          <div className="text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
            © 2025 Power Afric Store. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <a href="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-[#1a2a8a] dark:hover:text-green-400 transition-colors">
              Privacy
            </a>
            <a href="/terms" className="text-gray-500 dark:text-gray-400 hover:text-[#1a2a8a] dark:hover:text-green-400 transition-colors">
              Terms
            </a>
            <a href="/contact" className="text-gray-500 dark:text-gray-400 hover:text-[#1a2a8a] dark:hover:text-green-400 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
