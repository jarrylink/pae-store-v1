'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { categoryService, Category } from '@/lib/services/categoryService';

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryService.getAllCategories();
        // Show all active categories (including those without images - use placeholder)
        const activeCategories = cats.filter(c => c.isActive);
        setCategories(activeCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Placeholder image for categories without image
  const getCategoryImage = (imageUrl: string | null, categoryName: string) => {
    if (imageUrl) return imageUrl;
    // Default images based on category name
    const defaultImages: Record<string, string> = {
      'Generator': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800',
      'UPS': 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&w=800',
    };
    return defaultImages[categoryName] || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format';
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Shop by Category</h2>
            <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2a8a]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find the perfect solar solution for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group relative block overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[#1a2a8a] via-[#2d3a9a] to-[#40b553] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

              <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-colors duration-300">
                <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={getCategoryImage(category.image ?? null, category.name)}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-5 bg-white dark:bg-gray-800 transition-colors duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{category.icon || '??'}</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#1a2a8a] dark:group-hover:text-[#40b553] transition-colors duration-300">
                      {category.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {category.description || `Shop premium ${category.name.toLowerCase()} for your solar needs`}
                  </p>
                  <span className="inline-flex items-center gap-2 text-[#1a2a8a] dark:text-[#40b553] font-semibold group-hover:gap-3 transition-all duration-300">
                    Shop Now
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


