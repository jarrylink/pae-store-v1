'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import StickyHeaderWrapper from '@/components/layout/StickyHeaderWrapper';
import Footer from '@/components/layout/footer/Footer';
import ProductCard from '@/components/ui/cards/ProductCard';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import CartDrawer from '@/components/features/cart/CartDrawer';
import FloatingWhatsApp from '@/components/ui/FloatingWhatsApp';
import { useAuthStore } from '@/lib/stores/authStore';
import { useCartStore } from '@/lib/stores/cartStore';
import { useWishlistStore } from '@/lib/stores/wishlistStore';
import { useSearchStore } from '@/lib/stores/searchStore';
import { formatCurrency } from '@/utils';
import { toast } from 'react-hot-toast';

interface Product {
  id: number;
  title: string;
  brand: string;
  spec: string;
  price: number;
  image: string;
  category: string;
  warranty: string;
  installationTime: string;
  capacity: string;
  compatibleWith: string[];
  features: string[];
  inStock: boolean;
  inventory: number;
  systemType: string;
  isActive?: boolean;
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const { user, isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { searchQuery, setSearchQuery } = useSearchStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'featured' | 'price-low' | 'price-high'>('featured');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          toast.error('Failed to load products');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        toast.error('Connection error while fetching products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleViewDetails = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchQuery
      ? product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.spec?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory = categoryParam && categoryParam !== 'all'
      ? (
          product.category?.toLowerCase() === categoryParam.toLowerCase() ||
          (categoryParam.toLowerCase().includes('batter') && product.category?.toLowerCase().includes('batter')) ||
          (categoryParam.toLowerCase().includes('inverter') && product.category?.toLowerCase().includes('inverter')) ||
          (categoryParam.toLowerCase().includes('solar') && product.category?.toLowerCase().includes('solar'))
        )
      : true;

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortOrder === 'price-low') return a.price - b.price;
    if (sortOrder === 'price-high') return b.price - a.price;
    return 0;
  });

  const handleWishlistClick = async (productId: number) => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    if (!user?.id) return;
    try {
      if (isInWishlist(productId)) {
        await removeFromWishlist(user.id, productId);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(user.id, productId);
        toast.success('Added to wishlist');
      }
    } catch {
      toast.error('Operation failed');
    }
  };

  const handleAddToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      addItem(product);
      toast.success(`${product.title} added to cart`);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <StickyHeaderWrapper />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
              {categoryParam && categoryParam !== 'all' ? `${categoryParam} Products` : 'All Solar Products'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Showing {filteredProducts.length} items
            </p>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 py-12">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search query or switching categories.
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onViewDetails={handleViewDetails}
                onAddToWishlist={handleWishlistClick}
                isInWishlist={isInWishlist}
                userRole={user?.role as any}
                isAuthenticated={isAuthenticated}
                onRequireLogin={() => setIsLoginOpen(true)}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* Product Details Modal with Full Features */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Left Column - Image */}
              <div>
                <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={selectedProduct.image || '/placeholder-image.png'}
                    alt={selectedProduct.title || 'Product'}
                    className="w-full h-64 md:h-96 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format';
                    }}
                  />
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="flex flex-col">
                {/* Category Badge */}
                {selectedProduct.category && (
                  <span className="inline-block bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white text-sm px-3 py-1 rounded-full mb-4 w-fit">
                    {selectedProduct.category}
                  </span>
                )}

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {selectedProduct.title || 'Product'}
                </h2>

                {/* Basic Info */}
                <div className="space-y-2 mb-4 text-gray-600 dark:text-gray-400">
                  <p><span className="font-semibold text-gray-800 dark:text-gray-200">Brand:</span> {selectedProduct.brand || 'N/A'}</p>
                  <p><span className="font-semibold text-gray-800 dark:text-gray-200">Specifications:</span> {selectedProduct.spec || 'N/A'}</p>
                  {selectedProduct.capacity && <p><span className="font-semibold text-gray-800 dark:text-gray-200">Capacity:</span> {selectedProduct.capacity}</p>}
                  {selectedProduct.installationTime && <p><span className="font-semibold text-gray-800 dark:text-gray-200">Installation:</span> {selectedProduct.installationTime}</p>}
                  {selectedProduct.systemType && <p><span className="font-semibold text-gray-800 dark:text-gray-200">System Type:</span> {selectedProduct.systemType}</p>}
                </div>

                {/* Full Features */}
                {selectedProduct.features && selectedProduct.features.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Full Features:</p>
                    <ul className="space-y-1.5">
                      {selectedProduct.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                          <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Compatible With */}
                {selectedProduct.compatibleWith && selectedProduct.compatibleWith.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Compatible With:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.compatibleWith.map((item, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="mb-4">
                  <span className="text-3xl font-bold text-[#1a2a8a] dark:text-green-400">
                    {formatCurrency(selectedProduct.price)}
                  </span>
                </div>

                {/* Stock & Warranty */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedProduct.inStock
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {selectedProduct.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                  </span>
                  {selectedProduct.inventory && selectedProduct.inventory < 10 && selectedProduct.inStock && (
                    <span className="text-sm text-orange-600 dark:text-orange-400">
                      Only {selectedProduct.inventory} left
                    </span>
                  )}
                  {selectedProduct.warranty && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      🛡️ {selectedProduct.warranty}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => {
                      addItem(selectedProduct);
                      setSelectedProduct(null);
                      toast.success(`${selectedProduct.title} added to cart!`);
                    }}
                    disabled={!selectedProduct.inStock}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        setSelectedProduct(null);
                        setIsLoginOpen(true);
                        return;
                      }
                      handleWishlistClick(selectedProduct.id);
                    }}
                    className={`px-4 py-3 rounded-lg transition-all font-medium flex items-center justify-center ${
                      isAuthenticated && isInWishlist(selectedProduct.id)
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" fill={isAuthenticated && isInWishlist(selectedProduct.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {isAuthenticated && isInWishlist(selectedProduct.id) ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
