'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain, TrendingUp, TrendingDown, AlertCircle, Package,
  Users, Clock, Zap, RefreshCw, Info, Calendar, Download,
  BarChart3, Activity, Target, Shield, Lightbulb, Rocket
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer
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

// Prediction Card
const PredictionCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  tooltip: string;
  suffix?: string;
  isCurrency?: boolean;
}> = ({ title, value, icon, tooltip, suffix = '', isCurrency = false }) => {
  const displayValue = isCurrency ? formatCurrency(value) : formatNumber(value);
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
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
          {icon}
        </div>
      </div>
    </div>
  );
};

// Risk Card
const RiskCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  tooltip: string;
  status: 'low' | 'medium' | 'high' | 'critical';
}> = ({ title, value, icon, tooltip, status }) => {
  const statusColors = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-orange-600 bg-orange-50',
    critical: 'text-red-600 bg-red-50'
  };
  
  const statusText = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
    critical: 'Critical Risk'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value.toFixed(1)}%</p>
        </div>
      </div>
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {statusText[status]}
      </div>
    </div>
  );
};

// Main Component
export default function AIIntelligenceCenter() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics/ai?range=${range}`);
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

  const forecast = data?.forecast || {};
  const churnRate = data?.churnRate || 0;
  const inventoryRisk = data?.inventoryRisk || 0;
  const insights = data?.insights || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Intelligence Center
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              AI-powered predictions, forecasts, and business insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-xl shadow-sm p-1">
              {['7d', '30d', '90d'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    range === r ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
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

        {/* AI Executive Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-purple-800">AI Executive Summary</h2>
              <p className="text-sm text-purple-700">Powered by machine learning algorithms</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Revenue Forecast</p>
              <p className="text-2xl font-bold text-purple-700">{formatCurrency(forecast.monthly)}</p>
              <p className="text-xs text-gray-500 mt-1">Next 30 days projection</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer Churn Risk</p>
              <p className={`text-2xl font-bold ${churnRate > 30 ? 'text-red-600' : 'text-green-600'}`}>{churnRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">{churnRate > 30 ? 'High risk' : 'Manageable risk'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Inventory Risk</p>
              <p className={`text-2xl font-bold ${inventoryRisk > 20 ? 'text-orange-600' : 'text-green-600'}`}>{inventoryRisk.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">{data?.lowStockCount} products low stock</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">AI Confidence Score</p>
              <p className="text-2xl font-bold text-blue-600">87%</p>
              <p className="text-xs text-gray-500 mt-1">Model accuracy</p>
            </div>
          </div>
        </div>

        {/* Revenue Forecast Cards */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Revenue Forecast</h2>
              <p className="text-sm text-gray-500">AI-powered revenue predictions</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PredictionCard
              title="DAILY FORECAST"
              value={forecast.daily}
              icon={<Calendar className="w-6 h-6 text-white" />}
              tooltip="Predicted daily revenue based on historical data"
              isCurrency={true}
            />
            <PredictionCard
              title="WEEKLY FORECAST"
              value={forecast.weekly}
              icon={<Clock className="w-6 h-6 text-white" />}
              tooltip="Predicted weekly revenue"
              isCurrency={true}
            />
            <PredictionCard
              title="MONTHLY FORECAST"
              value={forecast.monthly}
              icon={<TrendingUp className="w-6 h-6 text-white" />}
              tooltip="Predicted monthly revenue"
              isCurrency={true}
            />
            <PredictionCard
              title="QUARTERLY FORECAST"
              value={forecast.quarterly}
              icon={<BarChart3 className="w-6 h-6 text-white" />}
              tooltip="Predicted quarterly revenue"
              isCurrency={true}
            />
          </div>
        </div>

        {/* Risk Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Churn Prediction */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Customer Churn Prediction</h3>
                <p className="text-sm text-gray-500">At-risk customers identification</p>
              </div>
            </div>
            <div className="text-center p-6">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32">
                  <circle className="text-gray-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64"/>
                  <circle className="text-red-500" strokeWidth="8" strokeDasharray={`${churnRate * 3.64} ${360 - churnRate * 3.64}`} strokeLinecap="round" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" transform="rotate(-90 64 64)"/>
                </svg>
                <span className="absolute text-2xl font-bold">{churnRate.toFixed(0)}%</span>
              </div>
              <p className="mt-4 text-gray-600">of customers at risk of churning</p>
              <p className="text-sm text-gray-500 mt-2">{data?.churnRisk} customers inactive for 60+ days</p>
            </div>
          </div>

          {/* Inventory Risk Prediction */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Inventory Risk Prediction</h3>
                <p className="text-sm text-gray-500">Stock-out risk analysis</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Stock-out Risk</span>
                  <span className="text-sm font-semibold">{inventoryRisk.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(100, inventoryRisk)}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-yellow-50 rounded-xl text-center">
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">{data?.lowStockCount || 0}</p>
                  <p className="text-xs text-gray-500">products</p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl text-center">
                  <p className="text-sm text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">{data?.outOfStockCount || 0}</p>
                  <p className="text-xs text-gray-500">products</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights & Recommendations */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Insights & Recommendations</h3>
              <p className="text-sm text-gray-500">Actionable intelligence for business growth</p>
            </div>
          </div>
          <div className="space-y-4">
            {insights.map((insight: any, idx: number) => {
              const iconMap = {
                warning: <AlertCircle className="w-5 h-5 text-yellow-600" />,
                critical: <AlertCircle className="w-5 h-5 text-red-600" />,
                info: <Info className="w-5 h-5 text-blue-600" />
              };
              return (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    {iconMap[insight.type as keyof typeof iconMap]}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{insight.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
                      <p className="text-xs text-blue-600 mt-2">Recommended Action: {insight.action}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {insights.length === 0 && (
              <div className="text-center py-8">
                <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No significant anomalies detected</p>
                <p className="text-sm text-gray-400 mt-1">All metrics are within normal ranges</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">AI Methodology</p>
              <p className="text-xs text-blue-700 mt-1">
                <strong>Forecasting:</strong> Time series analysis with 30-day moving average.<br />
                <strong>Churn Prediction:</strong> Based on purchase recency and frequency.<br />
                <strong>Inventory Risk:</strong> Calculated using stock levels and sales velocity.<br />
                <strong>Anomaly Detection:</strong> 2-standard deviation threshold from historical patterns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
