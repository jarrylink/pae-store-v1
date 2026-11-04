'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StickyHeaderWrapper from '@/components/layout/StickyHeaderWrapper';
import Footer from '@/components/layout/footer/Footer';
import CartDrawer from '@/components/features/cart/CartDrawer';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import FloatingWhatsApp from '@/components/ui/FloatingWhatsApp';
import { useAuthStore } from '@/lib/stores/authStore';
import { useCartStore } from '@/lib/stores/cartStore';
import { useWishlistStore } from '@/lib/stores/wishlistStore';
import { formatCurrency } from '@/utils';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Check, Shield, Clock, Zap, Heart } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();

  const { user, isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          toast.error('Product not found');
        }
      } catch (err) {
        console.error('Fetch product error:', err);
        toast.error('Error loading product details');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast.success(`${quantity} x ${product.title} added to cart`);
  };

  const handleWishlistClick = async () => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    if (!user?.id || !product) return;
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(user.id, product.id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(user.id, product.id);
        toast.success('Added to wishlist');
      }
    } catch {
      toast.error('Operation failed');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <StickyHeaderWrapper />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all products
        </Link>

        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse min-h-[400px]" />
        ) : !product ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The product you are looking for does not exist or has been removed.</p>
            <Link
              href="/products"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Product Image */}
              <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-4">
                <img
                  src={product.image || '/placeholder-image.png'}
                  alt={product.title}
                  className="w-full max-h-[480px] object-contain rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format';
                  }}
                />
              </div>

              {/* Product Info */}
              <div className="flex flex-col">
                {product.category && (
                  <span className="inline-block bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 w-fit uppercase tracking-wider">
                    {product.category}
                  </span>
                )}

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.title}
                </h1>

                <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                  {product.brand} • {product.spec}
                </p>

                <div className="text-3xl font-bold text-[#1a2a8a] dark:text-green-400 mb-6">
                  {formatCurrency(product.price)}
                  <span className="text-xs text-gray-500 font-normal ml-2">VAT incl.</span>
                </div>

                {/* Stock & Highlights */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    product.inStock
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                  </span>
                  {product.inventory < 10 && product.inStock && (
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      Only {product.inventory} units available
                    </span>
                  )}
                  {product.warranty && (
                    <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-blue-500" />
                      {product.warranty}
                    </span>
                  )}
                </div>

                {/* Specifications List */}
                <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 mb-6 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p><span className="font-semibold text-gray-900 dark:text-white">Brand:</span> {product.brand || 'N/A'}</p>
                  <p><span className="font-semibold text-gray-900 dark:text-white">Specification:</span> {product.spec || 'N/A'}</p>
                  {product.capacity && <p><span className="font-semibold text-gray-900 dark:text-white">Capacity:</span> {product.capacity}</p>}
                  {product.installationTime && <p><span className="font-semibold text-gray-900 dark:text-white">Installation Time:</span> {product.installationTime}</p>}
                  {product.systemType && <p><span className="font-semibold text-gray-900 dark:text-white">System Type:</span> {product.systemType}</p>}
                </div>

                {/* Full Features */}
                {product.features && product.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Product Features:</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {product.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                          <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quantity and Actions */}
                <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                      disabled={!product.inStock}
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.inventory || 99, quantity + 1))}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                      disabled={!product.inStock}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Add to Cart
                  </button>

                  <button
                    onClick={handleWishlistClick}
                    className={`p-3 rounded-lg border transition-colors flex items-center justify-center ${
                      isAuthenticated && isInWishlist(product.id)
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-red-500'
                    }`}
                    title={isAuthenticated && isInWishlist(product.id) ? 'Saved' : 'Save'}
                  >
                    <Heart className={`w-5 h-5 ${isAuthenticated && isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />
      <FloatingWhatsApp />
    </main>
  );
}
