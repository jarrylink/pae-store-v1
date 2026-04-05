'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package, ShoppingCart, Users, Wrench, DollarSign,
  Clock, AlertCircle, CheckCircle, XCircle,
  AlertTriangle, RefreshCw, ArrowRight
} from 'lucide-react';

interface DashboardData {
  products: {
    total: number;
    totalInventory: number;
    totalValue: number;
    soldOut: number;
    lowStock: number;
    unitsSold: number;
  };
  orders: {
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    totalRevenue: number;
    productRevenue: number;
    serviceRevenue: number;
  };
  services: {
    total: number;
    active: number;
    confirmed: number;
    completed: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  recentOrders: any[];
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [processingOrder, setProcessingOrder] = useState<number | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/stats');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to fetch');
      setData(result);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const confirmOrder = async (orderId: number) => {
    try {
      setProcessingOrder(orderId);
      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          action: 'confirm',
          userId: 'admin',
          userEmail: 'admin@example.com',
          userRole: 'admin'
        })
      });
      
      const result = await response.json();
      if (response.ok) {
        alert(`✅ Order #${orderId} confirmed! Inventory updated.`);
        await fetchDashboardData();
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (err) {
      alert('Failed to confirm order');
    } finally {
      setProcessingOrder(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700',
      confirmed: 'bg-blue-50 text-blue-700',
      processing: 'bg-indigo-50 text-indigo-700',
      shipped: 'bg-purple-50 text-purple-700',
      delivered: 'bg-emerald-50 text-emerald-700',
      cancelled: 'bg-rose-50 text-rose-700',
    };
    return colors[status] || 'bg-gray-50 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-500 text-sm mb-6">{error || 'Failed to load dashboard data'}</p>
          <button onClick={fetchDashboardData} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalUnitsSold = data.products.unitsSold || 0;

  return (
    <div className="space-y-8">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(data.orders.totalRevenue)}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Product Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(data.orders.productRevenue)}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Service Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(data.orders.serviceRevenue)}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Products Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
          <div className="p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{data.products.total}</p>
                <p className="text-xs text-gray-500">Total Products</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Stock Units</span>
                <span className="font-medium text-gray-900">{formatNumber(data.products.totalInventory)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Units Sold</span>
                <span className="font-medium text-emerald-600">{formatNumber(totalUnitsSold)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Inventory Value</span>
                <span className="font-medium text-gray-900">{formatCurrency(data.products.totalValue)}</span>
              </div>
              {data.products.lowStock > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    Low Stock
                  </span>
                  <span className="font-medium text-amber-600">{data.products.lowStock}</span>
                </div>
              )}
            </div>
          </div>
          <Link href="/admin/products" className="block bg-gray-50 px-5 py-3 text-sm text-blue-600 hover:text-blue-700 font-medium border-t border-gray-100 group">
            <span className="flex items-center justify-between">
              Manage Products
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
          <div className="p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{data.orders.total}</p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order Value</span>
                <span className="font-medium text-gray-900">{formatCurrency(data.orders.totalRevenue)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pending</span>
                  <span className="font-medium text-amber-600">{data.orders.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Confirmed</span>
                  <span className="font-medium text-blue-600">{data.orders.confirmed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivered</span>
                  <span className="font-medium text-emerald-600">{data.orders.delivered || 0}</span>
                </div>
              </div>
            </div>
          </div>
          <Link href="/admin/orders" className="block bg-gray-50 px-5 py-3 text-sm text-blue-600 hover:text-blue-700 font-medium border-t border-gray-100 group">
            <span className="flex items-center justify-between">
              Manage Orders
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

        {/* Services Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
          <div className="p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{data.services.total}</p>
                <p className="text-xs text-gray-500">Total Services</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Active</span>
                <span className="font-medium text-gray-900">{data.services.active}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Confirmed</span>
                <span className="font-medium text-blue-600">{data.services.confirmed || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Completed</span>
                <span className="font-medium text-emerald-600">{data.services.completed || 0}</span>
              </div>
            </div>
          </div>
          <Link href="/admin/services" className="block bg-gray-50 px-5 py-3 text-sm text-blue-600 hover:text-blue-700 font-medium border-t border-gray-100 group">
            <span className="flex items-center justify-between">
              Manage Services
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

        {/* Users Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
          <div className="p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{data.users.total}</p>
                <p className="text-xs text-gray-500">Total Users</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Active</span>
                <span className="font-medium text-emerald-600">{data.users.active}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Inactive</span>
                <span className="font-medium text-rose-600">{data.users.inactive || 0}</span>
              </div>
            </div>
          </div>
          <Link href="/admin/users" className="block bg-gray-50 px-5 py-3 text-sm text-blue-600 hover:text-blue-700 font-medium border-t border-gray-100 group">
            <span className="flex items-center justify-between">
              Manage Users
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>

      {/* Payment Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-emerald-600 font-medium uppercase">Paid Orders</p>
              <p className="text-2xl font-semibold text-emerald-900 mt-1">{data.orders.confirmed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-amber-600 font-medium uppercase">Pending Payment</p>
              <p className="text-2xl font-semibold text-amber-900 mt-1">{data.orders.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        <div className="bg-rose-50 rounded-xl p-5 border border-rose-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-rose-600 font-medium uppercase">Failed Payments</p>
              <p className="text-2xl font-semibold text-rose-900 mt-1">0</p>
            </div>
            <XCircle className="w-8 h-8 text-rose-500" />
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.recentOrders?.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-600">#{order.orderNumber || order.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.customerName || 'Guest'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === 'paid' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {order.paymentStatus?.toUpperCase() || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => confirmOrder(order.id)}
                        disabled={processingOrder === order.id}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                      >
                        {processingOrder === order.id ? '...' : 'Confirm'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
