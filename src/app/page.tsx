'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import StickyHeaderWrapper from "@/components/layout/StickyHeaderWrapper";
import Footer from '@/components/layout/footer/Footer';
import HeroSection from '@/components/features/hero/HeroSection';
import SlideshowAdBanner from '@/components/features/ads/SlideshowAdBanner';
import ParticleBackground from '@/components/features/particles/ParticleBackground';
import ProductCard from '@/components/ui/cards/ProductCard';
import CompetitiveAdvantage from '@/components/home/CompetitiveAdvantage';
import FloatingWhatsApp from '@/components/ui/FloatingWhatsApp';
import CategoriesSection from '@/components/home/CategoriesSection';
import CartDrawer from '@/components/features/cart/CartDrawer';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import { Product } from '@/types';
import { useCartStore } from '@/lib/stores/cartStore';
import { useWishlistStore } from '@/lib/stores/wishlistStore';
import { useSearchStore } from '@/lib/stores/searchStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { formatCurrency } from '@/utils';

export default function Home() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [sortOrder, setSortOrder] = useState<'featured' | 'price-low' | 'price-high'>('featured');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { user, isAuthenticated } = useAuthStore();
  const { addToWishlist, removeFromWishlist, isInWishlist, initializeWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { searchQuery, selectedCategory } = useSearchStore();

  useEffect(() => {
    if (user?.id) {
      initializeWishlist(user.id);
    }
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const products: Product[] = await response.json();
          setAllProducts(products);
          setFilteredProducts(products);
        } else {
          console.error('Failed to fetch allProducts', response.status);
        }
      } catch (error) {
        console.error('Error fetching allProducts', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user?.id) {
      initializeWishlist(user.id);
    }
    let results = [...allProducts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.spec.toLowerCase().includes(query)
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      results = results.filter(product => product.category === selectedCategory);
    }

    switch (sortOrder) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    setFilteredProducts(results);
  }, [searchQuery, selectedCategory, sortOrder, allProducts]);

  const handleAddToWishlist = async (productId: number) => {
    if (!isAuthenticated) { setIsLoginOpen(true); return; }
    if (!user?.id) return;
    try { await addToWishlist(user.id, productId); toast.success("Added to wishlist"); }
    catch (error) { console.error("Failed to add to wishlist:", error); toast.error("Failed to add to wishlist"); }
  };

  const handleIsInWishlist = (productId: number) => { 
    if (!isAuthenticated) return false; 
    return isInWishlist(productId); 
  };

  const handleAddToCart = (productId: number) => { 
    const product = allProducts.find(p => p.id === productId); 
    if (product) addItem(product); 
  };

  const handleViewDetails = (productId: number) => { 
    const product = allProducts.find(p => p.id === productId); 
    if (product) setSelectedProduct(product); 
  };

  const handleRequireLogin = () => setIsLoginOpen(true);
  const switchToRegister = () => { setIsLoginOpen(false); setIsRegisterOpen(true); };
  const switchToLogin = () => { setIsRegisterOpen(false); setIsLoginOpen(true); };
  const closeAllModals = () => { setIsLoginOpen(false); setIsRegisterOpen(false); };

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
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  return (
    <main className="min-h-screen bg-transparent transition-colors duration-300 relative overflow-x-hidden">
      <div className="fixed inset-0 z-0"><ParticleBackground /></div>
      <div className="relative z-10">
        <StickyHeaderWrapper />
        <SlideshowAdBanner />
        <HeroSection />
        <CategoriesSection />
        
        <section id="products" className="py-16 bg-transparent transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Solar Products</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{filteredProducts.length} products found</p>
              </div>
              <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)}
                className="px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent dark:text-white">
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
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={handleAddToCart} 
                    onViewDetails={handleViewDetails} 
                    onAddToWishlist={handleWishlistClick} 
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
        
        <CompetitiveAdvantage />
        <Footer />
      </div>
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={closeAllModals} onSwitchToRegister={switchToRegister} />
      <RegisterModal isOpen={isRegisterOpen} onClose={closeAllModals} onSwitchToLogin={switchToLogin} />
      
      {/* Product Details Modal - Complete version like products page */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={closeProductModal}
              className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p><span className="font-semibold">Brand:</span> {selectedProduct.brand || 'N/A'}</p>
                  <p><span className="font-semibold">Specifications:</span> {selectedProduct.spec || 'N/A'}</p>
                  {selectedProduct.capacity && <p><span className="font-semibold">Capacity:</span> {selectedProduct.capacity}</p>}
                  {selectedProduct.installationTime && <p><span className="font-semibold">Installation:</span> {selectedProduct.installationTime}</p>}
                  {selectedProduct.systemType && <p><span className="font-semibold">System Type:</span> {selectedProduct.systemType}</p>}
                </div>

                {/* Features */}
                {selectedProduct.features && selectedProduct.features.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Features:</p>
                    <ul className="space-y-1">
                      {selectedProduct.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                          <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Compatible With */}
                {selectedProduct.compatibleWith && selectedProduct.compatibleWith.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Compatible With:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.compatibleWith.map((item, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
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

                {/* Quantity */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg w-fit">
                    <button
                      onClick={() => {
                        const input = document.getElementById('home-modal-qty') as HTMLInputElement;
                        if (input) {
                          const val = Math.max(1, parseInt(input.value) - 1);
                          input.value = val.toString();
                        }
                      }}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      disabled={!selectedProduct.inStock}
                    >
                      -
                    </button>
                    <input
                      id="home-modal-qty"
                      type="number"
                      min="1"
                      max={selectedProduct.inventory || 99}
                      defaultValue="1"
                      className="w-16 px-2 py-2 text-center text-gray-900 dark:text-white border-x border-gray-300 dark:border-gray-600 bg-transparent"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById('home-modal-qty') as HTMLInputElement;
                        if (input) {
                          const max = selectedProduct.inventory || 99;
                          const val = Math.min(max, parseInt(input.value) + 1);
                          input.value = val.toString();
                        }
                      }}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      disabled={!selectedProduct.inStock}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                  <button
                    onClick={() => {
                      const input = document.getElementById('home-modal-qty') as HTMLInputElement;
                      const qty = parseInt(input?.value || '1');
                      for (let i = 0; i < qty; i++) {
                        addItem(selectedProduct);
                      }
                      closeProductModal();
                      toast.success(`${qty} x ${selectedProduct.title} added to cart!`);
                    }}
                    disabled={!selectedProduct.inStock}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        closeProductModal();
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
      
      <FloatingWhatsApp />
    </main>
  );
}
