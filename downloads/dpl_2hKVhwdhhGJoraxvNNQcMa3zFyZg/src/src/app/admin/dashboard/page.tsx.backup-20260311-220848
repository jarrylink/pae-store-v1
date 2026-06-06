'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Users, Package, ShoppingCart,
  TrendingUp, DollarSign, Globe, Shield,
  Bell, Settings, Download, Filter,
  ArrowUpRight, ArrowDownRight, CheckCircle,
  AlertCircle, Clock, Battery, PieChart
} from 'lucide-react';
import { 
  SimpleChart, 
  generateMonthlyData, 
  generateWeeklyData,
  generateProductPerformance 
} from '@/components/charts/SimpleChart';
import { Order } from '@/types/auth';

// Mock data for demonstration
const RECENT_ORDERS = [
  { id: 'ORD-001', customer: 'John Doe', amount: '?250,000', status: 'completed', date: '2025-01-18' },
  { id: 'ORD-002', customer: 'Jane Smith', amount: '?180,500', status: 'processing', date: '2025-01-17' },
  { id: 'ORD-003', customer: 'Robert Johnson', amount: '?320,000', status: 'pending', date: '2025-01-17' },
  { id: 'ORD-004', customer: 'Sarah Williams', amount: '?95,000', status: 'completed', date: '2025-01-16' },
  { id: 'ORD-005', customer: 'Michael Brown', amount: '?450,000', status: 'shipped', date: '2025-01-16' },
];

