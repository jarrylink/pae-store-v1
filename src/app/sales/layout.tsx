'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ParticleBackground from '@/components/features/particles/ParticleBackground';
import { Home, LogOut, Shield } from 'lucide-react';

interface SalesLayoutProps {
  children: React.ReactNode;
}

export default function SalesLayout({ children }: SalesLayoutProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/');
      return;
    }

    // Check user role: sales_agent or superadmin
    if (user.role === 'sales_agent' || user.role === 'superadmin') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You do not have permission to access the Sales Agent portal.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <ParticleBackground />
      </div>

      <div className="relative z-10">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                    Sales Agent Portal
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Power Afric Energy Services Ltd
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  Store Front
                </Link>

                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 capitalize">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>

                <button
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
