'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, ShoppingBag, Users, DollarSign, 
  Clock, CheckCircle, Truck, AlertCircle, Info, Calendar,
  ArrowUp, ArrowDown, RefreshCw, Package, BarChart3, PieChart,
  Download, Share2, Printer, Eye, Target, Award, Zap,
  Battery, Sun, Activity, CreditCard, MapPin, Building2
} from 'lucide-react';

// Tooltip Component
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="cursor-help">
        {children}
      </div>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap max-w-xs">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

// Sparkline Component
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min;
  
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// KPI Card Component with Sparkline
const KPICard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: number;
  tooltip: string;
  color: string;
  sparklineData?: number[];
  onClick?: () => void;
}> = ({ title, value, icon, change, tooltip, color, sparklineData, onClick }) => {
  const isPositive = (change || 0) >= 0;
  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all cursor-pointer group`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">{title}</span>
            <Tooltip text={tooltip}>
              <Info className="w-3 h-3 text-gray-400" />
            </Tooltip>
          </div>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              <span>{Math.abs(change).toFixed(1)}%</span>
              <span className="text-gray-400">vs last period</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-${color}-500/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-3">
          <Sparkline data={sparklineData} color={color === 'blue' ? '#1a2a8a' : '#40b553'} />
        </div>
      )}
    </div>
  );
};

const ExecutiveCommandCenter: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics/executive?range=${dateRange}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
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

  const formatPercent = (num: number) => {
    return `${(num || 0).toFixed(1)}%`;
  };

  const exportToCSV = () => {
    if (!data) return;
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Revenue', data.metrics.revenue.monthly],
      ['Total Orders', data.metrics.orders.total],
      ['Total Customers', data.metrics.customers.total],
      ['Average Order Value', data.metrics.avgOrderValue],
      ['Revenue Growth', `${data.metrics.revenue.growth}%`],
      ['Customer Retention', `${data.metrics.customers.retentionRate}%`]
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2a8a] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading Executive Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data?.success) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold">Unable to load data</h3>
        <button onClick={fetchData} className="mt-4 px-4 py-2 bg-[#1a2a8a] text-white rounded-lg">
          Retry
        </button>
      </div>
    );
  }

  const { metrics, revenueTrend, alerts, insights } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1a2a8a] to-[#40b553] bg-clip-text text-transparent">
            Executive Command Center
          </h1>
          <p className="text-gray-500 mt-1">Real-time business intelligence and performance metrics</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { value: '7d', label: '7D' },
              { value: '30d', label: '30D' },
              { value: '90d', label: '90D' },
              { value: 'ytd', label: 'YTD' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value)}
                className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                  dateRange === option.value
                    ? 'bg-[#1a2a8a] text-white'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button onClick={exportToCSV} className="p-2 hover:bg-gray-100 rounded-lg transition-all" title="Export Report">
            <Download className="w-5 h-5" />
          </button>
          <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* AI Executive Summary */}
      <div className="bg-gradient-to-r from-[#1a2a8a] to-[#40b553] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold">AI Executive Summary</h2>
          </div>
          <Tooltip text="AI-generated insights based on your store performance data">
            <Info className="w-4 h-4 text-white/70 cursor-help" />
          </Tooltip>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights && insights.map((insight: any, i: number) => (
            <div key={i} className={`p-4 rounded-xl ${
              insight.type === 'positive' ? 'bg-green-500/20' :
              insight.type === 'alert' ? 'bg-orange-500/20' : 'bg-white/10'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">{insight.title}</h4>
                <button className="text-xs underline opacity-70 hover:opacity-100">
                  {insight.action}
                </button>
              </div>
              <p className="text-sm">{insight.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Daily Revenue"
          value={formatCurrency(metrics.revenue.daily)}
          icon={<DollarSign className="w-5 h-5 text-blue-500" />}
          tooltip="💰 Total revenue from today's orders"
          color="blue"
        />
        <KPICard
          title="Weekly Revenue"
          value={formatCurrency(metrics.revenue.weekly)}
          icon={<Calendar className="w-5 h-5 text-green-500" />}
          tooltip="📅 Total revenue from last 7 days"
          color="green"
        />
        <KPICard
          title="Monthly Revenue"
          value={formatCurrency(metrics.revenue.monthly)}
          icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
          change={metrics.revenue.growth}
          tooltip="📊 Total revenue from last 30 days with growth comparison"
          color="purple"
          sparklineData={revenueTrend.map((r: any) => r.revenue).slice(-7)}
        />
        <KPICard
          title="Yearly Revenue"
          value={formatCurrency(metrics.revenue.yearly)}
          icon={<Award className="w-5 h-5 text-orange-500" />}
          tooltip="🎯 Total revenue for the year"
          color="orange"
        />
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(metrics.revenue.monthly)}
          icon={<DollarSign className="w-5 h-5 text-white" />}
          change={metrics.revenue.growth}
          tooltip="💰 Total Revenue: Sum of all completed orders"
          color="blue"
          onClick={() => setSelectedKPI('revenue')}
        />
        
        <KPICard
          title="Total Orders"
          value={formatNumber(metrics.orders.total)}
          icon={<ShoppingBag className="w-5 h-5 text-white" />}
          change={metrics.revenue.growth / 2}
          tooltip="📦 Total Orders: Count of all orders placed"
          color="green"
          onClick={() => setSelectedKPI('orders')}
        />
        
        <KPICard
          title="Active Customers"
          value={formatNumber(metrics.customers.total)}
          icon={<Users className="w-5 h-5 text-white" />}
          tooltip="👥 Active Customers: Unique customers who have placed orders"
          color="purple"
          onClick={() => setSelectedKPI('customers')}
        />
        
        <KPICard
          title="Avg Order Value"
          value={formatCurrency(metrics.avgOrderValue)}
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          tooltip="📊 Average Order Value: Total Revenue ÷ Total Orders"
          color="orange"
          onClick={() => setSelectedKPI('aov')}
        />
      </div>

      {/* Customer Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 text-center">
          <Tooltip text="👥 New customers who joined in the last 30 days">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 text-sm">New Customers</span>
            </div>
          </Tooltip>
          <p className="text-2xl font-bold text-blue-800">{metrics.customers.new}</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-center">
          <Tooltip text="🔄 Customers who have made multiple purchases">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Repeat className="w-4 h-4 text-green-600" />
              <span className="text-green-700 text-sm">Returning</span>
            </div>
          </Tooltip>
          <p className="text-2xl font-bold text-green-800">{metrics.customers.returning}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-center">
          <Tooltip text="💎 Percentage of customers who return to purchase again">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-purple-700 text-sm">Retention</span>
            </div>
          </Tooltip>
          <p className="text-2xl font-bold text-purple-800">{formatPercent(metrics.customers.retentionRate)}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 text-center">
          <Tooltip text="🎯 Customer Lifetime Value - projected revenue per customer">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Award className="w-4 h-4 text-orange-600" />
              <span className="text-orange-700 text-sm">CLV</span>
            </div>
          </Tooltip>
          <p className="text-2xl font-bold text-orange-800">{formatCurrency(metrics.avgOrderValue * 2)}</p>
        </div>
      </div>

      {/* Forecast Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-semibold">Revenue Forecast</h3>
            <Tooltip text="🤖 AI-predicted revenue for next 90 days based on historical performance">
              <Info className="w-3 h-3 text-white/70" />
            </Tooltip>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(metrics.forecast.revenue)}</p>
          <p className="text-sm opacity-80 mt-2">Next 90 days projection</p>
        </div>
        
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5" />
            <h3 className="font-semibold">Cash Forecast</h3>
            <Tooltip text="💰 Projected cash flow based on revenue forecast">
              <Info className="w-3 h-3 text-white/70" />
            </Tooltip>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(metrics.forecast.cash)}</p>
          <p className="text-sm opacity-80 mt-2">Expected cash position</p>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5" />
            <h3 className="font-semibold">Next Month</h3>
            <Tooltip text="📅 Projected revenue for next 30 days">
              <Info className="w-3 h-3 text-white/70" />
            </Tooltip>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(metrics.forecast.nextMonth)}</p>
          <p className="text-sm opacity-80 mt-2">30-day projection</p>
        </div>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-yellow-50 rounded-xl p-3 text-center">
          <Clock className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
          <p className="text-yellow-700 text-xs">Pending</p>
          <p className="text-xl font-bold text-yellow-800">{metrics.orders.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <CheckCircle className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <p className="text-blue-700 text-xs">Confirmed</p>
          <p className="text-xl font-bold text-blue-800">{metrics.orders.confirmed}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 text-center">
          <Truck className="w-5 h-5 text-purple-600 mx-auto mb-1" />
          <p className="text-purple-700 text-xs">Shipped</p>
          <p className="text-xl font-bold text-purple-800">{metrics.orders.shipped}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <Activity className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="text-green-700 text-xs">Delivered</p>
          <p className="text-xl font-bold text-green-800">{metrics.orders.delivered}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <AlertCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
          <p className="text-red-700 text-xs">Cancelled</p>
          <p className="text-xl font-bold text-red-800">{metrics.orders.cancelled}</p>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold">Revenue Trend</h3>
            <p className="text-sm text-gray-500">Last 6 months performance</p>
          </div>
          <BarChart3 className="w-5 h-5 text-[#1a2a8a]" />
        </div>
        <div className="space-y-4">
          {revenueTrend && revenueTrend.length > 0 ? revenueTrend.map((item: any, i: number) => {
            const maxRevenue = Math.max(...revenueTrend.map((r: any) => r.revenue));
            const percent = (item.revenue / maxRevenue) * 100;
            return (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.month}</span>
                  <span className="font-semibold">{formatCurrency(item.revenue)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8">
                  <div 
                    className="bg-gradient-to-r from-[#1a2a8a] to-[#40b553] h-8 rounded-full flex items-center justify-end px-3 text-white text-xs font-medium"
                    style={{ width: `${percent}%` }}
                  >
                    {item.orders} orders
                  </div>
                </div>
              </div>
            );
          }) : (
            <p className="text-center text-gray-500 py-8">No revenue data available</p>
          )}
        </div>
      </div>

      {/* Low Stock Alert Section */}
      {alerts.lowStock.count > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <div>
                <h3 className="font-semibold text-orange-700">Low Stock Alert</h3>
                <p className="text-orange-600 text-sm">
                  {alerts.lowStock.count} product(s) are running low on stock (inventory ≤ 5 units)
                </p>
              </div>
            </div>
            <button className="text-orange-600 text-sm underline">View all</button>
          </div>
          {alerts.lowStock.products && alerts.lowStock.products.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {alerts.lowStock.products.slice(0, 4).map((product: any, i: number) => (
                <div key={i} className="bg-white/50 rounded-lg p-2 flex justify-between items-center">
                  <span className="text-sm">{product.title.length > 20 ? product.title.substring(0, 20) + '...' : product.title}</span>
                  <span className="font-bold text-orange-600">{product.inventory} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Missing Repeat icon component
const Repeat: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export default ExecutiveCommandCenter;
