'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useWishlistStore } from '@/lib/stores/wishlistStore';
import Link from 'next/link';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function WishlistPage() {
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
    if (!user?.id) return;
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is waiting</h2>
          <p className="text-gray-500 mb-6">Please login to view your wishlist</p>
          <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Start adding items you love</p>
          <Link href="/products" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist ({items.length})</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">Product #{item.productId}</h3>
                  <p className="text-sm text-gray-500 mt-1">Added on {new Date(item.addedAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => handleRemove(item.productId)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/products/${item.productId}`}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
                >
                  View Product
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


