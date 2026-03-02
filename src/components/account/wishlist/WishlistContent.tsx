'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useWishlistStore } from '@/lib/stores/wishlistStore';
import { useCartStore } from '@/lib/stores/cartStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { productsService } from '@/lib/data/productsService';
import { formatCurrency } from '@/utils';
import { Heart, ShoppingCart, Eye, Trash2, Package } from 'lucide-react';

interface WishlistContentProps {
  onViewDetails?: (productId: number) => void;
}

const WishlistContent: React.FC<WishlistContentProps> = ({ onViewDetails }) => {
  const { user } = useAuthStore();
  const { items: wishlistItems, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product details for wishlist items
    // Fetch product details for wishlist items
  useEffect(() => {
    const fetchWishlistProducts = async () => {
      console.log('WishlistContent: user=', user, 'wishlistItems=', wishlistItems);
      if (!user || wishlistItems.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const productIds = wishlistItems.map(item => item.productId);
        console.log('Fetching products for IDs:', productIds);
        const fetchedProducts: Product[] = [];

        // Fetch each product (in a real app, you'd have a batch endpoint)
        for (const productId of productIds) {
          try {
            const product = await productsService.getProductById(productId);
            if (product) {
              fetchedProducts.push(product);
            }
          } catch (err) {
            console.error(`Failed to fetch product ${productId}:`, err);
          }
        }

        console.log('Fetched products:', fetchedProducts);
        setProducts(fetchedProducts);
        setError(null);
      } catch (err) {
        setError('Failed to load wishlist products');
        console.error('Error fetching wishlist products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlistItems, user]);

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await removeFromWishlist(productId);
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  const handleViewDetails = (productId: number) => {
    if (onViewDetails) {
      onViewDetails(productId);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your wishlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-red-500">
          <Package className="w-full h-full" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Unable to load wishlist</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
          <Heart className="w-full h-full" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sign in to view your wishlist</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Please sign in to save and view your favorite products.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
          <Heart className="w-full h-full" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your wishlist is empty</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Save products you love to your wishlist. They will appear here.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Wishlist</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        <button
          onClick={() => {
            // Add all to cart functionality
            products.forEach(product => addItem(product));
          }}
          disabled={products.length === 0}
          className="bg-gradient-to-r from-[#1a2a8a] to-[#40b553] hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Add All to Cart
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Product Image */}
            <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleRemoveFromWishlist(product.id)}
                className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
                title="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {product.brand}
                  </p>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white ml-4">
                  {formatCurrency(product.price)}
                </span>
              </div>

              {/* Product Specs */}
              {product.spec && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                  {product.spec}
                </p>
              )}

              {/* Stock Status */}
              <div className="mt-3">
                {product.inStock ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inStock}
                  className="flex-1 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] hover:opacity-90 text-white px-3 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
                <button
                  onClick={() => handleViewDetails(product.id)}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="View details"
                >
                  <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Wishlist Tips */}
      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Wishlist Tips</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Products in your wishlist are saved for later</li>
          <li>• Click "Add to Cart" to move items to your shopping cart</li>
          <li>• Use "Add All to Cart" to quickly purchase multiple items</li>
          <li>• Items remain in your wishlist until you remove them</li>
        </ul>
      </div>
    </div>
  );
};

export default WishlistContent;

