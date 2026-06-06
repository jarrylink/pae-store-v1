'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, TrendingDown, Award, Target, Zap,
  ArrowUp, ArrowDown, RefreshCw, BarChart3, Info, Sparkles,
  Calendar, Download, Filter, Shield, Activity, Clock,
  UserCheck, UserX, Heart, Star, AlertCircle, ShoppingBag
} from 'lucide-react';

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="cursor-help">
        {children}
      </div>
      {show && (
        <div className="absolute z-[9999] bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}
    </div>
  );
};

const KPICard: React.FC<{
  title: string;
  value: string;
  previousValue?: string;
  icon: React.ReactNode;
  change?: number;
  tooltip: string;
}> = ({ title, value, previousValue, icon, change, tooltip }) => {
  const isPositive = (change || 0) >= 0;
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</span>
            <Tooltip text={tooltip}>
              <Info className="w-3 h-3 text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{value}</p>
          {previousValue && previousValue !== '₦0' && (
            <p className="text-xs text-gray-500 mt-1">Previous: {previousValue}</p>
          )}
          {change !== undefined && change !== 0 && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              <span>{Math.abs(change).toFixed(1)}%</span>
              <span className="text-gray-400 ml-1">vs previous</span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
};

const formatCurrency = (amount: number): string => {
  if (!amount) return '₦0';
  if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `₦${(amount / 1000).toFixed(0)}K`;
  return `₦${amount.toLocaleString()}`;
};

export default function CustomerIntelligence() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics/customer?range=${range}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2a8a]" />
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const segments = data?.segments || {};
  const ltvBySegment = data?.ltvBySegment || {};
  const journey = data?.journey || [];
  const topCustomers = data?.topCustomers || [];
  const recommendations = data?.recommendations || [];

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1a2a8a] to-[#40b553] bg-clip-text text-transparent">
            Customer Intelligence
          </h1>
          <p className="text-sm text-gray-500 mt-1">Complete customer analytics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['7d', '30d', '90d'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  range === r ? 'bg-[#1a2a8a] text-white' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Filter className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Download className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-lg">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* AI Customer Summary */}
      <div className="bg-gradient-to-r from-[#1a2a8a]/5 to-[#40b553]/5 rounded-xl p-5 border border-[#1a2a8a]/10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#1a2a8a]" />
          <h2 className="text-sm font-semibold text-[#1a2a8a] uppercase">AI Customer Intelligence</h2>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          You have <span className="font-semibold">{metrics.totalCustomers}</span> total customers with a retention rate of 
          <span className="font-semibold"> {metrics.retentionRate?.toFixed(0)}%</span>. 
          Average customer lifetime value is <span className="font-semibold">{formatCurrency(metrics.avgLTV)}</span>.
          {metrics.churnRate > 20 && ` Churn rate at ${metrics.churnRate.toFixed(0)}% needs attention.`}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="TOTAL CUSTOMERS"
          value={metrics.totalCustomers?.toLocaleString() || '0'}
          icon={<Users className="w-5 h-5" />}
          tooltip="Total registered customers"
        />
        <KPICard
          title="RETENTION RATE"
          value={`${metrics.retentionRate?.toFixed(1) || 0}%`}
          icon={<UserCheck className="w-5 h-5 text-green-500" />}
          tooltip="Percentage of customers who made repeat purchases"
        />
        <KPICard
          title="CHURN RATE"
          value={`${metrics.churnRate?.toFixed(1) || 0}%`}
          icon={<UserX className="w-5 h-5 text-red-500" />}
          change={metrics.churnRate ? -metrics.churnRate : 0}
          tooltip="Customers who haven't purchased in 90+ days"
        />
        <KPICard
          title="AVG LIFETIME VALUE"
          value={formatCurrency(metrics.avgLTV)}
          icon={<Award className="w-5 h-5 text-purple-500" />}
          tooltip="Average revenue per customer"
        />
      </div>

      {/* Customer Segmentation */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Target className="w-5 h-5 text-[#1a2a8a]" />
          <h2 className="text-lg font-semibold">Customer Segmentation</h2>
          <Tooltip text="Customers grouped by spending behavior">
            <Info className="w-3.5 h-3.5 text-gray-400" />
          </Tooltip>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
            <Award className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-700">{segments.vip || 0}</p>
            <p className="text-xs text-purple-600">VIP Customers</p>
            <p className="text-xs text-gray-500 mt-1">Spent ₦1M+</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
            <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-700">{segments.regular || 0}</p>
            <p className="text-xs text-blue-600">Regular Customers</p>
            <p className="text-xs text-gray-500 mt-1">Spent ₦200K-₦1M</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
            <ShoppingBag className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">{segments.occasional || 0}</p>
            <p className="text-xs text-green-600">Occasional</p>
            <p className="text-xs text-gray-500 mt-1">Spent ₦50K-₦200K</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center">
            <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-700">{segments.new || 0}</p>
            <p className="text-xs text-yellow-600">New Customers</p>
            <p className="text-xs text-gray-500 mt-1">First purchase</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center">
            <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-700">{segments.atRisk || 0}</p>
            <p className="text-xs text-red-600">At Risk</p>
            <p className="text-xs text-gray-500 mt-1">Inactive 60+ days</p>
          </div>
        </div>
      </div>

      {/* LTV by Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-purple-500" />
            <h3 className="text-base font-semibold">VIP LTV</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(ltvBySegment.vip)}</p>
          <p className="text-xs text-gray-500 mt-1">Average lifetime value</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-semibold">Regular LTV</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(ltvBySegment.regular)}</p>
          <p className="text-xs text-gray-500 mt-1">Average lifetime value</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-green-500" />
            <h3 className="text-base font-semibold">Occasional LTV</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(ltvBySegment.occasional)}</p>
          <p className="text-xs text-gray-500 mt-1">Average lifetime value</p>
        </div>
      </div>

      {/* Customer Journey */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-5 h-5 text-[#1a2a8a]" />
          <h2 className="text-lg font-semibold">Customer Journey</h2>
          <Tooltip text="Customer progression through the sales funnel">
            <Info className="w-3.5 h-3.5 text-gray-400" />
          </Tooltip>
        </div>
        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2" />
          <div className="relative flex justify-between">
            {journey.map((stage: { stage: string; count: number; percentage: number }, idx: number) => (
              <div key={idx} className="text-center z-10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1a2a8a] to-[#40b553] flex items-center justify-center text-white text-sm font-bold mx-auto mb-2">
                  {stage.percentage?.toFixed(0)}%
                </div>
                <p className="text-xs font-medium text-gray-700">{stage.stage}</p>
                <p className="text-xs text-gray-400">{stage.count} customers</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1a2a8a]" />
            <h2 className="text-lg font-semibold">Top Customers</h2>
            <Tooltip text="Highest spending customers">
              <Info className="w-3.5 h-3.5 text-gray-400" />
            </Tooltip>
          </div>
          <button className="text-xs text-[#1a2a8a] hover:underline">View All →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase">Orders</th>
                <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase">Total Spent</th>
                <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase">Avg Order</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.slice(0, 5).map((customer: { name: string; email: string; orderCount: number; totalSpent: number; avgOrderValue: number }, idx: number) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-3">
                    <p className="text-sm font-medium text-gray-800">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                  </td>
                  <td className="text-right py-3 text-sm text-gray-600">{customer.orderCount}</td>
                  <td className="text-right py-3 text-sm font-semibold text-gray-900">{formatCurrency(customer.totalSpent)}</td>
                  <td className="text-right py-3 text-sm text-gray-600">{formatCurrency(customer.avgOrderValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-5 h-5 text-[#40b553]" />
            <h2 className="text-lg font-semibold">AI Recommendations</h2>
            <Tooltip text="Actionable insights to improve customer metrics">
              <Info className="w-3.5 h-3.5 text-gray-400" />
            </Tooltip>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec: { type: string; title: string; message: string; action: string }, idx: number) => (
              <div key={idx} className={`p-4 rounded-lg border ${
                rec.type === 'positive' ? 'bg-green-50 border-green-200' :
                rec.type === 'alert' ? 'bg-red-50 border-red-200' :
                rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rec.message}</p>
                  </div>
                  <button className="text-xs px-3 py-1 rounded-lg bg-white shadow-sm hover:shadow transition-all">
                    {rec.action} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}





