'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, ShoppingBag, TrendingUp, TrendingDown, Package, RefreshCw, 
  Clock, CheckCircle, Truck, BarChart3, PieChart, AlertCircle, Loader2,
  Wrench, Settings, Zap, ChevronDown, ChevronUp, Wallet, Calendar,
  TrendingUp as ProfitIcon
} from 'lucide-react';

const formatCurrency = (amount: number): string => {
  if (!amount || amount === 0) return 'â‚¦0';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatNumber = (num: number): string => {
  if (!num) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

const formatPercent = (value: number): string => {
  if (!value) return '0%';
  return value.toFixed(1) + '%';
};

// Simple Bar Chart Component
const RevenueBarChart = ({ data }: { data: any }) => {
  if (!data || !data.metrics) return null;
  
  const { pipeline, revenue } = data;
  const pipelineValue = pipeline?.value || 0;
  const revenueValue = revenue?.value || 0;
  const maxValue = Math.max(pipelineValue, revenueValue, 1);
  
  const bars = [
    { label: 'Pipeline', value: pipelineValue, color: 'bg-yellow-500', orders: pipeline?.orders || 0 },
    { label: 'Revenue', value: revenueValue, color: 'bg-green-500', orders: revenue?.orders || 0 }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#1a2a8a] dark:text-green-400" />
          Revenue Overview
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">Pipeline vs Revenue</span>
      </div>
      
      <div className="space-y-4">
        {bars.map((bar) => {
          const percentage = maxValue > 0 ? (bar.value / maxValue) * 100 : 0;
          return (
            <div key={bar.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">{bar.label}</span>
                <div className="text-right">
                  <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(bar.value)}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({bar.orders} orders)</span>
                </div>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${bar.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        
        {/* Total bar */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-gray-900 dark:text-white">Total</span>
            <div className="text-right">
              <span className="text-gray-900 dark:text-white">{formatCurrency(pipelineValue + revenueValue)}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({(pipeline?.orders || 0) + (revenue?.orders || 0)} orders)</span>
            </div>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-gradient-to-r from-[#1a2a8a] to-[#40b553] rounded-full transition-all duration-1000 ease-out"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Profit/Loss Donut Chart
const ProfitDonutChart = ({ profit, revenue, cost }: { profit: number; revenue: number; cost: number }) => {
  if (revenue === 0) return null;
  
  const profitPercent = (profit / revenue) * 100;
  const costPercent = (cost / revenue) * 100;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
        <PieChart className="w-5 h-5 text-[#1a2a8a] dark:text-green-400" />
        Profit Breakdown
      </h3>
      
      <div className="flex items-center gap-6">
        {/* Donut visualization */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
            {/* Background circle */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" className="dark:stroke-gray-700" />
            {/* Profit arc */}
            {profitPercent > 0 && (
              <circle 
                cx="50" cy="50" r="40" 
                fill="none" 
                stroke={profit >= 0 ? '#22c55e' : '#ef4444'} 
                strokeWidth="20"
                strokeDasharray={`${profitPercent * 2.513} 251.3`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            )}
            {/* Cost arc */}
            {costPercent > 0 && (
              <circle 
                cx="50" cy="50" r="40" 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth="20"
                strokeDasharray={`${costPercent * 2.513} 251.3`}
                strokeLinecap="round"
                strokeDashoffset={`-${profitPercent * 2.513}`}
                className="transition-all duration-1000"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatPercent(profitPercent)}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Margin</p>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Profit</span>
            <span className="ml-auto text-sm font-semibold text-green-600 dark:text-green-400">{formatCurrency(profit)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Cost</span>
            <span className="ml-auto text-sm font-semibold text-red-600 dark:text-red-400">{formatCurrency(cost)}</span>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Revenue</span>
            <span className="ml-auto text-sm font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(revenue)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RevenueAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState('30d');
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    pipeline: true,
    revenue: true,
    profitLoss: true
  });

  const fetchData = async (rangeValue: string = range) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/analytics/revenue-sales?range=${rangeValue}`);
      if (!response.ok) {
        throw new Error('Failed to fetch revenue data');
      }
      const result = await response.json();
      if (result.success) {
        setData(result);
      } else {
        throw new Error(result.error || 'Failed to load data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load revenue data');
      console.error('Revenue fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRangeChange = (newRange: string) => {
    setRange(newRange);
    setRefreshing(true);
    fetchData(newRange);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(range);
  };

  const toggleSection = (section: 'pipeline' | 'revenue' | 'profitLoss') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <Loader2 className="w-12 h-12 animate-spin text-[#1a2a8a] dark:text-green-400" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">Loading revenue intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-gray-700 dark:text-gray-300 text-center">{error}</p>
        <button 
          onClick={handleRefresh}
          className="mt-4 px-6 py-2 bg-[#1a2a8a] text-white rounded-lg hover:bg-[#0f1a66]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || !data.metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <Package className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No revenue data available</p>
      </div>
    );
  }

  const { metrics, pipeline, revenue, pipelineCategories, revenueCategories, statusBreakdown, topProducts, pipelineProducts } = data;

  const pipelineTotal = pipeline?.value || 0;
  const pipelineOrders = pipeline?.orders || 0;
  const pipelineProfit = pipeline?.profit || 0;
  const pipelineMargin = pipeline?.margin || 0;
  const pipelineCost = pipeline?.cost || 0;

  const revenueTotal = revenue?.value || metrics?.totalRevenue || 0;
  const revenueOrders = revenue?.orders || metrics?.totalOrders || 0;
  const revenueProfit = revenue?.profit || 0;
  const revenueMargin = revenue?.margin || 0;
  const revenueCost = revenue?.cost || 0;

  const totalRevenue = metrics?.totalRevenue || 0;
  const totalOrders = metrics?.totalOrders || 0;
  const totalProfit = metrics?.totalProfit || 0;
  const totalMargin = metrics?.totalMargin || 0;
  const totalCost = metrics?.totalCost || 0;

  const pipelineCatData = {
    products: pipelineCategories?.products || { revenue: 0, cost: 0, profit: 0, orders: 0, margin: 0 },
    accessories: pipelineCategories?.accessories || { revenue: 0, cost: 0, profit: 0, orders: 0, margin: 0 },
    services: pipelineCategories?.services || { revenue: 0, cost: 0, profit: 0, orders: 0, margin: 0 }
  };

  const revenueCatData = {
    products: revenueCategories?.products || { revenue: 0, cost: 0, profit: 0, orders: 0, margin: 0 },
    accessories: revenueCategories?.accessories || { revenue: 0, cost: 0, profit: 0, orders: 0, margin: 0 },
    services: revenueCategories?.services || { revenue: 0, cost: 0, profit: 0, orders: 0, margin: 0 }
  };

  const renderCategoryCard = (title: string, icon: React.ReactNode, data: any, color: string) => {
    const isProfitPositive = data.profit >= 0;
    return (
      <div className={`bg-${color}-50 dark:bg-${color}-900/20 rounded-xl p-4 border border-${color}-200 dark:border-${color}-800`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-8 h-8 bg-${color}-500/20 rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(data.revenue)}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{formatNumber(data.orders)} orders</p>
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Cost</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{formatCurrency(data.cost)}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Profit</span>
            <span className={`text-xs font-semibold ${isProfitPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(data.profit)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Margin</span>
            <span className={`text-xs font-bold ${isProfitPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatPercent(data.margin)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#1a2a8a] to-[#40b553] bg-clip-text text-transparent">
            Revenue & Profit Intelligence
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time revenue, profit & pipeline management by category
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 overflow-x-auto">
            {['today', '7d', '30d', '90d', 'year'].map((r) => (
              <button
                key={r}
                onClick={() => handleRangeChange(r)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  range === r
                    ? 'bg-white dark:bg-gray-600 text-[#1a2a8a] dark:text-green-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {r === 'today' ? 'Today' : r.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueBarChart data={data} />
        <ProfitDonutChart profit={totalProfit} revenue={totalRevenue} cost={totalCost} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-5 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Pipeline</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Pending orders</p>
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(pipelineTotal)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatNumber(pipelineOrders)} orders</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Revenue</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Paid orders</p>
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(revenueTotal)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatNumber(revenueOrders)} orders</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-5 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center">
              <Package className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Cost</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">COGS</p>
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalCost)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Cost of goods sold</p>
        </div>

        <div className={`bg-gradient-to-br ${totalProfit >= 0 ? 'from-green-50 to-emerald-50' : 'from-red-50 to-orange-50'} dark:${totalProfit >= 0 ? 'from-green-900/20 to-emerald-900/20' : 'from-red-900/20 to-orange-900/20'} rounded-2xl p-5 border ${totalProfit >= 0 ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-8 h-8 ${totalProfit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'} rounded-xl flex items-center justify-center`}>
              <ProfitIcon className={`w-4 h-4 ${totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Profit</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Revenue - Cost</p>
            </div>
          </div>
          <p className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(totalProfit)}
          </p>
          <p className={`text-xs font-medium ${totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatPercent(totalMargin)} margin
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Total</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Pipeline + Revenue</p>
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatNumber(totalOrders)} orders</p>
        </div>
      </div>

      {/* P&L Statement */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-purple-200 dark:border-purple-800 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 sm:p-6 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => toggleSection('profitLoss')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profit & Loss Statement</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Revenue, cost, and profit breakdown</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-500 dark:text-gray-400">Net Profit</p>
                <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(totalProfit)}
                </p>
              </div>
              {expandedSections.profitLoss ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {expandedSections.profitLoss && (
          <div className="p-4 sm:p-6 border-t border-purple-200 dark:border-purple-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Category</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Revenue</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Cost</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Profit</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-green-50/50 dark:bg-green-900/10">
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Revenue (Paid)</td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-green-600">{formatCurrency(revenueTotal)}</td>
                    <td className="py-3 px-4 text-right text-sm text-red-600">{formatCurrency(revenueCost)}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-green-600">{formatCurrency(revenueProfit)}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-green-600">{formatPercent(revenueMargin)}</td>
                  </tr>
                  {['products', 'accessories', 'services'].map((cat) => {
                    const d = revenueCatData[cat as keyof typeof revenueCatData];
                    const labels = { products: 'Solar Products', accessories: 'Accessories', services: 'Services' };
                    return (
                      <tr key={cat} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-2 px-4 pl-8 text-sm text-gray-600 dark:text-gray-400">{labels[cat as keyof typeof labels]}</td>
                        <td className="py-2 px-4 text-right text-sm">{formatCurrency(d.revenue)}</td>
                        <td className="py-2 px-4 text-right text-sm">{formatCurrency(d.cost)}</td>
                        <td className={`py-2 px-4 text-right text-sm font-medium ${d.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(d.profit)}</td>
                        <td className={`py-2 px-4 text-right text-sm font-medium ${d.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatPercent(d.margin)}</td>
                      </tr>
                    );
                  })}
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-yellow-50/50 dark:bg-yellow-900/10">
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Pipeline (Unpaid)</td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-yellow-600">{formatCurrency(pipelineTotal)}</td>
                    <td className="py-3 px-4 text-right text-sm text-red-600">{formatCurrency(pipelineCost)}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-yellow-600">{formatCurrency(pipelineProfit)}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-yellow-600">{formatPercent(pipelineMargin)}</td>
                  </tr>
                  {['products', 'accessories', 'services'].map((cat) => {
                    const d = pipelineCatData[cat as keyof typeof pipelineCatData];
                    const labels = { products: 'Solar Products', accessories: 'Accessories', services: 'Services' };
                    return (
                      <tr key={cat} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-2 px-4 pl-8 text-sm text-gray-600 dark:text-gray-400">{labels[cat as keyof typeof labels]}</td>
                        <td className="py-2 px-4 text-right text-sm">{formatCurrency(d.revenue)}</td>
                        <td className="py-2 px-4 text-right text-sm">{formatCurrency(d.cost)}</td>
                        <td className={`py-2 px-4 text-right text-sm font-medium ${d.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(d.profit)}</td>
                        <td className={`py-2 px-4 text-right text-sm font-medium ${d.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatPercent(d.margin)}</td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                    <td className="py-3 px-4 text-sm font-bold text-gray-900 dark:text-white">GRAND TOTAL</td>
                    <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(totalRevenue)}</td>
                    <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(totalCost)}</td>
                    <td className={`py-3 px-4 text-right text-sm font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(totalProfit)}</td>
                    <td className={`py-3 px-4 text-right text-sm font-bold ${totalMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatPercent(totalMargin)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Pipeline Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-yellow-200 dark:border-yellow-800 overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 sm:p-6 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => toggleSection('pipeline')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pipeline (Unpaid)</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending orders awaiting payment</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Pipeline</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(pipelineTotal)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatNumber(pipelineOrders)} orders</p>
              </div>
              {expandedSections.pipeline ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {expandedSections.pipeline && (
          <div className="p-4 sm:p-6 border-t border-yellow-200 dark:border-yellow-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderCategoryCard('Solar Products', <Zap className="w-4 h-4 text-blue-600" />, pipelineCatData.products, 'blue')}
              {renderCategoryCard('Accessories', <Wrench className="w-4 h-4 text-purple-600" />, pipelineCatData.accessories, 'purple')}
              {renderCategoryCard('Services', <Settings className="w-4 h-4 text-green-600" />, pipelineCatData.services, 'green')}
            </div>
            <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">Pipeline Total</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(pipelineTotal)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatNumber(pipelineOrders)} orders</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-green-200 dark:border-green-800 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 sm:p-6 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => toggleSection('revenue')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Revenue (Paid)</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Confirmed & delivered orders</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(revenueTotal)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatNumber(revenueOrders)} orders</p>
              </div>
              {expandedSections.revenue ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {expandedSections.revenue && (
          <div className="p-4 sm:p-6 border-t border-green-200 dark:border-green-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderCategoryCard('Solar Products', <Zap className="w-4 h-4 text-blue-600" />, revenueCatData.products, 'blue')}
              {renderCategoryCard('Accessories', <Wrench className="w-4 h-4 text-purple-600" />, revenueCatData.accessories, 'purple')}
              {renderCategoryCard('Services', <Settings className="w-4 h-4 text-green-600" />, revenueCatData.services, 'green')}
            </div>
            <div className="mt-4 bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">Revenue Total</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(revenueTotal)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatNumber(revenueOrders)} orders</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#1a2a8a] dark:text-green-400" />
            Order Status Breakdown
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statusBreakdown?.map((item: any) => {
            const colors: Record<string, { color: string, icon: React.ReactNode }> = {
              pending: { color: 'yellow', icon: <Clock className="w-4 h-4" /> },
              confirmed: { color: 'blue', icon: <CheckCircle className="w-4 h-4" /> },
              processing: { color: 'purple', icon: <RefreshCw className="w-4 h-4" /> },
              shipped: { color: 'indigo', icon: <Truck className="w-4 h-4" /> },
              delivered: { color: 'green', icon: <CheckCircle className="w-4 h-4" /> },
              cancelled: { color: 'red', icon: <AlertCircle className="w-4 h-4" /> }
            };
            const c = colors[item.status] || { color: 'gray', icon: <Package className="w-4 h-4" /> };
            return (
              <div key={item.status} className={`bg-${c.color}-50 dark:bg-${c.color}-900/20 rounded-xl p-4 border border-${c.color}-200 dark:border-${c.color}-800`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`text-${c.color}-600 dark:text-${c.color}-400`}>{c.icon}</div>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{item.orders}</span>
                </div>
                <div className="mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Revenue</span>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(item.revenue)}</p>
                </div>
                {item.cost > 0 && (
                  <div className="mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Cost</span>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{formatCurrency(item.cost)}</p>
                  </div>
                )}
                {item.profit !== undefined && (
                  <div className="mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Profit</span>
                    <p className={`text-sm font-semibold ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(item.profit)}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              Top Products (Revenue)
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">From paid orders</span>
          </div>
          <div className="space-y-3">
            {topProducts?.slice(0, 5).map((product: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{product.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{product.quantity} sold</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatCurrency(product.revenue)}</p>
                  <p className={`text-xs ${product.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(product.profit)} profit</p>
                </div>
              </div>
            ))}
            {(!topProducts || topProducts.length === 0) && <p className="text-center text-gray-500 dark:text-gray-400 py-4">No paid orders yet</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              Pipeline Products (Pending)
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">From unpaid orders</span>
          </div>
          <div className="space-y-3">
            {pipelineProducts?.slice(0, 5).map((product: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{product.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{product.quantity} pending</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatCurrency(product.revenue)}</p>
                  <p className={`text-xs ${product.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(product.profit)} est. profit</p>
                </div>
              </div>
            ))}
            {(!pipelineProducts || pipelineProducts.length === 0) && <p className="text-center text-gray-500 dark:text-gray-400 py-4">No pending orders</p>}
          </div>
        </div>
      </div>
    </div>
  );
}