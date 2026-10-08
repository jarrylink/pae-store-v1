'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { useUserProfileStore } from '@/lib/stores/userStore';
import { useCartStore } from '@/lib/stores/cartStore';
import { useWishlistStore } from '@/lib/stores/wishlistStore';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import OrdersContent from '@/components/account/orders/OrdersContent';
import AddressesContent from '@/components/account/addresses/AddressesContent';
import ProfileContent from '@/components/account/profile/ProfileContent';
import WishlistContent from '@/components/account/wishlist/WishlistContent';
import SecurityContent from '@/components/account/security/SecurityContent';
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Shield,
  ChevronLeft,
  Menu,
  LogOut,
  ShoppingBag
} from 'lucide-react';

type TabType = 'profile' | 'orders' | 'wishlist' | 'addresses' | 'security' | 'payment';

export default function AccountPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { profile, wishlist, orders, addresses, setOrders, removeFromWishlist } = useUserProfileStore();
  const { addItem } = useCartStore();
  const { addNotification } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Check URL for tab parameter on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as TabType;
      if (tabParam && ['profile', 'orders', 'wishlist', 'addresses', 'security', 'payment'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Fetch user orders from API on mount and when user or activeTab changes
  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) return;
      try {
        const response = await fetch(`/api/orders?userId=${user.id}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        if (response.ok) {
          const ordersData = await response.json();
          setOrders(ordersData);
        } else {
          console.error('Failed to fetch orders:', response.status);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    fetchUserOrders();
  }, [user, activeTab, setOrders]);

  const { items: wishlistItems, initializeWishlist, initialized } = useWishlistStore();

  // Initialize wishlist when user is available
  useEffect(() => {
    let mounted = true;
    if (user && !initialized) {
      initializeWishlist(user.id).catch(err => {
        if (mounted) console.error('Failed to load wishlist:', err);
      });
    }
    return () => { mounted = false; };
  }, [user, initializeWishlist, initialized]);

  // Handle profile update
  const handleUpdateProfile = async (userData: any) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, ...userData })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        addNotification('success', 'Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      addNotification('error', 'Failed to update profile');
      throw error;
    }
  };

  const navigationItems = [
    {
      id: 'profile' as TabType,
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      description: 'Manage your personal information'
    },
    {
      id: 'orders' as TabType,
      label: 'Orders & History',
      icon: <Package className="w-5 h-5" />,
      description: 'View order history and track shipments'
    },
    {
      id: 'wishlist' as TabType,
      label: 'Wishlist',
      icon: <Heart className="w-5 h-5" />,
      description: 'Your saved favorite products'
    },
    {
      id: 'addresses' as TabType,
      label: 'Address Book',
      icon: <MapPin className="w-5 h-5" />,
      description: 'Manage shipping addresses'
    },
    {
      id: 'payment' as TabType,
      label: 'Payment Methods',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Manage your payment cards'
    },
    {
      id: 'security' as TabType,
      label: 'Security',
      icon: <Shield className="w-5 h-5" />,
      description: 'Password and security settings'
    }
  ];

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2a8a] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your account...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileContent user={user} onUpdate={handleUpdateProfile} />;
      case 'orders':
        return (
          <OrdersContent
            orders={orders}
            onOrderSelect={setSelectedOrder}
            selectedOrder={selectedOrder}
            onBackToOrders={() => setSelectedOrder(null)}
          />
        );
      case 'wishlist':
        return <WishlistContent />;
      case 'addresses':
        return <AddressesContent addresses={addresses} />;
      case 'payment':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Payment Methods</h2>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Manage your payment methods and billing information.
              </p>
              <button className="px-4 py-2 bg-[#1a2a8a] hover:bg-[#0f1a66] text-white rounded-lg font-medium transition-colors">
                Add Payment Method
              </button>
            </div>
          </div>
        );
      case 'security':
        return <SecurityContent />;
      default:
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {navigationItems.find(item => item.id === activeTab)?.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {navigationItems.find(item => item.id === activeTab)?.label}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {navigationItems.find(item => item.id === activeTab)?.description}
            </p>
          </div>
        );
    }
  };

  return (
    <>
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .power-afric-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .power-afric-scrollbar::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.5);
          border-radius: 10px;
        }
        .power-afric-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #1a2a8a, #40b553);
          border-radius: 10px;
        }
        .power-afric-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0f1a66, #2d8a3d);
        }
        .dark .power-afric-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.5);
        }
        .power-afric-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #1a2a8a rgba(243, 244, 246, 0.5);
        }
        .dark .power-afric-scrollbar {
          scrollbar-color: #40b553 rgba(55, 65, 81, 0.5);
        }
      `}</style>
      <div className="min-h-[90vh] flex flex-col overflow-hidden">
        {/* Mobile Navigation Overlay */}
        {isMobileNavOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileNavOpen(false)}
          />
        )}

        {/* Mobile Navigation Slide Bar */}
        <div className={`
          fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm
          shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
          lg:hidden
          ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full flex flex-col p-4">
            {/* Mobile Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face"}
                  alt={user.firstName}
                  className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800"
                />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Account</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2 flex-1 overflow-y-auto power-afric-scrollbar">
              {navigationItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSelectedOrder(null);
                      setIsMobileNavOpen(false);
                    }}
                    className={`w-full text-left flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white shadow-lg'
                        : 'bg-gray-50/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-gray-700 dark:text-gray-300">{item.icon}</div>
                    <div className="flex-1 text-left">
                      <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        {item.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Footer */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <div className="flex justify-between text-center">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{orders.length}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">ORDERS</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{wishlistItems.length}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">WISHLIST</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Management Screen */}
        <div className="flex-1 flex overflow-hidden pt-3">
          <div className="max-w-7xl mx-auto w-full flex-1 flex overflow-hidden px-4 sm:px-6 lg:px-8">

            {/* Desktop Sidebar Navigation */}
            <div className="hidden lg:block w-72 flex-shrink-0 mr-6">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                {/* Horizontal Header - User info next to DP */}
                <div className="p-4 pb-3 flex-shrink-0 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face"}
                        alt={user.firstName}
                        className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 shadow-md"
                      />
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {user.email}
                      </p>
                      <div className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1.5 flex-1 overflow-y-auto p-3 power-afric-scrollbar">
                  {navigationItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setSelectedOrder(null);
                        }}
                        className={`group relative w-full text-left flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white shadow-lg'
                            : 'bg-gray-50/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow'
                        }`}
                      >
                        <div className="flex-shrink-0">{item.icon}</div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className={`font-semibold text-sm transition-colors ${
                            isActive ? 'text-white' : 'text-gray-900 dark:text-white'
                          }`}>
                            {item.label}
                          </p>
                          <p className={`text-xs transition-colors mt-0.5 ${
                            isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {item.description}
                          </p>
                        </div>
                        {isActive && (
                          <div className="flex-shrink-0 animate-pulse">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* Footer Stats */}
                <div className="p-1.5 border-t border-gray-200 dark:border-gray-600 flex-shrink-0 bg-gray-50/50 dark:bg-gray-700/50 rounded-b-2xl">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{orders.length}</p>
                        <p className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">ORDERS</p>
                      </div>
                      <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{wishlistItems.length}</p>
                        <p className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">WISHLIST</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-0.5 text-gray-400 dark:text-gray-500">
                      <div className="w-0.5 h-0.5 bg-current rounded-full"></div>
                      <div className="w-0.5 h-0.5 bg-current rounded-full"></div>
                      <div className="w-0.5 h-0.5 bg-current rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                {/* Content Header */}
                <div className="p-4 pb-3 flex-shrink-0 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Mobile Menu Button */}
                      <button
                        onClick={() => setIsMobileNavOpen(true)}
                        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Menu className="w-5 h-5" />
                      </button>
                      <Link
                        href="/"
                        className="hidden lg:flex items-center space-x-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <ChevronLeft className="w-3 h-3" />
                        <span className="text-xs font-medium">Store</span>
                      </Link>
                      <div className="hidden lg:block h-3 w-px bg-gray-300 dark:bg-gray-600"></div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">
                          {navigationItems.find(item => item.id === activeTab)?.label}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">
                          {navigationItems.find(item => item.id === activeTab)?.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden sm:inline">ACTIVE</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Content */}
                <div className="flex-1 overflow-y-auto p-4 power-afric-scrollbar">
                  <div className="animate-fade-in-up">
                    {renderTabContent()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}