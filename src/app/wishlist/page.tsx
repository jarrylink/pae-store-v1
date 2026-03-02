'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { useWishlistStore } from '@/lib/stores/wishlistStore';
import { useCartStore } from '@/lib/stores/cartStore';
import { productsService } from '@/lib/data/productsService';
import { Product } from '@/types';
import Header from '@/components/layout/header/Header';
import Footer from '@/components/layout/footer/Footer';

const WishlistPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { items, removeFromWishlist, initializeWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    if (user) {
      initializeWishlist(user.id);
    }
  }, [isAuthenticated, router, user, initializeWishlist]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!items.length) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const productPromises = items.map(item =>
          productsService.getProductById(item.productId)
        );
        const fetchedProducts = await Promise.all(productPromises);
        setProducts(fetchedProducts.filter((p): p is Product => p !== undefined));
      } catch (error) {
        console.error('Failed to fetch wishlist products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [items]);

  const handleRemove = async (productId: number) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Link href="/" className="hover:text-[#1a2a8a] dark:hover:text-green-400 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/account" className="hover:text-[#1a2a8a] dark:hover:text-green-400 transition-colors">
            Account
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">Wishlist</span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Your saved favorite solar products
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>
        </div>

        {/* Wishlist Content */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2a8a] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your wishlist...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Product Image */}
                <div className="relative h-48 mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                  <img
                    src={product.image || 'https://res.cloudinary.com/djkudkxmx/image/upload/v1762182244/logo-blue_yns0bj.png'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-lg"
                    aria-label="Remove from wishlist"
                  >
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Product Info */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[3rem]">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {product.brand}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {product.spec}
                  </p>
                </div>

                {/* Price and Actions */}
                <div className="mt-auto">
                  <div className="mb-4">
                    <span className="text-xl font-bold text-[#1a2a8a] dark:text-green-400">
                      ₦{product.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      className="w-full py-2.5 text-sm bg-gradient-to-r from-[#1a2a8a] to-[#40b553] hover:from-[#0f1a66] hover:to-[#2d9c40] dark:from-green-400 dark:to-green-500 dark:hover:from-green-500 dark:hover:to-green-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                    >
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty Wishlist State */
          <div className="max-w-2xl mx-auto text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Your wishlist is empty</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Start building your dream solar setup! Save your favorite products to easily find them later.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] hover:from-[#0f1a66] hover:to-[#2d9c40] dark:from-green-400 dark:to-green-500 dark:hover:from-green-500 dark:hover:to-green-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
              >
                Browse Products
              </Link>
              <Link
                href="/account"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
              >
                Back to Account
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default WishlistPage;
