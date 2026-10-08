'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell, AlertCircle, CheckCircle, Package, ShoppingBag,
  Users, TrendingUp, RefreshCw, Info, XCircle, Clock,
  Truck, CreditCard, Zap, Shield, Activity, Calendar
} from 'lucide-react';

const formatCurrency = (amount: number): string => {
  if (!amount) return 'â‚¦0';
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

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="cursor-help">
        {children}
      </div>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

// Alert Card Component
const AlertCard: React.FC<{
  alert: any;
  onDismiss?: (id: string) => void;
}> = ({ alert, onDismiss }) => {
  const getTypeStyles = (type: string) => {
    switch(type) {
      case 'critical':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'critical':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <div className={`rounded-xl border p-5 ${getTypeStyles(alert.type)} transition-all hover:shadow-md`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {getIcon(alert.type)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-semibold text-gray-900">{alert.title}</h4>
            <span className="text-xs text-gray-500">
              {new Date(alert.timestamp).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
          {alert.details && (
            <p className="text-xs text-gray-500 mt-2">Details: {alert.details}</p>
          )}
          {alert.action && (
            <div className="mt-3 flex items-center gap-2">
              <button className="text-sm px-3 py-1.5 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
                {alert.action}
              </button>
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={() => onDismiss(alert.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// Main Component
export default function AlertsMonitoringCenter() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/analytics/alerts');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (id: string) => {
    // In production, you would call an API to dismiss the alert
    console.log('Dismiss alert:', id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2a8a]" />
      </div>
    );
  }

  const alerts = data?.alerts || [];
  const summary = data?.summary || { critical: 0, warning: 0, info: 0, total: 0 };
  const metrics = data?.metrics || {};

  const filteredAlerts = activeFilter === 'all' 
    ? alerts 
    : alerts.filter((a: any) => a.type === activeFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Alerts & Monitoring Center
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Real-time business alerts and critical notifications
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-2.5 bg-white rounded-xl shadow-sm">
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Alert Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Critical Alerts</p>
                <p className="text-3xl font-bold text-red-600">{summary.critical}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Warning Alerts</p>
                <p className="text-3xl font-bold text-yellow-600">{summary.warning}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-yellow-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Info Alerts</p>
                <p className="text-3xl font-bold text-blue-600">{summary.info}</p>
              </div>
              <Info className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Alerts</p>
                <p className="text-3xl font-bold text-purple-600">{summary.total}</p>
              </div>
              <Bell className="w-10 h-10 text-purple-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Out of Stock</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.outOfStock)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.lowStock)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Orders</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.pendingOrders)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Delayed Orders</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.delayedOrders)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200 pb-2">
          {['all', 'critical', 'warning', 'info'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeFilter === filter
                  ? 'bg-[#1a2a8a] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filter === 'all' ? 'All Alerts' : (filter || "").charAt(0).toUpperCase() + (filter || "").slice(1)}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">All Clear!</h3>
              <p className="text-gray-500 mt-1">No active alerts at this time.</p>
              <p className="text-sm text-gray-400 mt-2">Your business is running smoothly.</p>
            </div>
          )}
          {filteredAlerts.map((alert: any) => (
            <AlertCard key={alert.id} alert={alert} onDismiss={dismissAlert} />
          ))}
        </div>

        {/* Info Banner */}
        <div className="bg-gray-100 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Alert Configuration</p>
              <p className="text-xs text-gray-500 mt-1">
                Alerts are automatically generated based on real-time data.<br />
                Critical: Immediate action required | Warning: Attention needed | Info: For awareness
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
