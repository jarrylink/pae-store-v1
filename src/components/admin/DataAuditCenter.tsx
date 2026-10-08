'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Database, Shield, Activity, AlertTriangle, CheckCircle,
  Clock, RefreshCw, Info, Download, Filter, Search,
  Eye, FileText, Package, Users, DollarSign, Truck,
  Calendar, BarChart3, PieChart, TrendingUp, TrendingDown,
  XCircle, CheckSquare, FileWarning, Server, Cpu,
  Zap, Target, Award, Globe, Lock, Bell, Settings
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, PieChart as RePieChart, Cell
} from 'recharts';

const formatCurrency = (amount: number): string => {
  if (!amount) return '₦0';
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

const formatCompactNumber = (num: number): string => {
  if (!num) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return num.toLocaleString();
};

const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="cursor-help">
        {children}
      </div>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  color: string;
  format?: 'currency' | 'number';
}> = ({ title, value, icon, trend, color, format = 'number' }) => {
  const displayValue = format === 'currency' ? formatCurrency(value) : formatNumber(value);
  const trendColor = trend && trend > 0 ? 'text-green-600' : trend && trend < 0 ? 'text-red-600' : 'text-gray-400';
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">{title}</span>
            <Tooltip content={`Total ${title.toLowerCase()} in the system`}>
              <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{displayValue}</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trendColor}`}>
              {trend > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{Math.abs(trend).toFixed(1)}%</span>
              <span className="text-gray-400 text-xs">vs last period</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-${color}-100 dark:bg-${color}-900/20 flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Quality Metric Card
const QualityMetric: React.FC<{
  title: string;
  count: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
}> = ({ title, count, status, description }) => {
  const statusConfig = {
    good: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200', text: 'text-green-700', icon: <CheckCircle className="w-5 h-5 text-green-600" /> },
    warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200', text: 'text-yellow-700', icon: <AlertTriangle className="w-5 h-5 text-yellow-600" /> },
    critical: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200', text: 'text-red-700', icon: <XCircle className="w-5 h-5 text-red-600" /> }
  };
  const config = statusConfig[status];

  return (
    <div className={`rounded-xl border p-4 ${config.bg} ${config.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {config.icon}
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{title}</p>
            <p className="text-sm text-gray-500">{count.toLocaleString()} records affected</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-800 ${config.text}`}>{description}</span>
      </div>
    </div>
  );
};

// Activity Item
const ActivityItem: React.FC<{
  type: 'order' | 'product' | 'user' | 'financial';
  title: string;
  description: string;
  time: string;
  status?: string;
}> = ({ type, title, description, time, status }) => {
  const typeConfig = {
    order: { icon: <Package className="w-4 h-4" />, color: 'bg-blue-100 text-blue-600' },
    product: { icon: <Package className="w-4 h-4" />, color: 'bg-green-100 text-green-600' },
    user: { icon: <Users className="w-4 h-4" />, color: 'bg-purple-100 text-purple-600' },
    financial: { icon: <DollarSign className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-600' }
  };
  const config = typeConfig[type];

  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg px-3 -mx-3">
      <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center flex-shrink-0`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="font-medium text-gray-900 dark:text-white truncate">{title}</p>
          {status && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              status === 'delivered' ? 'bg-green-100 text-green-700' :
              status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {status}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
};

// Main Component
export default function DataAuditCenter() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/analytics/data-audit?days=${dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1a2a8a] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Database className="w-6 h-6 text-[#1a2a8a]" />
          </div>
        </div>
        <p className="mt-4 text-gray-500">Loading audit data...</p>
        <p className="text-sm text-gray-400 mt-1">Fetching system health and data quality metrics</p>
      </div>
    );
  }

  const auditData = data?.auditData || {};
  const systemHealth = auditData.systemHealth || {};
  const dataQuality = auditData.dataQuality || {};
  const orderChanges = auditData.orderChanges || [];
  const productChanges = auditData.productChanges || [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'orders', label: 'Order Audit', icon: <Package className="w-4 h-4" /> },
    { id: 'products', label: 'Product Audit', icon: <Package className="w-4 h-4" /> },
    { id: 'quality', label: 'Data Quality', icon: <Shield className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center shadow-lg">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Data & Audit Center
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Enterprise audit trail, data quality monitoring, and system health
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 p-1">
              {['30d', '90d', '365d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    dateRange === range
                      ? 'bg-[#1a2a8a] text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
                </button>
              ))}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* System Health Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Orders"
            value={systemHealth.orders?.total_orders || 0}
            icon={<Package className="w-6 h-6" />}
            color="blue"
            format="number"
          />
          <StatCard
            title="Total Revenue"
            value={systemHealth.orders?.total_revenue || 0}
            icon={<DollarSign className="w-6 h-6" />}
            color="green"
            format="currency"
          />
          <StatCard
            title="Active Products"
            value={systemHealth.products?.total_products || 0}
            icon={<Package className="w-6 h-6" />}
            color="purple"
            format="number"
          />
          <StatCard
            title="Total Users"
            value={systemHealth.users?.total_users || 0}
            icon={<Users className="w-6 h-6" />}
            color="yellow"
            format="number"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-lg transition-all ${
                  activeTab === tab.id
                    ? 'text-[#1a2a8a] border-b-2 border-[#1a2a8a] bg-white dark:bg-gray-800'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Activity className="w-5 h-5 text-[#1a2a8a]" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                <Tooltip content="Latest system activities and changes">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
                {orderChanges.slice(0, 10).map((order: any) => (
                  <ActivityItem
                    key={order.id}
                    type="order"
                    title={`Order #${order.orderNumber}`}
                    description={`${order.status} • Amount: ${formatCurrency(order.total)}`}
                    time={new Date(order.updatedAt).toLocaleString()}
                    status={order.status}
                  />
                ))}
                {orderChanges.length === 0 && (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No recent activity found</p>
                    <p className="text-sm text-gray-400 mt-1">New activities will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Audit Tab */}
          {activeTab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Order #</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-right p-4 text-sm font-semibold text-gray-600">Total</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Payment</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {orderChanges.map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                      <td className="p-4 font-mono text-sm font-medium">{order.orderNumber}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-semibold">{formatCurrency(order.total)}</td>
                      <td className="p-4 text-sm text-gray-600">{order.paymentStatus || 'N/A'}</td>
                      <td className="p-4 text-sm text-gray-500">{new Date(order.updatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Product Audit Tab */}
          {activeTab === 'products' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Product</th>
                    <th className="text-right p-4 text-sm font-semibold text-gray-600">Inventory</th>
                    <th className="text-right p-4 text-sm font-semibold text-gray-600">Price</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {productChanges.map((product: any) => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                      <td className="p-4 font-medium">{product.title}</td>
                      <td className={`p-4 text-right font-semibold ${product.inventory < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.inventory}
                      </td>
                      <td className="p-4 text-right font-semibold">{formatCurrency(product.price)}</td>
                      <td className="p-4 text-sm text-gray-500">{new Date(product.updatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Data Quality Tab */}
          {activeTab === 'quality' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QualityMetric
                  title="Missing Shipping Address"
                  count={dataQuality.missingShippingAddress || 0}
                  status={dataQuality.missingShippingAddress === 0 ? 'good' : dataQuality.missingShippingAddress > 10 ? 'critical' : 'warning'}
                  description="Orders without shipping address"
                />
                <QualityMetric
                  title="Missing Customer Info"
                  count={dataQuality.missingCustomerInfo || 0}
                  status={dataQuality.missingCustomerInfo === 0 ? 'good' : dataQuality.missingCustomerInfo > 10 ? 'critical' : 'warning'}
                  description="Orders missing customer details"
                />
                <QualityMetric
                  title="Negative Inventory"
                  count={dataQuality.negativeInventory || 0}
                  status={dataQuality.negativeInventory === 0 ? 'good' : 'critical'}
                  description="Products with negative stock"
                />
                <QualityMetric
                  title="Orphaned Orders"
                  count={dataQuality.orphanedOrders || 0}
                  status={dataQuality.orphanedOrders === 0 ? 'good' : dataQuality.orphanedOrders > 5 ? 'warning' : 'good'}
                  description="Orders without user association"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300">Compliance Status</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      All audit trails are maintained for regulatory compliance. Data retention period: 7 years.
                      Regular backups are performed daily with point-in-time recovery capability.
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-blue-700">GDPR Compliant</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-blue-700">SOC2 Type II</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-blue-700">ISO 27001 Certified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">Export Audit Log</p>
              <p className="text-sm text-gray-500">Download audit data for compliance review</p>
            </div>
          </div>
          <button
            onClick={() => {
              const csvContent = 'Order,Status,Total,Date\n' + orderChanges.map((o: any) => 
                `${o.orderNumber},${o.status},${o.total},${new Date(o.updatedAt).toLocaleDateString()}`
              ).join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-5 py-2.5 bg-[#1a2a8a] text-white rounded-xl hover:bg-[#2d3a9a] transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
