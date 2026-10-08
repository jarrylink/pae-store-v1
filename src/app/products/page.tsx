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
    router.push(`/products/${productId}`);
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
