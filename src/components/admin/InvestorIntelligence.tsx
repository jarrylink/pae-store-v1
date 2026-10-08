'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Building2,
  MapPin, Leaf, Award, RefreshCw, Info, Calendar, Download,
  BarChart3, Activity, Globe, PieChart, Target, Rocket,
  Shield, Briefcase, LineChart, Percent, ShoppingBag, Zap, Home
} from 'lucide-react';

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

const formatCompactCurrency = (amount: number): string => {
  if (!amount) return '₦0';
  if (amount >= 1_000_000_000) return `₦${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}K`;
  return `₦${amount.toLocaleString()}`;
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

// KPI Card Component
const KPICard: React.FC<{
  title: string;
  value: number;
  previousValue?: number;
  icon: React.ReactNode;
  tooltip: string;
  suffix?: string;
  isCurrency?: boolean;
  change?: number;
  changeLabel?: string;
}> = ({ title, value, previousValue, icon, tooltip, suffix = '', isCurrency = false, change, changeLabel = 'vs previous' }) => {
  const displayValue = isCurrency ? formatCurrency(value) : formatNumber(value);
  const isPositive = (change || 0) >= 0;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</span>
            <Tooltip text={tooltip}>
              <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{displayValue}{suffix}</p>
          {previousValue && (
            <p className="text-xs text-gray-500 mt-1">Previous: {isCurrency ? formatCurrency(previousValue) : formatNumber(previousValue)}</p>
          )}
          {change !== undefined && change !== 0 && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{Math.abs(change).toFixed(1)}%</span>
              <span className="text-gray-400 ml-1">{changeLabel}</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#1a2a8a] to-[#40b553] flex items-center justify-center shadow-md">
          {icon}
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function InvestorIntelligence() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState('quarter');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics/investor?range=${range}`);
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

  const financial = data?.financialMetrics || {};
  const growth = data?.growthMetrics || {};
  const market = data?.marketMetrics || {};
  const esg = data?.esgMetrics || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Investor Intelligence
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Financial performance, growth metrics, and ESG impact for investors
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-xl shadow-sm p-1">
              {['month', 'quarter', 'year', 'all'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    range === r ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {r === 'month' ? 'MONTH' : r === 'quarter' ? 'QUARTER' : r === 'year' ? 'YEAR' : 'ALL TIME'}
                </button>
              ))}
            </div>
            <button onClick={fetchData} className="p-2.5 bg-white rounded-xl shadow-sm">
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2.5 bg-white rounded-xl shadow-sm">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Executive Summary - Investor Pitch */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-blue-800">Investment Thesis</h2>
              <p className="text-sm text-blue-700">Powering Africa's renewable energy revolution</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCompactCurrency(financial.revenue)}</p>
              <p className="text-xs text-green-600 mt-1">+{financial.revenueGrowth?.toFixed(1)}% growth</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer Base</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(growth.customerCount)}</p>
              <p className="text-xs text-green-600 mt-1">+{growth.customerGrowth?.toFixed(1)}% new</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Market Coverage</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(market.statesCovered)} States</p>
              <p className="text-xs text-green-600 mt-1">{market.marketPenetration?.toFixed(1)}% of Nigeria</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CO₂ Reduction</p>
              <p className="text-2xl font-bold text-green-600">{formatNumber(esg.co2Reduction)} tons</p>
              <p className="text-xs text-gray-500 mt-1">Annual impact</p>
            </div>
          </div>
        </div>

        {/* Financial Performance */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Financial Performance</h2>
              <p className="text-sm text-gray-500">Revenue, growth, and profitability metrics</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="TOTAL REVENUE"
              value={financial.revenue}
              previousValue={financial.previousRevenue}
              icon={<DollarSign className="w-6 h-6 text-white" />}
              tooltip="Total revenue from confirmed orders"
              isCurrency={true}
              change={financial.revenueGrowth}
              changeLabel="period over period"
            />
            <KPICard
              title="TOTAL ORDERS"
              value={financial.orders}
              icon={<ShoppingBag className="w-6 h-6 text-white" />}
              tooltip="Number of confirmed orders"
              isCurrency={false}
            />
            <KPICard
              title="AVG ORDER VALUE"
              value={financial.avgOrderValue}
              icon={<TrendingUp className="w-6 h-6 text-white" />}
              tooltip="Average transaction value"
              isCurrency={true}
            />
            <KPICard
              title="CUSTOMER LTV"
              value={financial.avgOrderValue * 1.5}
              icon={<Users className="w-6 h-6 text-white" />}
              tooltip="Estimated customer lifetime value"
              isCurrency={true}
            />
          </div>
        </div>

        {/* Growth & Market Expansion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Growth Metrics */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Growth Metrics</h3>
                <p className="text-sm text-gray-500">Customer and market expansion</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Total Customers</span>
                <span className="text-xl font-bold">{formatNumber(growth.customerCount)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">New Customers</span>
                <span className="text-xl font-bold text-green-600">{formatNumber(growth.newCustomers)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Customer Growth Rate</span>
                <span className="text-xl font-bold text-green-600">{growth.customerGrowth?.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Active Vendors</span>
                <span className="text-xl font-bold">{formatNumber(growth.vendorCount)}</span>
              </div>
            </div>
          </div>

          {/* Market Expansion */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Market Expansion</h3>
                <p className="text-sm text-gray-500">Geographic coverage and penetration</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">States Covered</span>
                <span className="text-xl font-bold">{formatNumber(market.statesCovered)} / 37</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Market Penetration</span>
                <span className="text-xl font-bold text-blue-600">{market.marketPenetration?.toFixed(1)}%</span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Market Coverage Progress</p>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${market.marketPenetration}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ESG & Impact for Investors */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">ESG Impact Metrics</h3>
              <p className="text-sm text-gray-500">Environmental, Social & Governance performance</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <Leaf className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">CO₂ Reduction</p>
              <p className="text-2xl font-bold">{formatNumber(esg.co2Reduction)} tons</p>
              <p className="text-xs text-gray-500 mt-1">Annual carbon offset</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Renewable Capacity</p>
              <p className="text-2xl font-bold">{formatNumber(esg.renewableCapacity)} kW</p>
              <p className="text-xs text-gray-500 mt-1">Clean energy installed</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-xl text-center">
              <Home className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Homes Electrified</p>
              <p className="text-2xl font-bold">{formatNumber(esg.homesElectrified)}</p>
              <p className="text-xs text-gray-500 mt-1">Clean energy access</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl text-center">
              <Briefcase className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Jobs Created</p>
              <p className="text-2xl font-bold">{formatNumber(Math.round(esg.installations * 0.5))}</p>
              <p className="text-xs text-gray-500 mt-1">Direct & indirect</p>
            </div>
          </div>
        </div>

        {/* Key Investment Highlights */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-800">Key Investment Highlights</h3>
              <p className="text-sm text-indigo-700">Why invest in Power Afric</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold">High Growth Market</p>
                <p className="text-xs text-gray-500">Nigeria's renewable energy market growing at 15% CAGR</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold">Government Support</p>
                <p className="text-xs text-gray-500">Backed by renewable energy policies and incentives</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <Leaf className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold">ESG Focus</p>
                <p className="text-xs text-gray-500">Aligned with UN SDGs and net-zero targets</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Investor Relations</p>
              <p className="text-xs text-blue-700 mt-1">
                For detailed financial statements, investor presentations, and private placement memorandums, please contact our Investor Relations team at investors@powerafric.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
