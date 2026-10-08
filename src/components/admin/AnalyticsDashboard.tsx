'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, TrendingDown, ShoppingBag, Users, DollarSign, 
  Clock, CheckCircle, Truck, AlertCircle, Info, Calendar,
  ArrowUp, ArrowDown, RefreshCw, Package, 
  Building2, Wrench, Eye, Target, Award, Zap, Repeat,
  ChevronLeft, ChevronRight, RotateCcw, CheckCircle2,
  Activity, Sparkles
} from 'lucide-react';
import RevenueTrendChart from './RevenueTrendChart';

// Premium Tooltip with Brand Colors
const PremiumTooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="cursor-help">
        {children}
      </div>
      {show && (
        <div className="absolute z-[9999] bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-[#1a2a8a] text-white text-xs rounded-lg shadow-xl whitespace-nowrap max-w-xs pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-2 h-2 bg-[#1a2a8a] rotate-45" />
        </div>
      )}
    </div>
  );
};

// Scrollable Selector with Brand Colors
const BrandSelector: React.FC<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}> = ({ options, value, onChange, label }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [value]);
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 250;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
        {value && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#40b553]" />
            <span className="text-xs text-[#40b553]">
              {options.find(o => o.value === value)?.label}
            </span>
          </div>
        )}
      </div>
      <div className="relative flex items-center">
        <button
          onClick={() => scroll('left')}
          className="absolute -left-8 z-10 w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 transition-all border border-gray-200 dark:border-gray-700"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
        </button>
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              ref={opt.value === value ? selectedRef : null}
              onClick={() => onChange(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                value === opt.value
                  ? 'bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white shadow-md'
                  : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => scroll('right')}
          className="absolute -right-8 z-10 w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 transition-all border border-gray-200 dark:border-gray-700"
        >
          <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

// KPI Card with Business Advantage
const BusinessCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: number;
  tooltip: string;
  period?: string;
  onPeriodChange?: (period: string) => void;
  periodOptions?: { value: string; label: string }[];
  onReset?: () => void;
  description?: string;
  advantage?: string;
}> = ({ title, value, icon, change, tooltip, period, onPeriodChange, periodOptions, onReset, description, advantage }) => {
  const isPositive = (change || 0) >= 0;
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 overflow-hidden" style={{ minHeight: '300px' }}>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</span>
              <PremiumTooltip text={tooltip}>
                <div className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-help">
                  <span className="text-[10px] text-gray-500">?</span>
                </div>
              </PremiumTooltip>
            </div>
            <p className="text-3xl font-semibold mt-3 text-gray-900 dark:text-white tracking-tight">
              {value}
            </p>
            {description && (
              <p className="text-xs text-gray-400 mt-2">{description}</p>
            )}
            {change !== undefined && (
              <div className={`flex items-center gap-1.5 mt-3 ${isPositive ? 'text-[#40b553]' : 'text-rose-600'}`}>
                {isPositive ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                <span className="text-sm font-medium">{Math.abs(change).toFixed(1)}%</span>
                <span className="text-xs text-gray-400">vs previous</span>
              </div>
            )}
            {advantage && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 leading-relaxed">{advantage}</p>
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a2a8a]/10 to-[#40b553]/10 flex items-center justify-center text-[#1a2a8a]">
            {icon}
          </div>
        </div>
      </div>
      {periodOptions && periodOptions.length > 0 && (
        <div className="px-6 pb-6">
          <BrandSelector
            options={periodOptions}
            value={period || ''}
            onChange={(val) => onPeriodChange?.(val)}
            label="PERIOD"
          />
        </div>
      )}
      {onReset && (
        <div className="px-6 pb-6 pt-0">
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#1a2a8a] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset to current
          </button>
        </div>
      )}
    </div>
  );
};

const AnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [error, setError] = useState<string | null>(null);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const yearOptions = Array.from({ length: 65 }, (_, i) => ({ value: (2026 + i).toString(), label: (2026 + i).toString() }));
  const monthOptions = monthNames.map((name, i) => ({ value: (i + 1).toString(), label: name.slice(0, 3) }));
  const weekOptions = [
    { value: '1', label: 'W1' }, { value: '2', label: 'W2' }, 
    { value: '3', label: 'W3' }, { value: '4', label: 'W4' }
  ];
  
  const getDayOptions = () => {
    const days = [];
    const baseDate = new Date(selectedYear, selectedMonth - 1, 1);
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - baseDate.getDay());
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push({ value: date.toISOString().split('T')[0], label: date.toLocaleDateString('en-US', { weekday: 'short' }) });
    }
    return days;
  };
  
  const [dayOptions, setDayOptions] = useState(getDayOptions());
  const [availableYears, setAvailableYears] = useState<number[]>([2026]);

  useEffect(() => {
    setDayOptions(getDayOptions());
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth, selectedWeek, selectedDay]);

  const resetToCurrent = () => {
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth(new Date().getMonth() + 1);
    setSelectedWeek(1);
    setSelectedDay(new Date().toISOString().split('T')[0]);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/analytics/executive?year=${selectedYear}&month=${selectedMonth}&week=${selectedWeek}&day=${selectedDay}`);
      const result = await response.json();
      if (result.success) {
        setData(result);
        if (result.availableYears) setAvailableYears(result.availableYears);
      } else {
        setError(result.error || 'No data available for selected period');
      }
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `₦${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `₦${(amount / 1000).toFixed(0)}K`;
    return `₦${amount.toLocaleString()}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const formatPercent = (num: number) => {
    return `${(num || 0).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-[#1a2a8a]/20 border-t-[#1a2a8a] rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">{error}</h3>
        <button onClick={resetToCurrent} className="mt-4 px-4 py-2 text-sm bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg">Reset</button>
      </div>
    );
  }

  const { metrics, revenueTrend, alerts, insights } = data || {};

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-[#1a2a8a] to-[#40b553] bg-clip-text text-transparent">Command Center</h1>
          <p className="text-sm text-gray-500 mt-1">Enterprise performance intelligence</p>
        </div>
        <div className="flex gap-3">
          <button onClick={resetToCurrent} className="px-4 py-2 text-sm text-gray-600 hover:text-[#1a2a8a] transition-colors flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-[#1a2a8a] transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Executive Summary - Comprehensive */}
      {insights && insights.length > 0 && (
        <div className="bg-gradient-to-r from-[#1a2a8a]/5 to-[#40b553]/5 rounded-2xl p-6 border border-[#1a2a8a]/10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#1a2a8a]" />
            <h2 className="text-sm font-medium text-[#1a2a8a] uppercase tracking-wider">AI Intelligence Center</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.slice(0, 6).map((insight: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    insight.type === 'positive' ? 'bg-[#40b553]' :
                    insight.type === 'alert' ? 'bg-blue-500' :
                    insight.type === 'critical' ? 'bg-rose-500' : 'bg-gray-400'
                  }`} />
                  <h4 className="text-xs font-medium text-gray-500 uppercase">{insight.title}</h4>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insight.message}</p>
                <button className="text-xs text-[#1a2a8a] hover:text-[#40b553] mt-3 transition-colors">
                  {insight.action} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium Revenue Chart */}
      {revenueTrend && revenueTrend.length > 0 && (
        <RevenueTrendChart data={revenueTrend} selectedYear={selectedYear} onYearChange={setSelectedYear} availableYears={availableYears} />
      )}

      {/* Revenue Metrics Cards with Business Advantages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        <BusinessCard
          title="Annual Revenue"
          value={formatCurrency(metrics?.revenue?.yearly || 0)}
          icon={<Award className="w-5 h-5" />}
          tooltip="Total revenue for the selected year from all completed orders."
          period={selectedYear.toString()}
          periodOptions={yearOptions}
          onPeriodChange={(period) => setSelectedYear(parseInt(period))}
          description={`Full year ${selectedYear}`}
          advantage="📊 Track year-over-year growth to measure business expansion and market share."
        />

        <BusinessCard
          title="Monthly Revenue"
          value={formatCurrency(metrics?.revenue?.monthly || 0)}
          icon={<Package className="w-5 h-5" />}
          change={metrics?.revenue?.growth}
          tooltip="Total revenue for the selected month. Growth compares to previous month."
          period={selectedMonth.toString()}
          periodOptions={monthOptions}
          onPeriodChange={(period) => setSelectedMonth(parseInt(period))}
          description={`${monthNames[selectedMonth - 1]} ${selectedYear}`}
          advantage="📈 Monitor monthly performance to identify seasonal patterns and optimize marketing spend."
        />

        <BusinessCard
          title="Weekly Revenue"
          value={formatCurrency(metrics?.revenue?.weekly || 0)}
          icon={<Calendar className="w-5 h-5" />}
          tooltip="Total revenue for the selected week."
          period={selectedWeek.toString()}
          periodOptions={weekOptions}
          onPeriodChange={(period) => setSelectedWeek(parseInt(period))}
          description={`Week ${selectedWeek} of ${monthNames[selectedMonth - 1]}`}
          advantage="⏱️ Track short-term trends to evaluate campaign effectiveness and adjust quickly."
        />

        <BusinessCard
          title="Daily Revenue"
          value={formatCurrency(metrics?.revenue?.daily || 0)}
          icon={<Activity className="w-5 h-5" />}
          tooltip="Total revenue for the selected day."
          period={selectedDay}
          periodOptions={dayOptions}
          onPeriodChange={(period) => setSelectedDay(period)}
          description={dayOptions.find(d => d.value === selectedDay)?.label || 'Today'}
          advantage="📅 Identify peak days and optimize staffing, promotions, and customer support."
        />

        <BusinessCard
          title="Lifetime Revenue"
          value={formatCurrency(metrics?.revenue?.totalAllTime || 0)}
          icon={<DollarSign className="w-5 h-5" />}
          tooltip="Total revenue since platform launch."
          onReset={resetToCurrent}
          description="All time"
          advantage="🏆 Measure total business value created and track long-term growth trajectory."
        />

        <BusinessCard
          title="Revenue Momentum"
          value={formatPercent(metrics?.revenue?.growth || 0)}
          icon={<TrendingUp className="w-5 h-5" />}
          change={metrics?.revenue?.growth}
          tooltip="Month-over-month revenue growth rate."
          description="vs previous month"
          advantage="⚡ Early warning system for business health. Positive momentum = growth, negative = action needed."
        />
      </div>

      {/* Order Status */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Package className="w-4 h-4 text-[#1a2a8a]" />
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Fulfillment Pipeline</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <div className="text-center p-3 rounded-xl bg-sky-50 dark:bg-sky-900/10">
            <Clock className="w-4 h-4 text-sky-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{metrics?.operational?.orders?.pending || 0}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10">
            <CheckCircle className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Confirmed</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{metrics?.operational?.orders?.confirmed || 0}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-purple-50 dark:bg-purple-900/10">
            <Truck className="w-4 h-4 text-purple-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Shipped</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{metrics?.operational?.orders?.shipped || 0}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10">
            <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Delivered</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{metrics?.operational?.orders?.delivered || 0}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10">
            <AlertCircle className="w-4 h-4 text-rose-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Cancelled</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{metrics?.operational?.orders?.cancelled || 0}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30">
            <ShoppingBag className="w-4 h-4 text-gray-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{metrics?.operational?.orders?.total || 0}</p>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {alerts?.lowStockCount > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-5 border border-blue-200 dark:border-blue-800/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">Inventory Alert</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">{alerts.lowStockCount} products running low on stock. Restock recommended.</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Users className="w-4 h-4 text-[#1a2a8a]" />
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Customer Intelligence</h2>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div><p className="text-xs text-gray-400">Total Customers</p><p className="text-xl font-semibold text-gray-900 dark:text-white">{formatNumber(metrics?.customer?.total || 0)}</p></div>
            <div><p className="text-xs text-gray-400">New (30d)</p><p className="text-xl font-semibold text-[#40b553]">{formatNumber(metrics?.customer?.new || 0)}</p></div>
            <div><p className="text-xs text-gray-400">Returning</p><p className="text-xl font-semibold text-gray-900 dark:text-white">{formatNumber(metrics?.customer?.returning || 0)}</p></div>
            <div><p className="text-xs text-gray-400">Retention</p><p className="text-xl font-semibold text-gray-900 dark:text-white">{formatPercent(metrics?.customer?.retentionRate || 0)}</p></div>
            <div className="col-span-2"><p className="text-xs text-gray-400">Average Order Value</p><p className="text-xl font-semibold text-gray-900 dark:text-white">{formatCurrency(metrics?.customer?.averageOrderValue || 0)}</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="w-4 h-4 text-[#40b553]" />
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Marketplace Ecosystem</h2>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div><p className="text-xs text-gray-400">Vendors</p><p className="text-xl font-semibold text-gray-900 dark:text-white">{metrics?.marketplace?.vendors?.total || 0}</p></div>
            <div><p className="text-xs text-gray-400">Active</p><p className="text-xl font-semibold text-[#40b553]">{metrics?.marketplace?.vendors?.active || 0}</p></div>
            <div><p className="text-xs text-gray-400">Installers</p><p className="text-xl font-semibold text-gray-900 dark:text-white">{metrics?.marketplace?.installers?.total || 0}</p></div>
            <div><p className="text-xs text-gray-400">Available</p><p className="text-xl font-semibold text-[#40b553]">{metrics?.marketplace?.installers?.available || 0}</p></div>
            <div><p className="text-xs text-gray-400">Avg Rating</p><p className="text-xl font-semibold text-gray-900 dark:text-white">{metrics?.marketplace?.installers?.avgRating || 0} ⭐</p></div>
            <div><p className="text-xs text-gray-400">Jobs</p><p className="text-xl font-semibold text-gray-900 dark:text-white">{formatNumber(metrics?.marketplace?.installers?.totalJobsCompleted || 0)}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
