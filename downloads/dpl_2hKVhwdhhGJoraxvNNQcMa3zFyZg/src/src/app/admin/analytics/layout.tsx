'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, TrendingUp, DollarSign, Users, Package,
  Truck, Megaphone, Leaf, Building2, Brain, Bell, FileText,
  Database, Settings, ChevronLeft, ChevronRight
} from 'lucide-react';

const navItems = [
  { name: 'Executive Command', href: '/admin/analytics', icon: LayoutDashboard },
  { name: 'Revenue & Sales', href: '/admin/analytics/revenue', icon: TrendingUp },
  { name: 'Financial Intelligence', href: '/admin/analytics/financial', icon: DollarSign },
  { name: 'Customer Intelligence', href: '/admin/analytics/customers', icon: Users },
  { name: 'Operations & Supply', href: '/admin/analytics/operations', icon: Package },
  { name: 'Field Services', href: '/admin/analytics/field', icon: Truck },
  { name: 'Marketing Intelligence', href: '/admin/analytics/marketing', icon: Megaphone },
  { name: 'ESG & Impact', href: '/admin/analytics/esg', icon: Leaf },
  { name: 'Investor Intelligence', href: '/admin/analytics/investor', icon: Building2 },
  { name: 'AI Intelligence', href: '/admin/analytics/ai', icon: Brain },
  { name: 'Alerts Center', href: '/admin/analytics/alerts', icon: Bell },
  { name: 'Reports Center', href: '/admin/analytics/reports', icon: FileText },
  { name: 'Data & Audit', href: '/admin/analytics/audit', icon: Database },
  { name: 'Settings', href: '/admin/analytics/settings', icon: Settings },
];

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 border-b`}>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#1a2a8a] to-[#40b553] bg-clip-text text-transparent">
                Analytics Center
              </h1>
              <p className="text-xs text-gray-500">Power Afric Intelligence</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
