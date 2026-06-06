'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types';
import ProductCard from '@/components/ui/cards/ProductCard';
import StickyHeaderWrapper from '@/components/layout/StickyHeaderWrapper';
import Footer from '@/components/layout/footer/Footer';
import CartDrawer from '@/components/features/cart/CartDrawer';
import { useCartStore } from '@/lib/stores/cartStore';
import { useWishlistStore } from '@/lib/stores/wishlistStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import { formatCurrency } from '@/utils';
import { categoryService } from '@/lib/services/categoryService';

// Loading component for Suspense fallback
function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <StickyHeaderWrapper />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2a8a]"></div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Main products component that uses useSearchParams
function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const viewParam = searchParams.get('view');
  const { addItem } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(category || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(viewParam === 'list' ? 'list' : 'grid');
  const [sortBy, setSortBy] = useState<string>('default');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [categories, setCategories] = useState<Array<{id: string, name: string, icon: string}>>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const dbCategories = await categoryService.getAllCategories();
      const formattedCategories = [
        { id: 'all', name: 'All Products', icon: '📦' },
        ...dbCategories.map(cat => ({ id: cat.slug, name: cat.name, icon: cat.icon || '📦' }))
      ];
      setCategories(formattedCategories);
    };
    loadCategories();
  }, []);

  const categoryMapping: Record<string, string[]> = {
    'all': [],
    'solar-panels': ['solar-panels', 'Solar Panels', 'solar panels', 'panel'],
    'inverters': ['inverters', 'Inverters', 'inverter'],
    'batteries': ['batteries', 'Batteries', 'battery'],
    'ess': ['ess', 'ESS', 'energy storage', 'power storage', 'battery storage'],
    'street-light': ['street-light', 'street light', 'streetlight', 'solar street light'],
    'accessories': ['accessories', 'Accessories', 'accessory'],
    'installation': ['installation', 'Installation', 'service', 'services']
  };

  const categoryDisplayNames: Record<string, string> = {
    'all': 'All Products',
    'solar-panels': 'Solar Panels',
    'inverters': 'Inverters',
    'batteries': 'Batteries',
    'ess': 'ESS (Energy Storage)',
    'street-light': 'Street Light Solutions',
    'accessories': 'Accessories',
    'installation': 'Installation Services'
  };

  const categoryIcons: Record<string, string> = {
    'all': '',
    'solar-panels': '',
    'inverters': '',
    'batteries': '',
    'ess': '',
    'street-light': '',
    'accessories': '',
    'installation': ''
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
    if (viewParam) {
      setViewMode(viewParam as 'grid' | 'list');
    }
  }, [category, viewParam]);

  useEffect(() => {
    filterAndSortProducts();
  }, [selectedCategory, products, sortBy]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    if (selectedCategory !== 'all') {
      const searchTerms = categoryMapping[selectedCategory] || [selectedCategory];
      filtered = filtered.filter(product => {
        const productCat = product.category?.toLowerCase() || '';
        return searchTerms.some(term =>
          productCat.includes(term.toLowerCase()) ||
          term.toLowerCase().includes(productCat)
        );
      });
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        filtered.sort((a, b) => a.id - b.id);
    }

    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    router.push(`/products?category=${catId}&view=${viewMode}`);
  };

  const handleViewChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    router.push(`/products?category=${selectedCategory}&view=${mode}`);
  };

  const handleAddToCart = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addItem(product);
      addNotification('success', `${product.title} added to cart!`);
    }
  };

  const handleAddToWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      addNotification("warning", "Please login to add to wishlist");
      return;
    }
    if (!user?.id) return;
    try {
      await addToWishlist(user.id, productId);
      addNotification("success", "Added to wishlist");
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      addNotification("error", "Failed to add to wishlist");
    }
  };
  
  const handleRemoveFromWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      addNotification("warning", "Please login to remove from wishlist");
      return;
    }
    if (!user?.id) return;
    try {
      await removeFromWishlist(user.id, productId);
      addNotification("success", "Removed from wishlist");
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      addNotification("error", "Failed to remove from wishlist");
    }
  };
  
  const handleIsInWishlist = (productId: number) => {
    if (!isAuthenticated) return false;
    return isInWishlist(productId);
  };

  const handleRequireLogin = () => {
    addNotification('info', 'Please login to continue');
    router.push('/login?redirect=' + encodeURIComponent('/products'));
  };

  const handleViewDetails = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
    }
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
        <StickyHeaderWrapper />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2a8a]"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <StickyHeaderWrapper />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Title and Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {categoryDisplayNames[selectedCategory] || 'Products'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent"
            >
              <option value="default">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>

            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => handleViewChange('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#1a2a8a] text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Grid view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => handleViewChange('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#1a2a8a] text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="List view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex space-x-2 min-w-max">
            {Object.keys(categoryDisplayNames).map((catId) => (
              <button
                key={catId}
                onClick={() => handleCategoryChange(catId)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  selectedCategory === catId
                    ? 'bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <span className="text-lg">{categoryIcons[catId]}</span>
                <span className="font-medium text-sm whitespace-nowrap">{categoryDisplayNames[catId]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Display */}
        {filteredProducts.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 h-48 md:h-auto overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format';
                        }}
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                            {product.title}
                          </h3>
                          {product.category && (
                            <span className="inline-block bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white text-xs px-2 py-1 rounded-full">
                              {product.category}
                            </span>
                          )}
                        </div>
                        <span className="text-2xl font-bold text-[#1a2a8a] dark:text-green-400">
                          ₦{product.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {product.spec || 'High-quality solar product for your energy needs.'}
                      </p>
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleViewDetails(product.id)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          className="px-6 py-2 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">{categoryIcons[selectedCategory]}</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't find any products in this category.
            </p>
            <button
              onClick={() => handleCategoryChange('all')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              View All Products
            </button>
          </div>
        )}
      </div>

      <Footer />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div>
                <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 mb-4">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format';
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                {selectedProduct.category && (
                  <span className="inline-block bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white text-sm px-3 py-1 rounded-full mb-4 w-fit">
                    {selectedProduct.category}
                  </span>
                )}

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {selectedProduct.title}
                </h2>

                <div className="space-y-2 mb-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Brand:</span> {selectedProduct.brand || 'N/A'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Specifications:</span> {selectedProduct.spec || 'N/A'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Capacity:</span> {selectedProduct.capacity || 'N/A'}
                  </p>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-[#1a2a8a] dark:text-green-400">
                    ₦{selectedProduct.price.toLocaleString()}
                  </span>
                </div>

                <div className="mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedProduct.inStock
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {selectedProduct.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                  </span>
                  {selectedProduct.inventory && selectedProduct.inventory < 10 && selectedProduct.inStock && (
                    <span className="ml-3 text-sm text-orange-600 dark:text-orange-400">
                      Only {selectedProduct.inventory} left
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                      <button
                        onClick={() => {
                          const qtyInput = document.getElementById('modal-quantity') as HTMLInputElement;
                          if (qtyInput) {
                            const newQty = Math.max(1, parseInt(qtyInput.value) - 1);
                            qtyInput.value = newQty.toString();
                          }
                        }}
                        disabled={!selectedProduct.inStock}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <input
                        id="modal-quantity"
                        type="number"
                        min="1"
                        max={selectedProduct.inventory || 99}
                        defaultValue="1"
                        className="w-16 px-2 py-2 text-center text-gray-900 dark:text-white font-medium border-x border-gray-300 dark:border-gray-600 bg-transparent"
                      />
                      <button
                        onClick={() => {
                          const qtyInput = document.getElementById('modal-quantity') as HTMLInputElement;
                          if (qtyInput) {
                            const max = selectedProduct.inventory || 99;
                            const newQty = Math.min(max, parseInt(qtyInput.value) + 1);
                            qtyInput.value = newQty.toString();
                          }
                        }}
                        disabled={!selectedProduct.inStock}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                  <button
                    onClick={() => {
                      const qtyInput = document.getElementById('modal-quantity') as HTMLInputElement;
                      const qty = parseInt(qtyInput?.value || '1');
                      for (let i = 0; i < qty; i++) {
                        addItem(selectedProduct);
                      }
                      closeModal();
                      addNotification('success', `${qty} x ${selectedProduct.title} added to cart!`);
                    }}
                    disabled={!selectedProduct.inStock}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        closeModal();
                        handleRequireLogin();
                        return;
                      }
                      if (isInWishlist(selectedProduct.id)) {
                        handleRemoveFromWishlist(selectedProduct.id);
                      } else {
                        handleAddToWishlist(selectedProduct.id);
                      }
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

                {selectedProduct.warranty && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-[#1a2a8a] dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Warranty: {selectedProduct.warranty}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main page component with Suspense
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}


