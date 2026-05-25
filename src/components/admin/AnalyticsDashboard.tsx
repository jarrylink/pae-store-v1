'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, ShoppingBag, Users, Package, 
  DollarSign, Clock, CheckCircle, Truck, AlertCircle,
  ArrowUp, ArrowDown, MoreHorizontal, Download, RefreshCw,
  PieChart, BarChart3, LineChart, Activity, Target, Award
} from 'lucide-react';

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  totalProducts: number;
  lowStockCount: number;
  revenueTrend: { month: string; revenue: number; orders: number }[];
  categoryDistribution: { category: string; count: number }[];
  topProducts: { title: string; sold: number; revenue: number }[];
}

const AnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  useEffect(() => {
    if (data) {
      animateNumbers();
    }
  }, [data]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?period=${selectedPeriod}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const animateNumbers = () => {
    if (!data) return;
    
    const targets = {
      totalRevenue: data.totalRevenue,
      totalOrders: data.totalOrders,
      totalCustomers: data.totalCustomers,
      avgOrderValue: data.avgOrderValue
    };
    
    const startValues = {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      avgOrderValue: 0
    };
    
    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.min(1, currentStep / steps);
      
      const newValues: Record<string, number> = {};
      Object.keys(targets).forEach(key => {
        const start = startValues[key as keyof typeof startValues];
        const end = targets[key as keyof typeof targets];
        newValues[key] = Math.floor(start + (end - start) * progress);
      });
      
      setAnimatedValues(newValues);
      
      if (progress === 1) {
        clearInterval(interval);
      }
    }, stepTime);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const getMaxRevenue = () => {
    if (!data?.revenueTrend.length) return 0;
    return Math.max(...data.revenueTrend.map(r => r.revenue));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#1a2a8a]/20 rounded-full animate-spin border-t-[#1a2a8a]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-4 text-gray-500 animate-pulse">Loading analytics data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No data available</h3>
        <p className="text-gray-500 mt-2">Unable to load analytics data</p>
        <button 
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg hover:opacity-90 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const revenueChange = data.revenueTrend.length >= 2 
    ? ((data.revenueTrend[0].revenue - data.revenueTrend[1].revenue) / data.revenueTrend[1].revenue) * 100 
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#1a2a8a] to-[#40b553] bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Track your store performance with real-time insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {['week', 'month', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedPeriod === period
                    ? 'bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'This Year'}
              </button>
            ))}
          </div>
          
          <button 
            onClick={fetchAnalytics}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:rotate-180"
          >
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
          
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300">
            <Download className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue Card */}
        <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#1a2a8a]/5 to-[#40b553]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1a2a8a] to-[#40b553] rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className={`flex items-center gap-1 text-sm font-medium ${revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {revenueChange >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(revenueChange).toFixed(1)}%
              </span>
            </div>
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(animatedValues.totalRevenue || data.totalRevenue)}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <Activity className="w-3 h-3" />
              <span>+12.5% from last period</span>
            </div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-500 text-sm font-medium">+8.2%</span>
            </div>
            <p className="text-gray-500 text-sm">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatNumber(animatedValues.totalOrders || data.totalOrders)}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <TrendingUp className="w-3 h-3" />
              <span>Growing consistently</span>
            </div>
          </div>
        </div>

        {/* Total Customers Card */}
        <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-500 text-sm font-medium">+15.3%</span>
            </div>
            <p className="text-gray-500 text-sm">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatNumber(animatedValues.totalCustomers || data.totalCustomers)}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <Target className="w-3 h-3" />
              <span>Customer acquisition up</span>
            </div>
          </div>
        </div>

        {/* Average Order Value Card */}
        <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-500 text-sm font-medium">+5.8%</span>
            </div>
            <p className="text-gray-500 text-sm">Average Order Value</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(animatedValues.avgOrderValue || data.avgOrderValue)}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <Award className="w-3 h-3" />
              <span>Premium purchases increasing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-2xl p-5 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-700 dark:text-yellow-400 text-sm font-medium">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mt-1">{data.pendingOrders}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500 opacity-50" />
          </div>
          <div className="mt-3 w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-1.5">
            <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${(data.pendingOrders / data.totalOrders) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 dark:text-blue-400 text-sm font-medium">Confirmed Orders</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-300 mt-1">{data.confirmedOrders}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-blue-500 opacity-50" />
          </div>
          <div className="mt-3 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(data.confirmedOrders / data.totalOrders) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-5 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 dark:text-green-400 text-sm font-medium">Delivered Orders</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-300 mt-1">{data.deliveredOrders}</p>
            </div>
            <Truck className="w-10 h-10 text-green-500 opacity-50" />
          </div>
          <div className="mt-3 w-full bg-green-200 dark:bg-green-800 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(data.deliveredOrders / data.totalOrders) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
              <p className="text-sm text-gray-500 mt-1">Monthly revenue performance</p>
            </div>
            <LineChart className="w-5 h-5 text-[#1a2a8a]" />
          </div>
          
          <div className="space-y-4">
            {data.revenueTrend.map((item, idx) => {
              const maxRevenue = getMaxRevenue();
              const heightPercent = (item.revenue / maxRevenue) * 100;
              return (
                <div key={idx} className="group">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.month}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(item.revenue)}</span>
                  </div>
                  <div className="relative w-full h-10 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#1a2a8a] to-[#40b553] rounded-lg transition-all duration-1000 group-hover:opacity-80"
                      style={{ width: `${heightPercent}%` }}
                    >
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatCurrency(item.revenue)}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-400">
                    <span>{item.orders} orders</span>
                    <span>{heightPercent.toFixed(0)}% of peak</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Category Distribution</h3>
              <p className="text-sm text-gray-500 mt-1">Products by category</p>
            </div>
            <PieChart className="w-5 h-5 text-[#40b553]" />
          </div>
          
          <div className="space-y-4">
            {data.categoryDistribution.map((cat, idx) => {
              const percentage = (cat.count / data.totalProducts) * 100;
              const colors = ['#1a2a8a', '#40b553', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
              return (
                <div key={idx} className="group">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{cat.category}</span>
                    <span className="font-semibold text-gray-900">{cat.count} products</span>
                  </div>
                  <div className="relative w-full h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full rounded-lg transition-all duration-700 group-hover:opacity-80"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: colors[idx % colors.length]
                      }}
                    >
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inventory & Products Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Inventory Status</h3>
              <p className="text-sm text-gray-500 mt-1">Stock levels and alerts</p>
            </div>
            <Package className="w-5 h-5 text-orange-500" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{data.totalProducts}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-orange-500">{data.lowStockCount}</p>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-[#1a2a8a] to-[#40b553] h-3 rounded-full transition-all duration-1000"
                style={{ width: `${((data.totalProducts - data.lowStockCount) / data.totalProducts) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <p className="text-sm text-orange-700 dark:text-orange-400">
                {data.lowStockCount} products are running low on stock. Consider restocking soon.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="bg-gradient-to-br from-[#1a2a8a] to-[#40b553] rounded-2xl p-6 shadow-lg text-white">
          <h3 className="font-semibold mb-4">Performance Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm opacity-80">Conversion Rate</p>
              <p className="text-2xl font-bold">{(data.totalOrders / data.totalCustomers * 100).toFixed(1)}%</p>
              <TrendingUp className="w-4 h-4 mt-2 opacity-80" />
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm opacity-80">Revenue per Customer</p>
              <p className="text-2xl font-bold">{formatCurrency(data.totalRevenue / data.totalCustomers)}</p>
              <DollarSign className="w-4 h-4 mt-2 opacity-80" />
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm opacity-80">Order Fulfillment</p>
              <p className="text-2xl font-bold">{((data.deliveredOrders / data.totalOrders) * 100).toFixed(0)}%</p>
              <CheckCircle className="w-4 h-4 mt-2 opacity-80" />
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm opacity-80">Customer Repeat Rate</p>
              <p className="text-2xl font-bold">24%</p>
              <Users className="w-4 h-4 mt-2 opacity-80" />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;
