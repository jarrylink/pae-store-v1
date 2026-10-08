'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ui/ThemeToggle';
import HeaderSearch from './HeaderSearch';
import CartDrawer from '@/components/features/cart/CartDrawer';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import { useCartStore } from '@/lib/stores/cartStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Menu, 
  X,
  Home,
  Package,
  Wrench,
  Shield,
  Settings,
  Heart,
  MapPin,
  CreditCard,
  Phone,
  Zap
} from 'lucide-react';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const { items, accessories, editingOrderId, editingOrderNumber, cancelEditingOrder } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0) +
                        accessories.reduce((total, item) => total + item.quantity, 0);

  const getUserInitials = () => {
    if (!user) return '';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleLogout = () => {
    logout();
    setIsAccountDropdownOpen(false);
  };

  const handleLoginClick = () => {
    setIsLoginOpen(true);
    setIsAccountDropdownOpen(false);
  };

  const handleRegisterClick = () => {
    setIsRegisterOpen(true);
    setIsAccountDropdownOpen(false);
  };

  const closeAllModals = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
  };

  const switchToRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const switchToLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isSuperAdmin = user?.role === 'superadmin';
  const isStaff = user?.role === 'staff';
  const isAdminUser = isSuperAdmin || isStaff;

  const navItems = [
    { name: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Solar Products', href: '/products', icon: <Package className="w-4 h-4" /> },
    { name: 'Accessories', href: '/accessories', icon: <Wrench className="w-4 h-4" /> },
    { name: 'Services', href: '/services', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      {!isAdminUser && (
        <div className="bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white py-2 px-4 text-sm font-medium text-center">
          <div className="max-w-7xl mx-auto flex justify-center items-center">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>080 3366 6041</span>
              </span>
              <span className="hidden sm:inline-flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                <span>24/7 Solar Support</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Global Editing Order Notification Banner */}
      {editingOrderId && (
        <div className="bg-[#1a2a8a] text-white py-2 px-4 text-xs sm:text-sm font-medium shadow-inner z-50 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold">✏️ Editing Order #{editingOrderNumber || editingOrderId}</span>
              <span className="hidden md:inline opacity-90">— Items you add or change will update this pending order.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/cart"
                className="px-2.5 py-1 bg-white text-blue-900 rounded font-semibold text-xs hover:bg-blue-50 transition-colors shadow-sm"
              >
                View Order Cart
              </Link>
              <button
                onClick={() => {
                  cancelEditingOrder();
                  useNotificationStore.getState().addNotification('info', 'Order editing cancelled. Cart reverted.');
                }}
                className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <img
                src="https://res.cloudinary.com/djkudkxmx/image/upload/v1779180201/energy_store_2_ajl0so.png"
                alt="Power Afric Store"
                className="h-7 sm:h-8"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                      isActive 
                        ? 'text-[#1a2a8a] dark:text-green-400 border-b-2 border-[#1a2a8a] dark:border-green-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:text-[#1a2a8a] dark:hover:text-green-400'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
              {isAdminUser && (
                <Link
                  href={isSuperAdmin ? "/admin/dashboard" : "/staff/dashboard"}
                  className="ml-2 px-3 py-2 text-sm font-bold rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center gap-1.5"
                >
                  <Shield className="w-4 h-4" />
                  {isSuperAdmin ? 'ADMIN' : 'STAFF'}
                </Link>
              )}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              <HeaderSearch />

              <div className="hidden md:block">
                <ThemeToggle />
              </div>

              {!isAdminUser && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Open cart"
                >
                  <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#1a2a8a] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              )}

              {/* Account Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleAccountDropdown}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white font-semibold text-sm hover:scale-105 transition-transform"
                  aria-label="Account menu"
                >
                  {isAuthenticated && user ? (
                    getUserInitials()
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </button>

                {/* Dropdown Menu */}
                {isAccountDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      {isAuthenticated && user ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1a2a8a] to-[#40b553] flex items-center justify-center text-white font-bold">
                            {getUserInitials()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-700 dark:text-gray-300">Account</div>
                      )}
                    </div>
                    <div className="p-1">
                      {isAuthenticated ? (
                        <>
                          <Link
                            href="/account"
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            onClick={() => setIsAccountDropdownOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            <span>My Account</span>
                          </Link>
                          <Link
                            href="/account?tab=orders"
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            onClick={() => setIsAccountDropdownOpen(false)}
                          >
                            <Package className="w-4 h-4" />
                            <span>My Orders</span>
                          </Link>
                          <Link
                            href="/account?tab=wishlist"
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            onClick={() => setIsAccountDropdownOpen(false)}
                          >
                            <Heart className="w-4 h-4" />
                            <span>Wishlist</span>
                          </Link>
                          <Link
                            href="/account?tab=addresses"
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            onClick={() => setIsAccountDropdownOpen(false)}
                          >
                            <MapPin className="w-4 h-4" />
                            <span>Addresses</span>
                          </Link>
                          <Link
                            href="/account?tab=payment"
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            onClick={() => setIsAccountDropdownOpen(false)}
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>Payment</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleLoginClick}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <User className="w-4 h-4" />
                            <span>Sign In</span>
                          </button>
                          <button
                            onClick={handleRegisterClick}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <User className="w-4 h-4" />
                            <span>Create Account</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                {/* Theme Toggle in Mobile Menu */}
                <div className="px-3 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark/Light Mode</span>
                  <ThemeToggle />
                </div>

                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                        isActive 
                          ? 'text-[#1a2a8a] dark:text-green-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:text-[#1a2a8a] dark:hover:text-green-400'
                      }`}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  );
                })}

                {isAdminUser && (
                  <Link
                    href={isSuperAdmin ? "/admin/dashboard" : "/staff/dashboard"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block mt-2 px-3 py-2 text-sm font-bold rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center"
                  >
                    {isSuperAdmin ? 'ADMIN DASHBOARD' : 'STAFF DASHBOARD'}
                  </Link>
                )}

                {/* Mobile Account Links */}
                {isAuthenticated ? (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                      <Link
                        href="/account"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        My Account
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <button
                      onClick={() => {
                        handleLoginClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        handleRegisterClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      Create Account
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={closeAllModals} onSwitchToRegister={switchToRegister} />
      <RegisterModal isOpen={isRegisterOpen} onClose={closeAllModals} onSwitchToLogin={switchToLogin} />
    </>
  );
};

export default Header;