'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { useInvoiceDraftStore } from '@/lib/stores/invoiceDraftStore';
import InvoiceManager from '@/components/admin/invoices/InvoiceManager';
import {
  Sparkles,
  FileText,
  ArrowLeft,
  ChevronRight,
  Shield,
  Layers,
  FileSpreadsheet,
  PlusCircle,
  Zap,
} from 'lucide-react';

// Dynamically import client-only AI Agent & Canvas with SSR disabled to prevent hydration mismatches
const InvoiceChatAssistant = dynamic(
  () => import('@/components/admin/invoices/InvoiceChatAssistant'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 h-[650px] lg:h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Loading AI Sales Agent...</p>
        </div>
      </div>
    ),
  }
);

const EditableInvoiceReceipt = dynamic(
  () => import('@/components/admin/invoices/EditableInvoiceReceipt'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 h-[750px] lg:h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Loading Commercial Invoice Canvas...</p>
        </div>
      </div>
    ),
  }
);

export default function AdminInvoicesPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const { invoiceNumber, items, calculateTotals } = useInvoiceDraftStore();
  const [activeTab, setActiveTab] = useState<'ai-sales-agent' | 'manual-invoice'>('ai-sales-agent');
  const [mobileSplitView, setMobileSplitView] = useState<'chat' | 'canvas'>('chat');

  useEffect(() => {
    setMounted(true);
  }, []);

  const totals = calculateTotals();

  if (!mounted || !user) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Authenticating admin session...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden space-y-2">
      {/* Compact Top Header & Breadcrumb Bar */}
      <div className="bg-white dark:bg-gray-800 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors shrink-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-gray-800 dark:text-gray-200 font-medium">Invoices</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold text-xs">
              {activeTab === 'ai-sales-agent' ? invoiceNumber : 'Registry'}
            </span>
          </div>

          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />

          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5">
              {activeTab === 'ai-sales-agent' ? (
                <>
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>AI Sales Agent</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Manual Invoice & Records</span>
                </>
              )}
            </h1>
            <span
              className={`hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                activeTab === 'ai-sales-agent'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
              }`}
            >
              {activeTab === 'ai-sales-agent' ? 'Split Canvas' : 'Direct Entry'}
            </span>
          </div>
        </div>

        {/* View Switcher Tabs: AI Sales Agent & Manual Invoice */}
        <div className="flex items-center p-0.5 bg-gray-100 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner self-start sm:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('ai-sales-agent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'ai-sales-agent'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Sales Agent</span>
          </button>

          <button
            onClick={() => setActiveTab('manual-invoice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'manual-invoice'
                ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Manual Invoice</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Tab Switcher (Only visible on screens < lg in AI Sales Agent mode) */}
      {activeTab === 'ai-sales-agent' && (
        <div className="flex lg:hidden items-center justify-between gap-2 p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs shrink-0">
          <div className="flex items-center flex-1 p-0.5 bg-gray-100 dark:bg-gray-750 rounded-md">
            <button
              onClick={() => setMobileSplitView('chat')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-3 rounded text-xs font-semibold transition-all ${
                mobileSplitView === 'chat'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>AI Chat Assistant</span>
            </button>
            <button
              onClick={() => setMobileSplitView('canvas')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-3 rounded text-xs font-semibold transition-all ${
                mobileSplitView === 'canvas'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Invoice Sheet {items.length > 0 && `(${items.length})`}</span>
            </button>
          </div>

          {items.length > 0 && mobileSplitView === 'chat' && (
            <button
              onClick={() => setMobileSplitView('canvas')}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 shrink-0 flex items-center gap-1"
            >
              <span>View Sheet →</span>
            </button>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === 'ai-sales-agent' ? (
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3 items-stretch overflow-hidden">
          {/* Left Panel: 40% Width Conversational AI Sales Agent */}
          <div
            className={`w-full lg:w-[40%] h-full min-h-0 flex-col overflow-hidden ${
              mobileSplitView === 'chat' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <InvoiceChatAssistant />
          </div>

          {/* Right Panel: 60% Width Live Editable Commercial Invoice Canvas */}
          <div
            className={`w-full lg:w-[60%] h-full min-h-0 flex-col overflow-hidden ${
              mobileSplitView === 'canvas' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <EditableInvoiceReceipt />
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
          <InvoiceManager
            user={{
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role,
            }}
            mode="superadmin"
          />
        </div>
      )}
    </div>
  );
}
