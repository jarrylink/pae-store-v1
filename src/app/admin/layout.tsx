'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import ParticleBackground from '@/components/features/particles/ParticleBackground';
import { Home, LogOut, LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, Wrench, Tag, Box, FileText, Menu, X, User, ChevronDown } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const accountDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAccountDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountDropdownOpen(false);
      }
    };

    if (isAccountDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAccountDropdownOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setIsAccountDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const getUserInitials = () => {
    if (!user) return 'A';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName[0].toUpperCase();
    }
    return 'A';
  };

  // Check if user is authorized (superadmin or staff)
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/');
      return;
    }

    // Check user role
    if (user.role === 'superadmin' || user.role === 'staff') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Navigation items for admin panel
  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Invoices', href: '/admin/invoices', icon: FileText },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Services', href: '/admin/services', icon: Wrench },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Accessories', href: '/admin/accessories', icon: Package },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  // Show loading state
  if (isAuthorized === null) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-white">
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized state
  if (isAuthorized === false) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-white">
        <div className="relative z-10 text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.332 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin panel.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const isInvoiceStudio = pathname === '/admin/invoices';

  return (
    <div
      className={`relative ${
        isInvoiceStudio ? 'h-screen overflow-hidden flex flex-col' : 'min-h-screen'
      } bg-white dark:bg-gray-900`}
    >
      {/* Particle Background - Layer 0 */}
      <div className="fixed inset-0 z-0">
        <ParticleBackground />
      </div>
      
      {/* Main Content - Layer 10 (above particles) */}
      <div className={`relative z-10 ${isInvoiceStudio ? 'flex flex-col h-full overflow-hidden' : ''}`}>
        {/* Main Header with Welcome and Store Link - hidden on Invoice Studio to preserve vertical space */}
        {!isInvoiceStudio && (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.firstName}!</h1>
                  <p className="text-gray-500 mt-1">Here's your business overview.</p>
                </div>
                <Link 
                  href="/" 
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  <Home className="w-4 h-4" />
                  <span className="text-sm font-medium">Back to Store</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Bar */}
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Navigation Links (Desktop) */}
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        isActive 
                          ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/40 dark:text-blue-300' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              
              {/* Account Dropdown Menu */}
              <div className="relative" ref={accountDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsAccountDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Account menu"
                  aria-expanded={isAccountDropdownOpen}
                  aria-haspopup="menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user?.firstName ? getUserInitials() : <User className="w-4 h-4" />}
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                      isAccountDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isAccountDropdownOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                  >
                    {/* User Profile Header */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/60">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                          {getUserInitials()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {user?.firstName} {user?.lastName}
                          </p>
                          {user?.email && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          )}
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                              {user?.role || 'Admin'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="p-1 space-y-0.5">
                      <Link
                        href="/"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg transition-colors"
                      >
                        <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium">Store</span>
                      </Link>

                      <Link
                        href="/admin/settings"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                    {/* Logout Action */}
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setIsAccountDropdownOpen(false);
                          logout();
                          router.push('/');
                        }}
                        role="menuitem"
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Drawer Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 space-y-1 shadow-lg max-h-[70vh] overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      isActive
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                >
                  <Home className="w-4 h-4" />
                  <span>Back to Store</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    router.push('/');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Page Content */}
        <div
          className={
            isInvoiceStudio
              ? 'w-full h-[calc(100vh-56px)] px-2 sm:px-4 py-2 overflow-hidden flex flex-col'
              : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;






