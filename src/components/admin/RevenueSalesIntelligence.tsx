'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Package, RefreshCw, TrendingDown } from 'lucide-react';

const formatCurrency = (amount: number): string => {
  if (!amount) return '?0';
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

const KPICard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  tooltip: string;
  isCurrency?: boolean;
  growth?: number;
  previousValue?: number;
}> = ({ title, value, icon, tooltip, isCurrency = true, growth, previousValue }) => {
  const displayValue = isCurrency ? formatCurrency(value) : formatNumber(value);
  const isPositive = growth !== undefined && growth >= 0;
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase">{title}</span>
          </div>
          <p className="text-2xl font-bold mt-2">{displayValue}</p>
          {previousValue !== undefined && (
            <p className="text-xs text-gray-500 mt-1">Previous: {isCurrency ? formatCurrency(previousValue) : formatNumber(previousValue)}</p>
          )}
          {growth !== undefined && (
            <div className="flex items-center gap-1 mt-1 text-xs">
              {isPositive ? <TrendingUp className="w-3 h-3 text-green-600" /> : <TrendingDown className="w-3 h-3 text-red-600" />}
              <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(growth).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#1a2a8a] to-[#40b553] flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default function RevenueSalesIntelligence() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = '/api/admin/analytics/revenue-sales?range=' + range;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        console.error('API Error:', json.error);
      }
    } catch (err) {
      console.error('Error fetching revenue data:', err);
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

  if (!data) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border">
        <p className="text-gray-500">No revenue data available</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-[#1a2a8a] text-white rounded-lg hover:bg-[#152070] transition-colors"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Retry
        </button>
      </div>
    );
  }

  const { revenueMetrics, dailyTrend, statusBreakdown, topProducts, salesChannels } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1a2a8a] to-[#40b553] bg-clip-text text-transparent">
            Revenue & Sales Intelligence
          </h1>
          <p className="text-sm text-gray-500">Real-time sales analytics</p>
        </div>
        <div className="flex gap-2">
          {['today', '7d', '30d', '90d', 'month', 'year'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={r === range ? 'px-4 py-2 rounded-lg text-sm font-medium bg-[#1a2a8a] text-white' : 'px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200'}
            >
              {r.toUpperCase()}
            </button>
          ))}
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Orders Placed"
          value={revenueMetrics.placed.orders}
          icon={<ShoppingBag className="w-6 h-6 text-white" />}
          tooltip="Total orders placed in this period"
          isCurrency={false}
          growth={revenueMetrics.placed.growth}
          previousValue={revenueMetrics.placed.previousOrders}
        />
        <KPICard
          title="Placed Value"
          value={revenueMetrics.placed.value}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          tooltip="Total value of orders placed"
          isCurrency={true}
          growth={revenueMetrics.placed.growth}
          previousValue={revenueMetrics.placed.previousValue}
        />
        <KPICard
          title="Confirmed Orders"
          value={revenueMetrics.confirmed.orders}
          icon={<Package className="w-6 h-6 text-white" />}
          tooltip="Orders with confirmed payment"
          isCurrency={false}
          growth={revenueMetrics.confirmed.growth}
          previousValue={revenueMetrics.confirmed.previousOrders}
        />
        <KPICard
          title="Confirmed Revenue"
          value={revenueMetrics.confirmed.value}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          tooltip="Actual revenue from confirmed orders"
          isCurrency={true}
          growth={revenueMetrics.confirmed.growth}
          previousValue={revenueMetrics.confirmed.previousValue}
        />
      </div>

      {/* Daily Trend Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue Trend</h3>
        <div className="space-y-2">
          {dailyTrend && dailyTrend.map((day: any, index: number) => {
            const maxValue = dailyTrend.length > 0 ? Math.max(...dailyTrend.map((d: any) => d.totalValue), 1) : 1;
            const percentage = (day.totalValue / maxValue) * 100;
            
            return (
              <div key={index} className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-16">{day.date}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#1a2a8a] to-[#40b553] rounded-full transition-all duration-500"
                    style={{ width: percentage + '%' }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-20 text-right">
                  {formatCurrency(day.totalValue)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statusBreakdown && statusBreakdown.map((status: any) => (
            <div key={status.status} className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">{status.status}</p>
              <p className="text-2xl font-bold text-gray-900">{status.orders}</p>
              <p className="text-xs text-gray-500">{formatCurrency(status.revenue)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProducts && topProducts.map((product: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.quantity} sold</p>
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Channels */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Channels</h3>
          <div className="space-y-3">
            {salesChannels && salesChannels.map((channel: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{channel.name}</p>
                  <p className="text-sm text-gray-500">{channel.orders} orders</p>
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(channel.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
