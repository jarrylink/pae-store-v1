'use client';

import React, { useState, useEffect, Suspense } from 'react';
import StickyHeaderWrapper from '@/components/layout/StickyHeaderWrapper';
import Footer from '@/components/layout/footer/Footer';
import CartDrawer from '@/components/features/cart/CartDrawer';
import FloatingWhatsApp from '@/components/ui/FloatingWhatsApp';
import { useAccessoryStore } from '@/lib/stores/accessoryStore';
import { useCartStore } from '@/lib/stores/cartStore';
import { useAuthStore } from '@/lib/stores/authStore';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import { formatCurrency } from '@/utils';
import { Search, Plus, Minus, Package, ShoppingCart, Filter, ChevronDown } from 'lucide-react';

function AccessoriesLoading() {
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

function AccessoriesContent() {
  const { accessories, loading, fetchAccessories } = useAccessoryStore();
  const { addAccessory, getTotalItems } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    fetchAccessories();
  }, [fetchAccessories]);

  const handleQuantityChange = (accessoryId: number, change: number, maxStock: number = 999) => {
    setQuantities(prev => {
      const current = prev[accessoryId] || 1;
      const newQty = Math.max(1, Math.min(maxStock, current + change));
      return { ...prev, [accessoryId]: newQty };
    });
  };

  const handleAddToCart = (accessory: any) => {
    const quantity = quantities[accessory.id] || 1;
    if (quantity <= 0) return;
    addAccessory(accessory, quantity);
    addNotification('success', `${quantity} x ${accessory.name} added to cart!`);
    setQuantities(prev => ({
      ...prev,
      [accessory.id]: 1
    }));
  };

  const categories = ['all', ...Array.from(new Set(accessories.map(a => a.category).filter(Boolean)))];

  const filteredAccessories = accessories.filter(a => {
    if (!a.isActive) return false;
    const search = searchTerm.toLowerCase();
    const matchesSearch = a.name.toLowerCase().includes(search) ||
                         (a.category || '').toLowerCase().includes(search) ||
                         (a.sku || '').toLowerCase().includes(search);
    const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalCartCount = getTotalItems ? getTotalItems() : 0;

  return (
    <>
      <StickyHeaderWrapper />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Installation Accessories
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Complete your solar installation with quality cables, changeovers, breakers & mounting equipment
              </p>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-[#1a2a8a] hover:bg-[#0f1a66] text-white rounded-lg transition-colors font-medium text-sm shadow-sm active:scale-95"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span>View Cart</span>
              {totalCartCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-white text-[#1a2a8a] font-bold rounded-full">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search accessories by name, category, or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                />
              </div>
              <div className="relative sm:w-56">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none text-sm cursor-pointer"
                >
                  {categories.map((cat) => {
                    const displayName = cat === 'all' ? 'All Categories' : (cat || '').charAt(0).toUpperCase() + (cat || '').slice(1);
                    return (
                      <option key={cat} value={cat}>
                        {displayName}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Grid View */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                  <div className="h-44 sm:h-48 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAccessories.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-750">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No accessories found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search query or switching categories.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredAccessories.map((accessory) => {
                const qty = quantities[accessory.id] || 1;
                const isOutOfStock = accessory.stock !== undefined && accessory.stock <= 0;
                const isLowStock = accessory.stock !== undefined && accessory.stock > 0 && accessory.stock <= 5;

                return (
                  <div
                    key={accessory.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group"
                  >
                    {/* Image Header */}
                    <div className="relative h-44 sm:h-48 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 dark:from-gray-800 dark:to-gray-750 flex items-center justify-center p-3 overflow-hidden">
                      {accessory.image ? (
                        <img
                          src={accessory.image}
                          alt={accessory.name}
                          className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Package className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                      )}
                      {accessory.category && (
                        <span className="absolute top-3 left-3 text-[11px] font-medium bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-gray-800 dark:text-gray-200 px-2.5 py-0.5 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                          {accessory.category}
                        </span>
                      )}
                      {isLowStock && (
                        <span className="absolute top-3 right-3 text-[11px] font-semibold bg-amber-500 text-white px-2 py-0.5 rounded shadow-sm">
                          Only {accessory.stock} left
                        </span>
                      )}
                      {isOutOfStock && (
                        <span className="absolute top-3 right-3 text-[11px] font-semibold bg-red-600 text-white px-2 py-0.5 rounded shadow-sm">
                          Out of stock
                        </span>
                      )}
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3
                          className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm sm:text-base leading-snug group-hover:text-[#1a2a8a] dark:group-hover:text-blue-400 transition-colors"
                          title={accessory.name}
                        >
                          {accessory.name}
                        </h3>
                        {accessory.sku && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">
                            SKU: {accessory.sku}
                          </p>
                        )}
                      </div>

                      <div className="mt-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-lg sm:text-xl font-bold text-[#1a2a8a] dark:text-green-400 truncate">
                            {formatCurrency(accessory.price)}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            Stock: <strong className="text-gray-800 dark:text-gray-200 font-medium">{accessory.stock || 0}</strong> {accessory.unit || 'pcs'}
                          </span>
                        </div>

                        {/* Responsive Stepper + Add to Cart Row */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60">
                          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-750">
                            <button
                              onClick={() => handleQuantityChange(accessory.id, -1, accessory.stock || 999)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-l-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              disabled={qty <= 1 || isOutOfStock}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white">
                              {qty}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(accessory.id, 1, accessory.stock || 999)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              disabled={qty >= (accessory.stock || 999) || isOutOfStock}
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleAddToCart(accessory)}
                            disabled={isOutOfStock}
                            className="flex-1 py-2 px-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white text-xs sm:text-sm font-medium rounded-lg hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm min-w-0"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">
                              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <FloatingWhatsApp />
    </>
  );
}

const AccessoriesPage = () => {
  return (
    <Suspense fallback={<AccessoriesLoading />}>
      <AccessoriesContent />
    </Suspense>
  );
};

export default AccessoriesPage;
