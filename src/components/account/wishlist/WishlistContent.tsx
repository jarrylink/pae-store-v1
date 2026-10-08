'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useWishlistStore } from '@/lib/stores/wishlistStore';
import Link from 'next/link';
import { 
  Trash2, 
  ShoppingCart, 
  Heart, 
  Loader2,
  Package,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface WishlistItem {
  id: string;
  productId: number;
  addedAt: string;
  title?: string;
  price?: number;
  image?: string;
}

export default function WishlistContent() {
  const { user, isAuthenticated } = useAuthStore();
  const { items, removeFromWishlist, initializeWishlist } = useWishlistStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      initializeWishlist(user.id);
      setLoading(false);
    }
  }, [user?.id, initializeWishlist]);

  const handleRemove = async (productId: number) => {
    if (!user?.id) {
      toast.error('Please login to remove items');
      return;
    }
    try {
      await removeFromWishlist(user.id, productId);
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      toast.error('Failed to remove');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is waiting</h3>
        <p className="text-gray-500 mb-4">Please login to view your wishlist</p>
        <Link href="/login" className="inline-flex items-center px-4 py-2 bg-[#1a2a8a] text-white rounded-lg hover:bg-[#0f1a66]">
          Login to Continue
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a2a8a]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
        <p className="text-gray-500 mb-4">Start adding items you love</p>
        <Link href="/products" className="inline-flex items-center px-4 py-2 bg-[#1a2a8a] text-white rounded-lg hover:bg-[#0f1a66]">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-[#1a2a8a] dark:text-green-400" />
          My Wishlist ({items.length})
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  <h3 className="font-medium text-gray-900">Product #{item.productId}</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">Added on {new Date(item.addedAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => handleRemove(item.productId)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4">
              <Link
                href={`/products/${item.productId}`}
                className="inline-flex items-center gap-2 text-sm text-[#1a2a8a] hover:text-[#0f1a66]"
              >
                <ShoppingCart className="w-4 h-4" />
                View Product
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}