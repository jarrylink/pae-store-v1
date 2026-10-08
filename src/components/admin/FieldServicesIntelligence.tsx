'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck, Users, CheckCircle, Clock, TrendingUp, RefreshCw,
  Star, Award, MapPin, AlertCircle, Info, Phone, Mail, Calendar,
  Wrench, Package, ClipboardList, DollarSign, Activity
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
  icon: React.ReactNode;
  tooltip: string;
}> = ({ title, value, icon, tooltip }) => {
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
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
            {title.includes('Revenue') ? formatCurrency(value) : formatNumber(value)}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#1a2a8a] to-[#40b553] flex items-center justify-center shadow-md">
          {icon}
        </div>
      </div>
    </div>
  );
};

// Installer Scorecard Component - 1 per row
const InstallerScorecard: React.FC<{ installer: any }> = ({ installer }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#1a2a8a] to-[#40b553] flex items-center justify-center">
            <span className="text-white font-bold text-2xl">{installer.name?.charAt(0) || '?'}</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{installer.name}</h3>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium">{installer.rating?.toFixed(1)}/5</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="text-xs">{installer.city}, {installer.state}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Phone className="w-3 h-3" />
                <span className="text-xs">{installer.phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="text-center min-w-[80px]">
            <p className="text-sm text-gray-500">Jobs</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(installer.completedJobs || 0)}</p>
          </div>
          <div className="text-center min-w-[80px]">
            <p className="text-sm text-gray-500">Efficiency</p>
            <p className="text-2xl font-bold text-green-600">{installer.efficiency || 92}%</p>
          </div>
          <div className="text-center min-w-[100px]">
            <p className="text-sm text-gray-500">Revenue</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(installer.revenue || 0)}</p>
          </div>
          <div className="text-center min-w-[80px]">
            <p className="text-sm text-gray-500">Rating</p>
            <p className="text-2xl font-bold text-yellow-600">{installer.rating?.toFixed(1)}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">Reliability</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div className="h-full rounded-full bg-green-500" style={{ width: `${installer.reliability || 88}%` }} />
              </div>
              <span className="text-sm font-semibold">{(installer.reliability || 88)}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500">Callback Rate</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(100, installer.callbackRate || 5)}%` }} />
              </div>
              <span className="text-sm font-semibold">{(installer.callbackRate || 5).toFixed(1)}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500">Avg Completion</p>
            <p className="text-lg font-semibold">{installer.avgCompletionDays || 4} days</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <p className={`text-lg font-semibold ${installer.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
              {installer.isAvailable ? 'Available' : 'Busy'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Service Card Component
const ServiceCard: React.FC<{ service: any }> = ({ service }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{service.description || 'Professional installation service'}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full capitalize">{service.category}</span>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{service.duration}</span>
              <span className="text-sm font-semibold text-green-600">{formatCurrency(service.price)}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Orders</p>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(service.orderCount || 0)}</p>
          <p className="text-xs text-green-600">{formatCurrency(service.revenue || 0)}</p>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function FieldServicesIntelligence() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics/field-services?range=${range}`);
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
  const topInstallers = data?.topInstallers || [];
  const services = data?.services || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1a2a8a] to-[#40b553] bg-clip-text text-transparent">
              Field Services & Installer Performance
            </h1>
            <p className="text-sm text-gray-500 mt-1">Installer operations, service analytics and performance tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-xl shadow-sm p-1">
              {['7d', '30d', '90d'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    range === r ? 'bg-[#1a2a8a] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={fetchData} className="p-2.5 bg-white rounded-xl shadow-sm">
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-gradient-to-r from-[#1a2a8a]/5 to-[#40b553]/5 rounded-2xl p-6 border border-[#1a2a8a]/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#1a2a8a] to-[#40b553] flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Field Operations Summary</h2>
              <p className="text-sm text-gray-500">Key installation metrics</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Active Installers</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.activeInstallers || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Jobs Completed</p>
              <p className="text-2xl font-bold text-green-600">{formatNumber(metrics.completedJobs || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Jobs In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{formatNumber(metrics.inProgressJobs || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Services Revenue</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.servicesRevenue || 0)}</p>
            </div>
          </div>
        </div>

        {/* KPI Cards - 4 per row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Active Installers" value={metrics.activeInstallers || 0} icon={<Users className="w-6 h-6 text-white" />} tooltip="Number of active installers in the field" />
          <KPICard title="Jobs Completed" value={metrics.completedJobs || 0} icon={<CheckCircle className="w-6 h-6 text-white" />} tooltip="Total jobs completed in period" />
          <KPICard title="Jobs In Progress" value={metrics.inProgressJobs || 0} icon={<Clock className="w-6 h-6 text-white" />} tooltip="Jobs currently being worked on" />
          <KPICard title="Services Revenue" value={metrics.servicesRevenue || 0} icon={<DollarSign className="w-6 h-6 text-white" />} tooltip="Revenue from installation services" />
        </div>

        {/* Services Section - Available Services */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Available Services</h2>
              <p className="text-sm text-gray-500">Service offerings and their performance</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service: any) => (
              <ServiceCard key={service.id} service={service} />
            ))}
            {services.length === 0 && (
              <div className="col-span-2 bg-white rounded-2xl p-12 text-center border">
                <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No services available</p>
                <p className="text-sm text-gray-400 mt-2">Add services to see their performance</p>
              </div>
            )}
          </div>
        </div>

        {/* Installer Scorecard & Leaderboard - 1 per row */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#1a2a8a] to-[#40b553] flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Installer Scorecard & Leaderboard</h2>
              <p className="text-sm text-gray-500">Top performing installers based on efficiency and reliability</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {topInstallers.map((installer: any) => (
              <InstallerScorecard key={installer.id} installer={installer} />
            ))}
            {topInstallers.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center border">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No installer data available</p>
                <p className="text-sm text-gray-400 mt-2">Add installers to see performance data</p>
              </div>
            )}
          </div>
        </div>

        {/* Warranty Intelligence */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Warranty Intelligence</h3>
              <p className="text-sm text-gray-500">Claims, callbacks and failure analysis</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">Warranty Claims</p>
              <p className="text-3xl font-bold text-red-600">{formatNumber(metrics.warrantyClaims || 0)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">Callback Rate</p>
              <p className="text-3xl font-bold text-orange-600">{(metrics.callbackRate || 0).toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">Failure Rate</p>
              <p className="text-3xl font-bold text-red-600">{(metrics.failureRate || 0).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Performance Metrics Explained</p>
              <p className="text-xs text-blue-700 mt-1">
                <strong>Efficiency Score:</strong> Based on completion time vs estimated time.<br />
                <strong>Reliability Score:</strong> Based on callback rate and warranty claims.<br />
                <strong>Customer Rating:</strong> Average of post-installation customer feedback.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
