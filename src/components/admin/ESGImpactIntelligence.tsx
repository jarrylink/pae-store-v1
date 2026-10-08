'use client';

import React, { useState, useEffect } from 'react';
import {
  Leaf, TrendingUp, Battery, Home, Cloud, Fuel, TreePine,
  Car, Zap, RefreshCw, Info, Calendar, Download, Award,
  BarChart3, Activity, Globe, Heart, Droplet, Sun, Users
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

// Impact Card Component
const ImpactCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  tooltip: string;
  suffix?: string;
  color?: string;
  description?: string;
}> = ({ title, value, icon, tooltip, suffix = '', color = 'green', description }) => {
  const colors = {
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-cyan-600',
    yellow: 'from-yellow-500 to-orange-600',
    purple: 'from-purple-500 to-pink-600'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">{title}</span>
            <Tooltip text={tooltip}>
              <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
            {formatNumber(value)}{suffix}
          </p>
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colors[color as keyof typeof colors]} flex items-center justify-center shadow-md`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function ESGImpactIntelligence() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState('year');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics/esg?range=${range}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              ESG & Impact Intelligence
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Environmental, Social, and Governance impact measurement
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-xl shadow-sm p-1">
              {['quarter', 'year', 'all'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    range === r ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {r === 'quarter' ? 'QUARTER' : r === 'year' ? 'YEAR' : 'ALL TIME'}
                </button>
              ))}
            </div>
            <button onClick={fetchData} className="p-2.5 bg-white rounded-xl shadow-sm">
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-green-800">Sustainability Impact Report</h2>
              <p className="text-sm text-green-700">Powering Africa's clean energy future</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Clean Energy Installations</p>
              <p className="text-3xl font-bold text-green-700">{formatNumber(metrics.installations)}</p>
              <p className="text-xs text-gray-500 mt-1">Solar systems deployed</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Renewable Capacity</p>
              <p className="text-3xl font-bold text-blue-700">{formatNumber(metrics.totalRenewableCapacity)} kW</p>
              <p className="text-xs text-gray-500 mt-1">Clean energy generated</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CO₂ Reduction</p>
              <p className="text-3xl font-bold text-teal-700">{formatNumber(metrics.totalCO2Reduction)} tons</p>
              <p className="text-xs text-gray-500 mt-1">Annual carbon offset</p>
            </div>
          </div>
        </div>

        {/* Environmental Impact Metrics */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Environmental Impact</h2>
              <p className="text-sm text-gray-500">Key sustainability metrics</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ImpactCard
              title="CO₂ Reduction"
              value={metrics.totalCO2Reduction}
              icon={<Cloud className="w-6 h-6 text-white" />}
              tooltip="Annual carbon dioxide emissions avoided"
              suffix=" tons"
              color="green"
              description={`Equivalent to planting ${formatNumber(Math.round(metrics.totalCO2Reduction * 45))} trees`}
            />
            <ImpactCard
              title="Diesel Offset"
              value={metrics.totalDieselOffset}
              icon={<Fuel className="w-6 h-6 text-white" />}
              tooltip="Diesel fuel saved through solar adoption"
              suffix=" L"
              color="yellow"
              description={`Enough to power ${formatNumber(Math.round(metrics.totalDieselOffset / 500))} generators for a year`}
            />
            <ImpactCard
              title="Renewable Capacity"
              value={metrics.totalRenewableCapacity}
              icon={<Zap className="w-6 h-6 text-white" />}
              tooltip="Total clean energy capacity installed"
              suffix=" kW"
              color="blue"
              description={`Powers ${formatNumber(Math.round(metrics.totalRenewableCapacity / 2))} average homes`}
            />
            <ImpactCard
              title="Trees Equivalent"
              value={metrics.treesEquivalent}
              icon={<TreePine className="w-6 h-6 text-white" />}
              tooltip="Equivalent number of trees planted for carbon offset"
              suffix=" trees"
              color="green"
              description="Carbon sequestration equivalent"
            />
          </div>
        </div>

        {/* Social Impact & SDG Contribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Social Impact & SDG Contribution</h3>
              <p className="text-sm text-gray-500">Contributing to UN Sustainable Development Goals</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <Home className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Homes Electrified</p>
              <p className="text-2xl font-bold">{formatNumber(metrics.installations)}</p>
              <p className="text-xs text-gray-500 mt-1">SDG 7: Affordable & Clean Energy</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <Leaf className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">CO₂ Reduction</p>
              <p className="text-2xl font-bold">{formatNumber(metrics.totalCO2Reduction)} tons</p>
              <p className="text-xs text-gray-500 mt-1">SDG 13: Climate Action</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-xl text-center">
              <Battery className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Clean Energy Capacity</p>
              <p className="text-2xl font-bold">{formatNumber(metrics.totalRenewableCapacity)} kW</p>
              <p className="text-xs text-gray-500 mt-1">SDG 9: Industry & Innovation</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl text-center">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Jobs Created</p>
              <p className="text-2xl font-bold">{formatNumber(Math.round(metrics.installations * 0.5))}</p>
              <p className="text-xs text-gray-500 mt-1">SDG 8: Decent Work & Growth</p>
            </div>
          </div>
        </div>

        {/* Impact Equivalents */}
        <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-2xl p-6 border border-teal-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-teal-800">Your Impact in Perspective</h3>
              <p className="text-sm text-teal-700">Making a difference across Africa</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
              <Car className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Equivalent to removing</p>
                <p className="text-xl font-bold">{formatNumber(metrics.carsOffRoad)} cars</p>
                <p className="text-xs text-gray-400">from the road for one year</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
              <TreePine className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Equivalent to planting</p>
                <p className="text-xl font-bold">{formatNumber(metrics.treesEquivalent)} trees</p>
                <p className="text-xs text-gray-400">and letting them grow for 10 years</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">ESG Data Methodology</p>
              <p className="text-xs text-blue-700 mt-1">
                <strong>Environmental Impact:</strong> Calculated based on solar/renewable product installations.<br />
                <strong>CO₂ Reduction:</strong> 2.5 tons saved per solar installation annually.<br />
                <strong>Diesel Offset:</strong> 600 liters saved per solar installation annually.<br />
                <strong>SDG Alignment:</strong> Metrics aligned with UN Sustainable Development Goals reporting standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
