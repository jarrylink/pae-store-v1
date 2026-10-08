'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Users, DollarSign, Leaf, BarChart3,
  RefreshCw, Info, Facebook, Instagram, Globe, Target, Award,
  Building2, Home, Battery, Cloud, Fuel, Megaphone, Zap,
  Calendar, Download, Filter, Activity, PieChart, Heart
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
}> = ({ title, value, previousValue, icon, tooltip, suffix = '', isCurrency = false, change }) => {
  const displayValue = isCurrency ? formatCurrency(value) : formatNumber(value);
  const isPositive = (change || 0) >= 0;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100">
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
              <span className="text-gray-400 ml-1">vs previous</span>
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
export default function MarketingESGIntelligence() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics/marketing?range=${range}`);
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

  const revenue = data?.revenueMetrics || {};
  const customers = data?.customerMetrics || {};
  const vendors = data?.vendorMetrics || {};
  const esg = data?.esgMetrics || {};
  const campaign = data?.campaignMetrics || {};
  const traffic = data?.trafficMetrics || {};
  const social = data?.socialMetrics || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1a2a8a] to-[#40b553] bg-clip-text text-transparent">
              Marketing, ESG & Strategic Intelligence
            </h1>
            <p className="text-sm text-gray-500 mt-1">Growth effectiveness, sustainability impact, and investor metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-xl shadow-sm p-1">
              {['7d', '30d', '90d', 'year'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    range === r ? 'bg-[#1a2a8a] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {r === 'year' ? 'YEAR' : r.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={fetchData} className="p-2.5 bg-white rounded-xl shadow-sm">
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Revenue & Growth Section */}
        <div className="bg-gradient-to-r from-[#1a2a8a]/5 to-[#40b553]/5 rounded-2xl p-6 border border-[#1a2a8a]/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#1a2a8a] to-[#40b553] flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Strategic Dashboard</h2>
              <p className="text-sm text-gray-500">Key growth and impact metrics</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Revenue Growth</p>
              <p className={`text-2xl font-bold ${revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenue.growth?.toFixed(1) || 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Period over period</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Customer Growth</p>
              <p className="text-2xl font-bold text-blue-600">{formatNumber(customers.new)}</p>
              <p className="text-xs text-gray-500 mt-1">New customers</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Vendors</p>
              <p className="text-2xl font-bold text-purple-600">{formatNumber(vendors.total)}</p>
              <p className="text-xs text-gray-500 mt-1">Market expansion</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Homes Electrified</p>
              <p className="text-2xl font-bold text-green-600">{formatNumber(esg.homesElectrified)}</p>
              <p className="text-xs text-gray-500 mt-1">Clean energy impact</p>
            </div>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard 
            title="TOTAL REVENUE" 
            value={revenue.current || 0} 
            previousValue={revenue.previous}
            icon={<DollarSign className="w-6 h-6 text-white" />} 
            tooltip="Total revenue from confirmed orders"
            isCurrency={true}
            change={revenue.growth}
          />
          <KPICard 
            title="TOTAL CUSTOMERS" 
            value={customers.total || 0} 
            icon={<Users className="w-6 h-6 text-white" />} 
            tooltip="Unique customers who have made purchases"
            isCurrency={false}
          />
          <KPICard 
            title="CUSTOMER RETENTION" 
            value={customers.retention || 0} 
            icon={<Heart className="w-6 h-6 text-white" />} 
            tooltip="Percentage of returning customers"
            suffix="%"
            isCurrency={false}
          />
          <KPICard 
            title="CAMPAIGN ROI" 
            value={campaign.roi || 0} 
            icon={<Target className="w-6 h-6 text-white" />} 
            tooltip="Return on marketing investment"
            suffix="%"
            isCurrency={false}
          />
        </div>

        {/* ESG Impact Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">ESG & Impact Intelligence</h3>
              <p className="text-sm text-gray-500">Environmental and social impact metrics</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <Home className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Homes Electrified</p>
              <p className="text-2xl font-bold text-green-600">{formatNumber(esg.homesElectrified)}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <Cloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">CO₂ Reduction</p>
              <p className="text-2xl font-bold text-blue-600">{formatNumber(esg.co2Reduction)} tons</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-xl text-center">
              <Fuel className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Diesel Offset</p>
              <p className="text-2xl font-bold text-yellow-600">{formatNumber(esg.dieselOffset)} L</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl text-center">
              <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Renewable Capacity</p>
              <p className="text-2xl font-bold text-purple-600">{formatNumber(esg.renewableCapacity)} kW</p>
            </div>
          </div>
        </div>

        {/* Traffic & Social Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Sources */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Traffic Intelligence</h3>
                <p className="text-sm text-gray-500">Website traffic sources</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Visits</span>
                <span className="text-xl font-bold">{formatNumber(traffic.websiteVisits)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unique Visitors</span>
                <span className="text-xl font-bold">{formatNumber(traffic.uniqueVisitors)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Bounce Rate</span>
                <span className="text-xl font-bold text-orange-600">{traffic.bounceRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Session Duration</span>
                <span className="text-xl font-bold">{Math.floor(traffic.avgSessionDuration / 60)}m {traffic.avgSessionDuration % 60}s</span>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-3">Traffic Sources</p>
                {traffic.sources?.map((source: any) => (
                  <div key={source.source} className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{source.source}</span>
                      <span>{source.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#1a2a8a] to-[#40b553]" style={{ width: `${source.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Media Analytics */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-red-600 flex items-center justify-center">
                <Instagram className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Social Analytics</h3>
                <p className="text-sm text-gray-500">Social media performance</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Facebook className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium">Facebook</p>
                    <p className="text-sm text-gray-500">{formatNumber(social.facebook?.followers)} followers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{social.facebook?.engagement}%</p>
                  <p className="text-xs text-gray-500">engagement</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Instagram className="w-8 h-8 text-pink-600" />
                  <div>
                    <p className="font-medium">Instagram</p>
                    <p className="text-sm text-gray-500">{formatNumber(social.instagram?.followers)} followers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{social.instagram?.engagement}%</p>
                  <p className="text-xs text-gray-500">engagement</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Megaphone className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-sm text-gray-500">{formatNumber(social.whatsapp?.subscribers)} subscribers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatNumber(social.whatsapp?.messages)}</p>
                  <p className="text-xs text-gray-500">messages</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Performance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
              <p className="text-sm text-gray-500">Marketing campaign analytics</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Spend</p>
              <p className="text-xl font-bold">{formatCurrency(campaign.totalSpend)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Leads Generated</p>
              <p className="text-xl font-bold">{formatNumber(campaign.leads)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Acquisitions</p>
              <p className="text-xl font-bold">{formatNumber(campaign.acquisitions)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Cost Per Acquisition</p>
              <p className="text-xl font-bold">{formatCurrency(campaign.totalSpend / (campaign.acquisitions || 1))}</p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Data Sources</p>
              <p className="text-xs text-blue-700 mt-1">
                <strong>Revenue & Customers:</strong> From your order database.<br />
                <strong>ESG Impact:</strong> Estimated based on solar product installations.<br />
                <strong>Traffic & Social:</strong> Connect Google Analytics and social media APIs for real data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
