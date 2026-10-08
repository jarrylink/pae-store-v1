'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, TrendingUp, DollarSign, Users, Package,
  Truck, Megaphone, Leaf, Building2, Brain, Bell, FileText,
  Menu, X
} from 'lucide-react';

const navItems = [
  { name: 'Executive', href: '/admin/analytics', icon: LayoutDashboard },
  { name: 'Revenue', href: '/admin/analytics/revenue', icon: TrendingUp },
  { name: 'Financial', href: '/admin/analytics/financial', icon: DollarSign },
  { name: 'Customers', href: '/admin/analytics/customers', icon: Users },
  { name: 'Operations', href: '/admin/analytics/operations', icon: Package },
  { name: 'Field Services', href: '/admin/analytics/field', icon: Truck },
  { name: 'Marketing', href: '/admin/analytics/marketing', icon: Megaphone },
  { name: 'ESG', href: '/admin/analytics/esg', icon: Leaf },
  { name: 'Investor', href: '/admin/analytics/investor', icon: Building2 },
  { name: 'AI', href: '/admin/analytics/ai', icon: Brain },
  { name: 'Alerts', href: '/admin/analytics/alerts', icon: Bell },
  { name: 'Reports', href: '/admin/analytics/reports', icon: FileText },
];

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLinkClick = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  // For mobile: use button to open/close
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`
            fixed left-4 top-4 bottom-4 z-40
            bg-white/95 dark:bg-gray-900/95
            backdrop-blur-md
            border border-gray-200 dark:border-gray-700
            shadow-xl
            transition-all duration-300 ease-in-out
            rounded-2xl
            overflow-hidden
            w-48
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-56'}
          `}
        >
          <div className="h-full overflow-y-auto">
            <nav className="py-4 px-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`
                      flex items-center gap-2.5
                      px-3 py-2.5
                      rounded-xl transition-all duration-200
                      w-full
                      ${isActive
                        ? 'bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="w-full min-h-screen">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Desktop: hover to expand
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar - Expands on hover */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed left-4 z-40
          bg-white/95 dark:bg-gray-900/95
          backdrop-blur-md
          border border-gray-200 dark:border-gray-700
          shadow-xl
          transition-all duration-300 ease-in-out
          rounded-2xl
          overflow-hidden
        `}
        style={{
          bottom: '16px',
          height: '560px',
          width: isHovered ? '180px' : '52px',
        }}
      >
        {/* Navigation */}
        <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav className="py-3 px-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3
                    px-2.5 py-2.5
                    rounded-xl transition-all duration-200
                    group relative
                    ${isHovered ? 'w-full' : 'w-9 justify-center'}
                    ${isActive
                      ? 'bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {isHovered && (
                    <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
                  )}
                  {!isHovered && (
                    <span className="
                      absolute left-full ml-2 px-2 py-1
                      bg-gray-900 text-white text-xs rounded-md
                      whitespace-nowrap opacity-0 invisible
                      group-hover:opacity-100 group-hover:visible
                      transition-all duration-200 z-50
                      pointer-events-none
                    ">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom indicator */}
        <div className="p-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex justify-center">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="w-full min-h-screen">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
