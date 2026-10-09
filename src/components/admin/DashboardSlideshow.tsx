'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface DashboardData {
  orders: {
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    totalRevenue: number;
    productRevenue: number;
    serviceRevenue: number;
  };
  products: {
    total: number;
    totalInventory: number;
    totalValue: number;
    soldOut: number;
    lowStock: number;
    unitsSold: number;
  };
  services: {
    total: number;
    active: number;
    confirmed: number;
    completed: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
  };
}

interface DashboardSlideshowProps {
  data: DashboardData;
}

const DashboardSlideshow: React.FC<DashboardSlideshowProps> = ({ data }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Slides with images from Cloudinary
  const slides = [
    {
      id: 1,
      image: 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505263/Premium_Solar_Panel_Showcase_Banner_jk34co.png',
      title: 'Guaranteed Quality. Trusted Clean Energy.',
      subtitle: 'Our Managing Director, Muhammad Sade, stands behind every system we deliver. Experience reliable power with premium solutions built to last.',
      cta: 'Explore Quality Products',
      ctaLink: '/products',
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'from-blue-900/90 to-blue-800/80',
      textColor: 'text-white',
    },
    {
      id: 2,
      image: 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505247/Solar_inverter_showcase_with_Power_Afric_branding_qswjdu.png',
      title: 'Smart Technology. Greener Tomorrows.',
      subtitle: 'Engineered for maximum efficiency. Tech Strategist Muhammad Khalilullah Uthman ensures fully optimized, intelligent green energy setups tailored for your needs.',
      cta: 'See Our Tech',
      ctaLink: '/services',
      icon: <Package className="w-6 h-6" />,
      color: 'from-green-900/90 to-teal-800/80',
      textColor: 'text-white',
    },
    {
      id: 3,
      image: 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505249/Power_Afric_energy_storage_showcase_ahpiwc.png',
      title: 'Your Gateway to Premium Solar.',
      subtitle: 'Switching to solar has never been easier. E-Commerce Expert Jafar Muhammad bridges the gap, giving you instant digital access to the best green products on the market.',
      cta: 'Shop the Store Now',
      ctaLink: '/products',
      icon: <Users className="w-6 h-6" />,
      color: 'from-purple-900/90 to-indigo-800/80',
      textColor: 'text-white',
    }
  ];

  // Auto-rotate slides
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const current = slides[currentSlide];

  return (
    <div 
      className="relative overflow-hidden rounded-2xl shadow-xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide with Image Background */}
      <div 
        className="relative min-h-[280px] md:min-h-[320px] flex items-center"
        style={{
          backgroundImage: `url(${current.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark Overlay for readability */}
        <div className={`absolute inset-0 ${current.color} mix-blend-multiply`}></div>
        
        {/* Content */}
        <div className="relative z-10 p-6 md:p-10 text-white max-w-3xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
              Featured
            </span>
          </div>
          
          <h2 className="text-2xl md:text-4xl font-bold mb-2 text-white leading-tight">
            {current.title}
          </h2>
          
          <p className="text-white/90 text-sm md:text-base mb-4 leading-relaxed max-w-2xl">
            {current.subtitle}
          </p>
          
          <a
            href={current.ctaLink}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] hover:opacity-90 transition-opacity rounded-lg font-semibold text-white text-sm shadow-lg hover:shadow-xl"
          >
            {current.cta}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Slide Counter */}
        <div className="absolute top-4 right-4 text-white/80 text-xs font-medium bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm z-10">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all backdrop-blur-sm z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all backdrop-blur-sm z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-white w-7' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardSlideshow;