'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Header from '@/components/layout/header/Header';
import Footer from '@/components/layout/footer/Footer';
import HeroSection from '@/components/features/hero/HeroSection';
import SlideshowAdBanner from '@/components/features/ads/SlideshowAdBanner';
import StickySearchPanel from '@/components/features/search/StickySearchPanel';
import ExtensionDownload from '@/components/features/extension/ExtensionDownload';
import ParticleBackground from '@/components/features/particles/ParticleBackground';
import ProductCard from '@/components/ui/cards/ProductCard';
import CartDrawer from '@/components/features/cart/CartDrawer';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import { PRODUCTS } from '@/lib/data/products';
import { Product } from '@/types';
import { useCartStore } from '@/lib/stores/cartStore';
import { useWishlistStore } from '@/lib/stores/wishlistStore';
import { useSearchStore } from '@/lib/stores/searchStore';
import { useAuthStore } from '@/lib/stores/authStore';

export default function Home() {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(PRODUCTS);
  const [sortOrder, setSortOrder] = useState<'featured' | 'price-low' | 'price-high'>('featured');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { user, isAuthenticated } = useAuthStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  const handleAddToWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    try {
      await addToWishlist(productId);
      toast.success('Added to wishlist');
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const handleIsInWishlist = (productId: number) => {
    if (!isAuthenticated) return false;
    return isInWishlist(productId);
  };

  const { addItem } = useCartStore();
  const { searchQuery, selectedCategory } = useSearchStore();

  useEffect(() => {
    let results = PRODUCTS;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.spec.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      results = results.filter(product => product.category === selectedCategory);
    }

    switch (sortOrder) {
      case 'price-low':
        results = [...results].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results = [...results].sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    setFilteredProducts(results);
  }, [searchQuery, selectedCategory, sortOrder]);

  const handleAddToCart = (productId: number) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (product) {
      addItem(product);
    }
  };

  const handleViewDetails = (productId: number) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (product) setSelectedProduct(product);
  };

  const handleRequireLogin = () => setIsLoginOpen(true);
  const switchToRegister = () => { setIsLoginOpen(false); setIsRegisterOpen(true); };
  const switchToLogin = () => { setIsRegisterOpen(false); setIsLoginOpen(true); };
  const closeAllModals = () => { setIsLoginOpen(false); setIsRegisterOpen(false); };

  return (
    <main className="min-h-screen bg-transparent transition-colors duration-300 relative">
      <div className="fixed inset-0 z-0"><ParticleBackground /></div>
      <div className="relative z-10">
        <Header />
        <StickySearchPanel />
        <SlideshowAdBanner />
        <HeroSection />
        <ExtensionDownload />
        <section id="products" className="py-16 bg-transparent transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Solar Products</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{filteredProducts.length} products found</p>
              </div>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} className="px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent dark:text-white">
                <option value="featured">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Try adjusting your search or filter criteria</p>
                <button onClick={() => useSearchStore.getState().clearFilters()} className="px-6 py-2 bg-[#1a2a8a] text-white rounded-lg hover:bg-[#0f1a66] transition-colors">Clear All Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                    onAddToWishlist={handleAddToWishlist}
                    isInWishlist={handleIsInWishlist}
                    userRole={user?.role as any}
                    isAuthenticated={isAuthenticated}
                    onRequireLogin={handleRequireLogin}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
        <Footer />
      </div>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={closeAllModals} onSwitchToRegister={switchToRegister} />
      <RegisterModal isOpen={isRegisterOpen} onClose={closeAllModals} onSwitchToLogin={switchToLogin} />
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProduct.title}</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-center">
                <img src={selectedProduct.image} alt={selectedProduct.title} className="w-full h-48 object-cover rounded-lg" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{selectedProduct.brand} • {selectedProduct.spec}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Capacity:</span><span className="font-medium">{selectedProduct.capacity}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Warranty:</span><span className="font-medium">{selectedProduct.warranty}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Installation:</span><span className="font-medium">{selectedProduct.installationTime}</span></div>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Features:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">{(selectedProduct.features || []).map((f,i) => <li key={i}>• {f}</li>)}</ul>
                </div>
                <div className="text-2xl font-bold text-[#1a2a8a] dark:text-green-400 mb-4">₦{selectedProduct.price.toLocaleString()}</div>
                <button onClick={() => { handleAddToCart(selectedProduct.id); setSelectedProduct(null); }} className="w-full bg-[#1a2a8a] hover:bg-[#0f1a66] text-white py-3 rounded-lg font-semibold transition-colors" disabled={!selectedProduct.inStock}>{selectedProduct.inStock ? 'Add to Cart' : 'Out of Stock'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

