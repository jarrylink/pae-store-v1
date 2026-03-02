'use client';

import React, { useState, useEffect } from 'react';

const SlideshowAdBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const ads = [
    {
      id: 1,
      title: '🔥 Summer Solar Sale!',
      subtitle: 'Get 20% off on all solar panels this month',
      cta: 'Shop Now',
      backgroundImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      overlay: 'bg-gradient-to-r from-orange-500/80 to-red-500/80'
    },
    {
      id: 2,
      title: '⚡ Free Installation',
      subtitle: 'Professional installation included with every complete kit',
      cta: 'Learn More', 
      backgroundImage: 'https://images.unsplash.com/photo-1625014618426-fdd98192a0b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      overlay: 'bg-gradient-to-r from-green-500/80 to-emerald-500/80'
    },
    {
      id: 3,
      title: '🏆 Best Seller',
      subtitle: '5KVA Inverter - Most trusted by Nigerian homes',
      cta: 'View Product',
      backgroundImage: 'https://images.unsplash.com/photo-1562155618-e1a8bc2eb12f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      overlay: 'bg-gradient-to-r from-blue-500/80 to-cyan-500/80'
    },
    {
      id: 4,
      title: '🔋 Battery Special',
      subtitle: 'Lithium batteries with 10-year warranty',
      cta: 'Explore',
      backgroundImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      overlay: 'bg-gradient-to-r from-purple-500/80 to-pink-500/80'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ads.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [ads.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % ads.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + ads.length) % ads.length);
  };

  return (
    <section className="bg-white dark:bg-gray-900 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl shadow-2xl">
          {/* Slideshow Container */}
          <div className="relative h-64 md:h-80">
            {ads.map((ad, index) => (
              <div
                key={ad.id}
                className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                  index === currentSlide ? 'translate-x-0' : 
                  index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                }`}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${ad.backgroundImage})` }}
                />
                
                {/* Overlay */}
                <div className={`absolute inset-0 ${ad.overlay}`} />
                
                {/* Content */}
                <div className="relative h-full flex items-center justify-center text-white p-8">
                  <div className="text-center max-w-2xl">
                    <h3 className="text-2xl md:text-4xl font-bold mb-4 drop-shadow-lg">
                      {ad.title}
                    </h3>
                    <p className="text-lg md:text-xl mb-6 drop-shadow-md opacity-95">
                      {ad.subtitle}
                    </p>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 border-2 border-white/30">
                      {ad.cta}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SlideshowAdBanner;
