'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Sun, 
  Zap, 
  BatteryCharging, 
  Layers, 
  Lightbulb, 
  Wrench, 
  Hammer, 
  Gauge, 
  Power, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { categoryService, Category } from '@/lib/services/categoryService';

interface CategoryIconConfig {
  icon: React.ReactNode;
  bgGradient: string;
  badgeBorder: string;
}

const getCategoryIconConfig = (name: string): CategoryIconConfig => {
  const normalized = name.toLowerCase();

  if (normalized.includes('solar') || normalized.includes('panel')) {
    return {
      icon: <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />,
      bgGradient: 'from-amber-500/20 to-yellow-500/10',
      badgeBorder: 'border-amber-400/40',
    };
  }
  if (normalized.includes('inverter')) {
    return {
      icon: <Zap className="w-4 h-4 text-blue-500 animate-pulse" />,
      bgGradient: 'from-blue-500/20 to-indigo-500/10',
      badgeBorder: 'border-blue-400/40',
    };
  }
  if (normalized.includes('batter')) {
    return {
      icon: <BatteryCharging className="w-4 h-4 text-emerald-500 animate-bounce-subtle" />,
      bgGradient: 'from-emerald-500/20 to-green-500/10',
      badgeBorder: 'border-emerald-400/40',
    };
  }
  if (normalized.includes('ess') || normalized.includes('storage')) {
    return {
      icon: <Layers className="w-4 h-4 text-cyan-500 group-hover:-translate-y-0.5 transition-transform" />,
      bgGradient: 'from-cyan-500/20 to-teal-500/10',
      badgeBorder: 'border-cyan-400/40',
    };
  }
  if (normalized.includes('light') || normalized.includes('street')) {
    return {
      icon: <Lightbulb className="w-4 h-4 text-yellow-400 animate-pulse" />,
      bgGradient: 'from-yellow-400/20 to-amber-500/10',
      badgeBorder: 'border-yellow-400/40',
    };
  }
  if (normalized.includes('accessor')) {
    return {
      icon: <Wrench className="w-4 h-4 text-rose-500 group-hover:rotate-45 transition-transform duration-300" />,
      bgGradient: 'from-rose-500/20 to-pink-500/10',
      badgeBorder: 'border-rose-400/40',
    };
  }
  if (normalized.includes('install')) {
    return {
      icon: <Hammer className="w-4 h-4 text-emerald-600 group-hover:-rotate-12 transition-transform duration-300" />,
      bgGradient: 'from-emerald-600/20 to-green-600/10',
      badgeBorder: 'border-emerald-400/40',
    };
  }
  if (normalized.includes('charge') || normalized.includes('controller')) {
    return {
      icon: <Gauge className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />,
      bgGradient: 'from-indigo-500/20 to-purple-500/10',
      badgeBorder: 'border-indigo-400/40',
    };
  }
  if (normalized.includes('generator')) {
    return {
      icon: <Power className="w-4 h-4 text-orange-500 group-hover:rotate-90 transition-transform duration-300" />,
      bgGradient: 'from-orange-500/20 to-amber-500/10',
      badgeBorder: 'border-orange-400/40',
    };
  }
  if (normalized.includes('ups')) {
    return {
      icon: <ShieldCheck className="w-4 h-4 text-teal-400 animate-pulse" />,
      bgGradient: 'from-teal-400/20 to-cyan-500/10',
      badgeBorder: 'border-teal-400/40',
    };
  }

  return {
    icon: <Sparkles className="w-4 h-4 text-[#1a2a8a] animate-pulse" />,
    bgGradient: 'from-blue-500/20 to-green-500/10',
    badgeBorder: 'border-blue-400/40',
  };
};

const getCategoryLink = (cat: Category) => {
  const name = cat.name.toLowerCase();
  if (name.includes('install')) return '/services';
  if (name.includes('accessor')) return '/accessories';
  return `/products?category=${encodeURIComponent(cat.name)}`;
};

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryService.getAllCategories();
        const activeCategories = cats.filter((c) => c.isActive);
        setCategories(activeCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const getCategoryImage = (imageUrl?: string | null, categoryName: string = '') => {
    if (imageUrl) return imageUrl;
    const defaultImages: Record<string, string> = {
      'Solar Panels': 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505263/Premium_Solar_Panel_Showcase_Banner_jk34co.png',
      'Inverters': 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505247/Solar_inverter_showcase_with_Power_Afric_branding_qswjdu.png',
      'Batteries': 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505244/Premium_solar_battery_lineup_banner_ct6rpe.png',
      'ESS': 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505249/Power_Afric_energy_storage_showcase_ahpiwc.png',
      'Street Light': 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505442/Solar_Security_Lights_Product_Showcase_1_ehrkwl.png',
      'Accessories': 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505241/Premium_Solar_Installation_Materials_fjyymr.png',
      'Installation': 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505251/Professional_Solar_Installation_In_Action_ndxt5y.png',
      'Charge Controller': 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505249/Power_Afric_Solar_Charge_Controller_Showcase_hvrh6f.png',
      'Generator': 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505246/Premium_portable_solar_generator_banner_hpq4xj.png',
      'UPS': 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505242/Solar_UPS_lineup_with_folding_panel_xb8juy.png',
    };
    return defaultImages[categoryName] || 'https://res.cloudinary.com/djkudkxmx/image/upload/v1791505263/Premium_Solar_Panel_Showcase_Banner_jk34co.png';
  };

  if (loading) {
    return (
      <section className="py-12 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a2a8a] dark:border-[#40b553]" />
          <p className="mt-3 text-xs text-gray-500">Loading solar collections...</p>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 bg-gray-50/60 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin-slow" />
            <span>Curated Energy Collections</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Shop by Category
          </h2>

          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2 max-w-2xl mx-auto font-medium">
            Find the perfect solar solution for your needs
          </p>
        </div>

        {/* Categories Grid - 6 per row on large screens, compact cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((category) => {
            const iconConfig = getCategoryIconConfig(category.name);
            const linkHref = getCategoryLink(category);
            const imageUrl = getCategoryImage(category.image, category.name);

            return (
              <Link
                key={category.id}
                href={linkHref}
                className="group relative flex flex-col overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#1a2a8a]/40 dark:hover:border-[#40b553]/50"
              >
                {/* Compact Thumbnail Container */}
                <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Subtle Gradient Veil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-gray-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                  {/* Animated Premium Floating Icon Badge */}
                  <div className={`absolute top-2 left-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border ${iconConfig.badgeBorder} shadow-md flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                    {iconConfig.icon}
                  </div>
                </div>

                {/* Compact Body Content */}
                <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-grow bg-white dark:bg-gray-800">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#1a2a8a] dark:group-hover:text-[#40b553] transition-colors truncate">
                      {category.name}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {category.description || 'Premium clean energy'}
                    </p>
                  </div>

                  {/* Micro Explore CTA */}
                  <div className="mt-2 pt-1.5 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between text-[11px] font-semibold text-[#1a2a8a] dark:text-[#40b553]">
                    <span className="group-hover:underline">Explore</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
