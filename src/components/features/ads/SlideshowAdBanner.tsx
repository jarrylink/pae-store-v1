'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  ctaLink: string;
  backgroundImage: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Tier-1 High-Efficiency Solar Panels',
    ctaLink: '/products?category=solar-panels',
    backgroundImage: 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505263/Premium_Solar_Panel_Showcase_Banner_jk34co.png',
  },
  {
    id: 2,
    title: 'Smart Hybrid & Off-Grid Solar Inverters',
    ctaLink: '/products?category=inverters',
    backgroundImage: 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505247/Solar_inverter_showcase_with_Power_Afric_branding_qswjdu.png',
  },
  {
    id: 3,
    title: 'Long-Life LiFePO4 Lithium Batteries',
    ctaLink: '/products?category=batteries',
    backgroundImage: 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505244/Premium_solar_battery_lineup_banner_ct6rpe.png',
  },
  {
    id: 4,
    title: 'All-In-One Energy Storage Systems (ESS)',
    ctaLink: '/products?category=ess',
    backgroundImage: 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505249/Power_Afric_energy_storage_showcase_ahpiwc.png',
  },
  {
    id: 5,
    title: 'Solar Street & Security Lighting',
    ctaLink: '/products?category=street-light',
    backgroundImage: 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505442/Solar_Security_Lights_Product_Showcase_1_ehrkwl.png',
  },
  {
    id: 6,
    title: 'Portable Solar Generators & Power Stations',
    ctaLink: '/products?category=generator',
    backgroundImage: 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505246/Premium_portable_solar_generator_banner_hpq4xj.png',
  },
  {
    id: 7,
    title: 'Intelligent MPPT Solar Charge Controllers',
    ctaLink: '/products?category=charge-controller',
    backgroundImage: 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505249/Power_Afric_Solar_Charge_Controller_Showcase_hvrh6f.png',
  },
  {
    id: 8,
    title: 'Professional Certified Solar Installation',
    ctaLink: '/services',
    backgroundImage: 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505251/Professional_Solar_Installation_In_Action_ndxt5y.png',
  },
  {
    id: 9,
    title: 'Solar UPS & Foldable Panel Kits',
    ctaLink: '/products?category=ups',
    backgroundImage: 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505242/Solar_UPS_lineup_with_folding_panel_xb8juy.png',
  },
  {
    id: 10,
    title: 'Solar Accessories & Installation Materials',
    ctaLink: '/accessories',
    backgroundImage: 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505241/Premium_Solar_Installation_Materials_fjyymr.png',
  },
];

const SlideshowAdBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <section className="py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl bg-gray-100 dark:bg-gray-900 group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Slides Container - Clean and 100% bright without dimming overlay */}
          <div className="relative h-64 sm:h-80 md:h-[380px] lg:h-[440px] xl:h-[480px] w-full">
            {slides.map((slide, index) => {
              const isActive = index === currentSlide;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isActive 
                      ? 'opacity-100 pointer-events-auto z-10' 
                      : 'opacity-0 pointer-events-none z-0'
                  }`}
                >
                  <Link
                    href={slide.ctaLink}
                    className="block relative w-full h-full cursor-pointer"
                    aria-label={slide.title}
                  >
                    {/* Background Showcase Banner Image - 100% Full brightness */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.01]"
                      style={{ backgroundImage: `url(${slide.backgroundImage})` }}
                    />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/70 hover:bg-white dark:bg-black/50 dark:hover:bg-black/80 backdrop-blur-md text-gray-800 dark:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg border border-gray-200/50 dark:border-white/20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/70 hover:bg-white dark:bg-black/50 dark:hover:bg-black/80 backdrop-blur-md text-gray-800 dark:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg border border-gray-200/50 dark:border-white/20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-3 sm:bottom-4 right-4 sm:right-6 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? 'w-5 sm:w-6 h-1.5 sm:h-2 bg-[#40b553]'
                    : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/60 hover:bg-white'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Slide Counter Badge */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 text-[11px] sm:text-xs font-semibold text-white bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
            {currentSlide + 1} / {slides.length}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SlideshowAdBanner;