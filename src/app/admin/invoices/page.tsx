'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { useInvoiceDraftStore } from '@/lib/stores/invoiceDraftStore';
import InvoiceChatAssistant from '@/components/admin/invoices/InvoiceChatAssistant';
import EditableInvoiceReceipt from '@/components/admin/invoices/EditableInvoiceReceipt';
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

export default function AdminInvoicesPage() {
  const { user } = useAuthStore();
  const { invoiceNumber } = useInvoiceDraftStore();
  const [activeTab, setActiveTab] = useState<'ai-sales-agent' | 'manual-invoice'>('ai-sales-agent');

  if (!user) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Authenticating admin session...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Header & Breadcrumb Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-gray-800 dark:text-gray-200 font-medium">Invoices</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
              {activeTab === 'ai-sales-agent' ? invoiceNumber : 'Registry & Manual Manager'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              {activeTab === 'ai-sales-agent' ? (
                <>
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  AI Sales Agent
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Manual Invoice & Records
                </>
              )}
            </h1>
            <span
              className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                activeTab === 'ai-sales-agent'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
              }`}
            >
              {activeTab === 'ai-sales-agent' ? 'Bidirectional Split Canvas' : 'Direct Entry & Audit'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {activeTab === 'ai-sales-agent'
              ? 'Conversational sales quoting powered by Google Gemini 3.5 with verified catalog matching and live editable commercial invoice canvas.'
              : 'Manual invoice authoring, line-item customization, status tracking, agent filtering, and printable invoice exports.'}
          </p>
        </div>

        {/* View Switcher Tabs: AI Sales Agent & Manual Invoice */}
        <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700 self-start md:self-auto shadow-inner">
          <button
            onClick={() => setActiveTab('ai-sales-agent')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold transition-all ${
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
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold transition-all ${
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

      {/* Main Content Area */}
      {activeTab === 'ai-sales-agent' ? (
        <div className="flex flex-col lg:flex-row gap-5 items-stretch min-h-[750px] lg:h-[calc(100vh-210px)]">
          {/* Left Panel: 40% Width Conversational AI Sales Agent */}
          <div className="w-full lg:w-[40%] flex flex-col h-[650px] lg:h-full">
            <InvoiceChatAssistant />
          </div>

          {/* Right Panel: 60% Width Live Editable Commercial Invoice Canvas */}
          <div className="w-full lg:w-[60%] flex flex-col h-[750px] lg:h-full">
            <EditableInvoiceReceipt />
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
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
