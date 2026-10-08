'use client';

import React, { useState, useEffect, Suspense } from 'react';
import StickyHeaderWrapper from '@/components/layout/StickyHeaderWrapper';
import Footer from '@/components/layout/footer/Footer';
import CartDrawer from '@/components/features/cart/CartDrawer';
import { useServiceStore } from '@/lib/stores/serviceStore';
import { useCartStore } from '@/lib/stores/cartStore';
import { useAuthStore } from '@/lib/stores/authStore';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import { formatCurrency } from '@/utils';
import { Search, Plus, Minus, Package, ShoppingCart, Filter } from 'lucide-react';

function ServicesLoading() {
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

function ServicesContent() {
  const { services, loading, fetchServices } = useServiceStore();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const handleQuantityChange = (serviceId: number, change: number) => {
    setQuantities(prev => {
      const current = prev[serviceId] || 0;
      const newQty = Math.max(0, current + change);
      if (newQty === 0) {
        const { [serviceId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [serviceId]: newQty };
    });
  };

  const handleAddToCart = (service: any) => {
    const quantity = quantities[service.id] || 1;
    if (quantity <= 0) return;
    addItem({
      ...service,
      id: service.id,
      serviceId: service.id,
      title: service.name,
      name: service.name,
      price: Number(service.price),
      quantity: quantity,
      type: 'service'
    }, quantity);
    addNotification('success', `${quantity} x ${service.name} added to cart!`);
    setQuantities(prev => {
      const { [service.id]: _, ...rest } = prev;
      return rest;
    });
  };

  const categories = ['all', ...new Set(services.map(s => s.category).filter(Boolean))];

  const filteredServices = services.filter(s => {
    if (!s.isActive) return false;
    const search = searchTerm.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(search) ||
                         (s.category || '').toLowerCase().includes(search);
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <StickyHeaderWrapper />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Our Services</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Professional solar installation and maintenance services</p>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-[#1a2a8a] text-white rounded-lg hover:bg-[#0f1a66] transition-colors"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              View Cart
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="relative sm:w-48">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
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
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No services found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => {
                const qty = quantities[service.id] || 1;
                return (
                  <div key={service.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all">
                    <div className="relative h-48 bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
                      {service.image ? (
                        <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-16 h-16 text-white/50" />
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{service.name}</h3>
                      <p className="text-2xl font-bold text-[#1a2a8a] dark:text-green-400 mt-1">{formatCurrency(service.price)}</p>
                      {service.duration && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Duration: {service.duration}</p>
                      )}
                      {service.category && (
                        <span className="inline-block mt-2 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {service.category}
                        </span>
                      )}

                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() => handleQuantityChange(service.id, -1)}
                          className="p-1.5 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                          disabled={qty <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-medium">{qty}</span>
                        <button
                          onClick={() => handleQuantityChange(service.id, 1)}
                          className="p-1.5 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAddToCart(service)}
                          className="ml-auto px-4 py-2 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </button>
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
    </>
  );
}

const ServicesPage = () => {
  return (
    <Suspense fallback={<ServicesLoading />}>
      <ServicesContent />
    </Suspense>
  );
};

export default ServicesPage;