const TOP_PRODUCTS = [
  { name: 'ISUN 1K Solar Kit', sales: 42, revenue: '?21,840,000', growth: '+12%' },
  { name: '5kVA Solar Inverter', sales: 28, revenue: '?11,760,000', growth: '+8%' },
  { name: 'Mono 330W Panel', sales: 35, revenue: '?3,325,000', growth: '+15%' },
  { name: 'Complete Solar System', sales: 18, revenue: '?13,500,000', growth: '+5%' },
  { name: 'MC4 Connector Set', sales: 56, revenue: '?280,000', growth: '+22%' },
];

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [chartData, setChartData] = useState({
    monthly: generateMonthlyData(),
    weekly: generateWeeklyData(),
    products: generateProductPerformance(),
  });

  const [metrics] = useState({
    revenue: 125430.75,
    orders: 892,
    customers: 456,
    conversion: 3.2,
    growth: 12.5,
    avgOrder: 140.75
  });

  const [realOrders, setRealOrders] = useState<Order[]>([]);
  const [realMetrics, setRealMetrics] = useState({
    revenue: 0,
    ordersCount: 0,
    customers: 0,
    avgOrder: 0
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      saved: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      pending_agent: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    };
    return colors[status] || colors.pending;
  };

  useEffect(() => {
    // Simulate loading and data fetch
    setTimeout(() => setLoading(false), 800);
  }, []);

  // Update chart data when time range changes
  useEffect(() => {
    // In production, this would fetch data from API based on timeRange
    console.log('Fetching data for time range:', timeRange);
    
    // Simulate different data for different time ranges
    const newData = {
      monthly: generateMonthlyData(),
      weekly: generateWeeklyData(),
      products: generateProductPerformance(),
    };
    
    setChartData(newData);
  }, [timeRange]);

  // Fetch real orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        setRealOrders(data);
        
        const totalRevenue = data.reduce((sum: number, order: Order) => sum + order.total, 0);
        const uniqueCustomers = new Set(data.map((order: Order) => order.userId)).size;
        const avgOrder = data.length > 0 ? totalRevenue / data.length : 0;
        
        setRealMetrics({
          revenue: totalRevenue,
          ordersCount: data.length,
          customers: uniqueCustomers,
          avgOrder
        });
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#1a2a8a]"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading dashboard analytics...</p>
      </div>
    );
  }

  const isSuperAdmin = user?.role === 'superadmin';

  // International currency formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Header with Time Range Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
            </h1>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isSuperAdmin ?
                'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
            }`}>
              {isSuperAdmin ? '? Super Admin' : '?? Staff'}
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, <span className="font-semibold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</span>! 
            {isSuperAdmin ? ' You have full system control.' : ' Monitor and manage store operations.'}
          </p>
        </div>

        {/* Time Range Filter - NOW FUNCTIONAL WITH CHARTS */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all duration-300 ${
                  timeRange === range
                    ? 'bg-[#1a2a8a] text-white dark:bg-green-500'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid - Using real data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
          <div className="absolute top-4 right-4 opacity-20">
            <DollarSign className="w-12 h-12" />
          </div>
          <div className="relative">
            <p className="text-sm font-medium opacity-90">Total Revenue</p>
            <p className="text-3xl font-bold mt-2">{formatCurrency(realMetrics.revenue)}</p>
            <div className="flex items-center mt-4">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="text-sm">+{metrics.growth}% this {timeRange}</span>
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
          <div className="absolute top-4 right-4 opacity-20">
            <ShoppingCart className="w-12 h-12" />
          </div>
          <div className="relative">
            <p className="text-sm font-medium opacity-90">Total Orders</p>
            <p className="text-3xl font-bold mt-2">{realMetrics.ordersCount.toLocaleString()}</p>
            <div className="flex items-center mt-4">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">{realMetrics.ordersCount} total</span>
            </div>
          </div>
        </div>

        {/* Customers Card */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
          <div className="absolute top-4 right-4 opacity-20">
            <Users className="w-12 h-12" />
          </div>
          <div className="relative">
            <p className="text-sm font-medium opacity-90">Total Customers</p>
            <p className="text-3xl font-bold mt-2">{realMetrics.customers.toLocaleString()}</p>
            <div className="flex items-center mt-4">
              <ArrowUpRight className="w-4 h-4 mr-2" />
              <span className="text-sm">unique users</span>
            </div>
          </div>
        </div>

        {/* Avg Order Card */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
          <div className="absolute top-4 right-4 opacity-20">
            <BarChart3 className="w-12 h-12" />
          </div>
          <div className="relative">
            <p className="text-sm font-medium opacity-90">Average Order</p>
            <p className="text-3xl font-bold mt-2">{formatCurrency(realMetrics.avgOrder)}</p>
            <div className="flex items-center mt-4">
              <span className="text-sm">per order</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section - Temporarily Disabled */}
      {/*
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SimpleChart
          data={chartData.monthly}
          dataKey="revenue"
          type="area"
          title={`Revenue Trend (Last ${timeRange})`}
          height={280}
        />
        <SimpleChart
          data={chartData.weekly}
          dataKey="value"
          type="line"
          title={`Weekly Orders (${timeRange})`}
          height={280}
        />
        <div className="lg:col-span-2">
          <SimpleChart
            data={chartData.products}
            dataKey="sales"
            type="bar"
            title="Product Performance by Sales Volume"
            height={320}
          />
        </div>
      </div>
      */}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Actions & Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions Grid */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Battery className="w-5 h-5 mr-2" />
                Quick Actions
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">Most used features</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link
                href="/admin/products"
                className="group p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">Manage Products</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Add, edit, or remove products</p>
                </div>
              </Link>

              <Link
                href="/admin/orders"
                className="group p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-xl border border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                    <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">Order Management</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Process and track orders</p>
                </div>
              </Link>

              {isSuperAdmin && (
                <Link
                  href="/admin/users"
                  className="group p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">User Management</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage system users</p>
                  </div>
                </Link>
              )}

              <Link
                href="/admin/analytics"
                className="group p-5 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-900/10 rounded-xl border border-cyan-200 dark:border-cyan-800 hover:border-cyan-400 dark:hover:border-cyan-600 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">Analytics</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View detailed reports</p>
                </div>
              </Link>

              {isSuperAdmin && (
                <Link
                  href="/admin/settings"
                  className="group p-5 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Settings className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">System Settings</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Configure system options</p>
                  </div>
                </Link>
              )}

              <Link
                href="/"
                className="group p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-900/10 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-gray-100 dark:bg-gray-900/30 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">View Store</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Go to customer storefront</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Orders
              </h2>
              <Link
                href="/admin/orders"
                className="text-sm text-[#1a2a8a] dark:text-green-400 hover:underline flex items-center"
              >
                View all orders
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {realOrders.slice(0,5).map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">ORD-{order.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700 dark:text-gray-300">{order.userId}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(order.total)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Top Products */}
        <div className="space-y-8">
          {/* System Status */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              System Status
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">Database</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">API Services</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">100% Uptime</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">Storage</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">78% Used</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">Security</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Protected</span>
              </div>
            </div>

            {isSuperAdmin && (
              <button className="w-full mt-6 px-4 py-2.5 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg hover:from-[#0f1a66] hover:to-[#2e8b47] transition-all duration-300 flex items-center justify-center">
                <Settings className="w-4 h-4 mr-2" />
                Manage System
              </button>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Top Products
            </h2>
            
            <div className="space-y-4">
              {TOP_PRODUCTS.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">{product.revenue}</p>
                    <p className={`text-sm ${product.growth.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {product.growth}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-gradient-to-br from-[#1a2a8a] to-[#40b553] rounded-2xl p-6 text-white">
            <div className="flex items-center mb-4">
              <Bell className="w-5 h-5 mr-2" />
              <h3 className="font-bold">Notifications</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Low Stock Alert</p>
                  <p className="text-xs opacity-90">3 products are running low on inventory</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">System Updated</p>
                  <p className="text-xs opacity-90">Latest security patches applied</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Pending Orders</p>
                  <p className="text-xs opacity-90">5 orders awaiting processing</p>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors">
              View All Notifications
            </button>
          </div>
        </div>
      </div>

      {/* Super Admin Exclusive Features */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Super Admin Controls</h2>
              <p className="text-gray-300 mt-2">Full system access and configuration</p>
            </div>
            <Shield className="w-8 h-8 text-green-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
              <h3 className="font-semibold mb-3">Database Management</h3>
              <p className="text-sm text-gray-300 mb-4">Direct database access and query tools</p>
              <button className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors">
                Open Database Console
              </button>
            </div>
            
            <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
              <h3 className="font-semibold mb-3">System Logs</h3>
              <p className="text-sm text-gray-300 mb-4">Monitor system activity and errors</p>
              <button className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors">
                View Logs
              </button>
            </div>
            
            <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
              <h3 className="font-semibold mb-3">API Configuration</h3>
              <p className="text-sm text-gray-300 mb-4">Manage external service integrations</p>
              <button className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors">
                Configure APIs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
