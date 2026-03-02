'use client';

import React, { useState, useEffect } from 'react';

const ExtensionDownload: React.FC = () => {
  const [browser, setBrowser] = useState<string>('');
  const [showBrowserSelection, setShowBrowserSelection] = useState(false);

  useEffect(() => {
    // Detect user's browser
    const detectBrowser = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('chrome') && !userAgent.includes('edg')) return 'chrome';
      if (userAgent.includes('firefox')) return 'firefox';
      if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
      if (userAgent.includes('edg')) return 'edge';
      return 'unknown';
    };
    setBrowser(detectBrowser());
  }, []);

  const extensionData = {
    chrome: {
      name: 'Chrome Extension',
      icon: '🦄',
      url: '#',
      description: 'Add to Chrome - It\'s free'
    },
    firefox: {
      name: 'Firefox Add-on', 
      icon: '🦊',
      url: '#',
      description: 'Add to Firefox - It\'s free'
    },
    edge: {
      name: 'Edge Add-on',
      icon: '🌊',
      url: '#', 
      description: 'Add to Edge - It\'s free'
    },
    safari: {
      name: 'Safari Extension',
      icon: '🧭',
      url: '#',
      description: 'Add to Safari - It\'s free'
    }
  };

  const handleDownload = (targetBrowser?: string) => {
    const downloadBrowser = targetBrowser || browser;
    const extension = extensionData[downloadBrowser as keyof typeof extensionData];
    
    if (extension && extension.url) {
      window.open(extension.url, '_blank');
    } else {
      setShowBrowserSelection(true);
    }
  };

  const features = [
    'Price comparison across sellers',
    'Instant stock availability alerts',
    'One-click product research',
    'Exclusive extension-only deals'
  ];

  return (
    <section className="py-8 bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4">
            <span className="text-brand-gradient">
              Enhance Your Shopping
            </span>
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto font-semibold">
            Get the Power Afric browser extension for exclusive deals and faster shopping.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Features List */}
          <div>
            <h3 className="text-xl font-bold text-[#1a2a8a] dark:text-blue-400 mb-4">
              Extension Features:
            </h3>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-brand-gradient rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">✓</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Download Section */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/30 dark:border-gray-700/50">
            <div className="text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Get Our Extension
              </h3>
              
              {/* Auto-detect Download Button */}
              {browser && browser !== 'unknown' && (
                <div className="mb-4">
                  <button
                    onClick={() => handleDownload()}
                    className="w-full bg-brand-gradient hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl">{extensionData[browser as keyof typeof extensionData]?.icon}</span>
                      <div className="text-left">
                        <div className="text-base">Add to {extensionData[browser as keyof typeof extensionData]?.name}</div>
                        <div className="text-xs opacity-90">It&apos;s free</div>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Manual Browser Selection */}
              <div>
                <button
                  onClick={() => setShowBrowserSelection(!showBrowserSelection)}
                  className="text-[#1a2a8a] dark:text-blue-400 font-semibold hover:underline mb-3 text-sm"
                >
                  {showBrowserSelection ? 'Hide other browsers' : 'Other browsers'}
                </button>

                {showBrowserSelection && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {Object.entries(extensionData).map(([browserKey, data]) => (
                      <button
                        key={browserKey}
                        onClick={() => handleDownload(browserKey)}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:border-[#1a2a8a] dark:hover:border-blue-400 transition-colors text-center bg-white/50 dark:bg-gray-700/50 text-xs"
                      >
                        <div className="text-xl mb-1">{data.icon}</div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">{data.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Trust Badges */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>🔒 Secure</span>
                  <span>⚡ Fast</span>
                  <span>🆓 Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExtensionDownload;
