'use client';

import React, { useState, useEffect } from 'react';

const SlideshowAdBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const ads = [
    {
      id: 1,
      title: 'Guaranteed Quality. Trusted Clean Energy.',
      cta: 'Explore Products',
      ctaLink: '/products',
      backgroundImage: 'https://res.cloudinary.com/djkudkxmx/image/upload/v1784032037/Gemini_Generated_Image_lptdrnlptdrnlptd_qr0noj.png',
    },
    {
      id: 2,
      title: 'Smart Technology. Greener Tomorrows.',
      cta: 'See Voltify',
      ctaLink: '/services',
      backgroundImage: 'https://res.cloudinary.com/djkudkxmx/image/upload/v1784032038/Gemini_Generated_Image_amb6gtamb6gtamb6_yr3nse.png',
    },
    {
      id: 3,
      title: 'Your Gateway to Premium Solar.',
      cta: 'Shop Now',
      ctaLink: '/products',
      backgroundImage: 'https://res.cloudinary.com/djkudkxmx/image/upload/v1784032033/Gemini_Generated_Image_717drz717drz717d_aro37j.png',
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ads.length);
    }, 6000);
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
    <section className="py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl shadow-2xl">
          {/* Slideshow Container */}
          <div className="relative h-72 md:h-96">
            {ads.map((ad, index) => (
              <div
                key={ad.id}
                className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
                  index === currentSlide ? 'translate-x-0' : 
                  index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                }`}
              >
                {/* Background Image - Full display */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${ad.backgroundImage})` }}
                />
                
                {/* GREEN OVERLAY - instead of black */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a2a8a]/70 via-[#1a2a8a]/30 to-transparent" />
                
                {/* Minimal Content - Bottom aligned */}
                <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center text-white px-6">
                  <h3 className="text-base sm:text-xl md:text-2xl font-bold drop-shadow-lg mb-2">
                    {ad.title}
                  </h3>
                  <a
                    href={ad.ctaLink}
                    className="inline-block bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold px-4 py-1.5 sm:px-6 sm:py-2 rounded-xl transition-all duration-300 transform hover:scale-105 border border-white/30 text-sm sm:text-base"
                  >
                    {ad.cta}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:scale-110"
            aria-label="Previous slide"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:scale-110"
            aria-label="Next slide"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-12 sm:bottom-14 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Slide Counter */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-white/70 text-[10px] sm:text-xs font-medium bg-black/30 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full backdrop-blur-sm">
            {currentSlide + 1} / {ads.length}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SlideshowAdBanner;