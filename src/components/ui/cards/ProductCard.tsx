'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
  onViewDetails: (productId: number) => void;
  onAddToWishlist?: (productId: number) => void;
  isInWishlist?: (productId: number) => boolean;
  userRole?: 'superadmin' | 'staff' | 'customer' | null;
  isAuthenticated?: boolean;
  onRequireLogin?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
  onAddToWishlist,
  isInWishlist: isInWishlistProp,
  userRole = null,
  isAuthenticated = false,
  onRequireLogin
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  useEffect(() => {
    if (isInWishlistProp) {
      setIsWishlisted(isInWishlistProp(product.id));
    }
  }, [isInWishlistProp, product.id]);

  const isAdminUser = userRole === 'superadmin' || userRole === 'staff';
  const isGuest = !isAuthenticated;

  const handleAddToCartClick = () => {
    if (isAdminUser) {
      onViewDetails(product.id);
      return;
    }
    if (isGuest) {
      if (onRequireLogin) {
        onRequireLogin();
      } else {
        onViewDetails(product.id);
      }
      return;
    }
    onAddToCart(product.id);
  };

  const handleWishlistClick = async () => {
    if (!onAddToWishlist) return;
    if (isWishlistLoading) return;
    
    setIsWishlistLoading(true);
    try {
      await onAddToWishlist(product.id);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const getAddToCartButtonText = () => {
    if (!product.inStock) return 'Out of Stock';
    if (isAdminUser) return 'View Details';
    if (isGuest) return 'Login to Buy';
    return 'Add to Cart';
  };

  const getButtonClasses = () => {
    if (!product.inStock) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }
    if (isAdminUser) {
      return 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg transform hover:-translate-y-0.5';
    }
    if (isGuest) {
      return 'bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white hover:shadow-lg transform hover:-translate-y-0.5';
    }
    return 'bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white hover:shadow-lg transform hover:-translate-y-0.5';
  };

  const getStockClasses = () => {
    if (product.inStock) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    } else {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };

  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col border border-white/30 dark:border-gray-700/50">
      <div className="h-44 rounded-lg overflow-hidden mb-4 bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex-1">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{product.title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{product.brand} • {product.spec}</p>

        <div className="mt-2 flex items-center">
          <span className={'text-xs px-2 py-1 rounded ' + getStockClasses()}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
          {product.inventory < 10 && product.inStock && (
            <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">
              Only {product.inventory} left
            </span>
          )}
          {isAdminUser && (
            <span className="ml-2 text-xs px-2 py-1 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              Admin View
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-[#1a2a8a] dark:text-green-400">
            ₦{product.price.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">VAT incl.</div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleAddToCartClick}
            disabled={!product.inStock}
            className={'px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#40b553]/30 ' + getButtonClasses()}
          >
            {getAddToCartButtonText()}
          </button>

          <div className="flex">
            <button
              onClick={() => onViewDetails(product.id)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 rounded-l-lg font-medium transition-colors"
            >
              Details
            </button>

            {onAddToWishlist && (
              <button
                onClick={() => onAddToWishlist?.(product.id)}
                disabled={!product.inStock || isWishlistLoading}
                className={`px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg transition-all duration-200 ${
                  isWishlisted
                    ? "text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                    : "text-gray-500 hover:text-red-500 bg-gray-50 hover:bg-red-50 dark:bg-gray-700 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                } ${(!product.inStock || isWishlistLoading) ? "opacity-50 cursor-not-allowed" : ""}`}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                {isWishlistLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isWishlisted ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

