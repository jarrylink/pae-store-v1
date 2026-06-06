'use client';
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Wallet, AlertCircle, 
  ArrowUp, ArrowDown, RefreshCw, BarChart3, Info, Sparkles,
  Building2, Users, Calendar, Download, Filter, Shield, Zap,
  Package, Award, CreditCard, Activity
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
const KPIcard: React.FC<{
  title: string;
  value: string;
  previousValue?: string;
  icon: React.ReactNode;
  change?: number;
  tooltip: string;
  color?: string;
}> = ({ title, value, previousValue, icon, change, tooltip, color = 'blue' }) => {
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
export default function FinancialIntelligence() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState('30d');
  useEffect(() => {
    fetchData();
  }, [range]);
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics/financial?range=${range}`);
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
  const brandProfitability = data?.brandProfitability || [];
  const vendorProfitability = data?.vendorProfitability || [];
  const forecast = data?.forecast || {};
  const risks = data?.risks || [];
  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1a2a8a] to-[#40b553] bg-clip-text text-transparent">
            Financial Intelligence
          </h1>
          <p className="text-sm text-gray-500 mt-1">Complete financial analytics and profitability insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['7d', '30d', '90d', 'ytd'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  range === r ? 'bg-[#1a2a8a] text-white' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r === 'ytd' ? 'YTD' : r.toUpperCase()}
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
      {/* AI Financial Summary */}
      <div className="bg-gradient-to-r from-[#1a2a8a]/5 to-[#40b553]/5 rounded-xl p-5 border border-[#1a2a8a]/10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#1a2a8a]" />
          <h2 className="text-sm font-semibold text-[#1a2a8a] uppercase">AI Financial Intelligence</h2>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          Total revenue of {formatCurrency(metrics.revenue?.current)} with a net margin of {metrics.profitability?.netMargin?.toFixed(1)}%. 
          Cash flow is {metrics.cashFlow?.net >= 0 ? 'positive' : 'negative'} at {formatCurrency(Math.abs(metrics.cashFlow?.net))}.
          {metrics.revenue?.growth > 0 ? ` Revenue grew by ${metrics.revenue.growth.toFixed(0)}%.` : ` Revenue declined by ${Math.abs(metrics.revenue.growth).toFixed(0)}%. Review strategy.`}
        </p>
      </div>
      {/* Revenue Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-[#1a2a8a]" />
          <h2 className="text-lg font-semibold">Revenue</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <KPIcard
            title="Total Revenue"
            value={formatCurrency(metrics.revenue?.current)}
            previousValue={formatCurrency(metrics.revenue?.previous)}
            icon={<DollarSign className="w-5 h-5" />}
            change={metrics.revenue?.growth}
            tooltip="Total revenue from all completed orders in the selected period"
          />
          <KPIcard
            title="Total Orders"
            value={metrics.revenue?.orders?.toLocaleString() || '0'}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
            tooltip="Number of completed orders"
          />
          <KPIcard
            title="Average Order Value"
            value={formatCurrency(metrics.revenue?.current / (metrics.revenue?.orders || 1))}
            icon={<TrendingUp className="w-5 h-5" />}
            tooltip="Total Revenue ÷ Total Orders"
          />
        </div>
      </div>
      {/* Profitability Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[#40b553]" />
          <h2 className="text-lg font-semibold">Profitability</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPIcard
            title="Gross Profit"
            value={formatCurrency(metrics.profitability?.grossProfit)}
            icon={<DollarSign className="w-5 h-5" />}
            tooltip="Revenue - Cost of Goods Sold (COGS)"
          />
          <KPIcard
            title="Gross Margin"
            value={`${metrics.profitability?.grossMargin?.toFixed(1) || 0}%`}
            icon={<BarChart3 className="w-5 h-5" />}
            tooltip="(Gross Profit ÷ Revenue) × 100"
          />
          <KPIcard
            title="Net Profit"
            value={formatCurrency(metrics.profitability?.netProfit)}
            icon={<Award className="w-5 h-5" />}
            tooltip="Gross Profit - Operating Expenses"
          />
          <KPIcard
            title="Net Margin"
            value={`${metrics.profitability?.netMargin?.toFixed(1) || 0}%`}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            tooltip="(Net Profit ÷ Revenue) × 100"
          />
        </div>
      </div>
      {/* Expenses Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Expenses</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPIcard
            title="COGS"
            value={formatCurrency(metrics.expenses?.cogs)}
            icon={<Package className="w-5 h-5" />}
            tooltip="Cost of Goods Sold - estimated at 60% of revenue"
          />
          <KPIcard
            title="Operating"
            value={formatCurrency(metrics.expenses?.operating)}
            icon={<Building2 className="w-5 h-5" />}
            tooltip="Operating expenses - estimated at 15% of revenue"
          />
          <KPIcard
            title="Marketing"
            value={formatCurrency(metrics.expenses?.marketing)}
            icon={<TrendingUp className="w-5 h-5" />}
            tooltip="Marketing expenses - estimated at 5% of revenue"
          />
          <KPIcard
            title="Total Expenses"
            value={formatCurrency(metrics.expenses?.total)}
            icon={<CreditCard className="w-5 h-5" />}
            tooltip="Sum of all expenses"
          />
        </div>
      </div>
      {/* Cash Flow Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-cyan-500" />
          <h2 className="text-lg font-semibold">Cash Flow</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPIcard
            title="Cash Inflow"
            value={formatCurrency(metrics.cashFlow?.inflow)}
            icon={<ArrowUp className="w-5 h-5 text-green-500" />}
            tooltip="Total revenue received"
          />
          <KPIcard
            title="Cash Outflow"
            value={formatCurrency(metrics.cashFlow?.outflow)}
            icon={<ArrowDown className="w-5 h-5 text-red-500" />}
            tooltip="Total expenses paid"
          />
          <KPIcard
            title="Net Cash Flow"
            value={formatCurrency(metrics.cashFlow?.net)}
            icon={<Activity className="w-5 h-5" />}
            tooltip="Inflow - Outflow"
          />
          <KPIcard
            title="Cash Reserves"
            value={formatCurrency(metrics.cashFlow?.reserves)}
            icon={<Shield className="w-5 h-5" />}
            tooltip="Cash from delivered orders (last 90 days)"
          />
        </div>
      </div>
      {/* Two Column Layout - Brand & Vendor Profitability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Profitability */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Award className="w-5 h-5 text-purple-500" />
            <h3 className="text-base font-semibold">Brand Profitability</h3>
            <Tooltip text="Profitability by brand based on inventory value">
              <Info className="w-3.5 h-3.5 text-gray-400" />
            </Tooltip>
          </div>
          
          {brandProfitability.length > 0 ? (
            <div className="space-y-4">
              {brandProfitability.map((brand: { name: string; productCount: number; inventoryValue: number }, idx: number) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{brand.name}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(brand.inventoryValue)}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#1a2a8a] to-[#40b553]" 
                      style={{ width: `${Math.min(100, (brand.inventoryValue / (brandProfitability[0]?.inventoryValue || 1)) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{brand.productCount} products</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No brand data available</p>
          )}
        </div>
        {/* Vendor Profitability */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-semibold">Vendor Profitability</h3>
            <Tooltip text="Vendor performance metrics">
              <Info className="w-3.5 h-3.5 text-gray-400" />
            </Tooltip>
          </div>
          
          {vendorProfitability.length > 0 ? (
            <div className="space-y-4">
              {vendorProfitability.map((vendor: { name: string; orders: number; revenue: number; rating: number }, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{vendor.name}</p>
                    <p className="text-xs text-gray-500">{vendor.orders} orders • ⭐ {vendor.rating}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(vendor.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No vendor data available</p>
          )}
        </div>
      </div>
      {/* Financial Forecasts */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-semibold">Financial Forecasts</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <KPIcard
            title="Next 30 Days"
            value={formatCurrency(forecast.next30)}
            icon={<Calendar className="w-5 h-5" />}
            tooltip="Projected revenue for next 30 days based on 3-month average"
          />
          <KPIcard
            title="Next 90 Days"
            value={formatCurrency(forecast.next90)}
            icon={<Calendar className="w-5 h-5" />}
            tooltip="Projected revenue for next 90 days"
          />
          <KPIcard
            title="Next 365 Days"
            value={formatCurrency(forecast.next365)}
            icon={<Calendar className="w-5 h-5" />}
            tooltip="Annual revenue projection"
          />
        </div>
      </div>
      {/* Financial Risk Center */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-5 h-5 text-red-500" />
          <h3 className="text-base font-semibold">Financial Risk Center</h3>
          <Tooltip text="Identified financial risks and recommended actions">
            <Info className="w-3.5 h-3.5 text-gray-400" />
          </Tooltip>
        </div>
        
        {risks.length > 0 ? (
          <div className="space-y-3">
            {risks.map((risk: { type: string; title: string; description: string; action: string }, idx: number) => (
              <div key={idx} className={`p-4 rounded-lg border ${
                risk.type === 'HIGH' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
                risk.type === 'MEDIUM' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
                'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className={`w-4 h-4 ${
                        risk.type === 'HIGH' ? 'text-red-500' :
                        risk.type === 'MEDIUM' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                      <h4 className={`font-semibold text-sm ${
                        risk.type === 'HIGH' ? 'text-red-700 dark:text-red-400' :
                        risk.type === 'MEDIUM' ? 'text-yellow-700 dark:text-yellow-400' :
                        'text-blue-700 dark:text-blue-400'
                      }`}>{risk.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        risk.type === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        risk.type === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>{risk.type} RISK</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{risk.description}</p>
                    <button className="text-xs text-[#1a2a8a] dark:text-[#40b553] mt-2 hover:underline">
                      {risk.action} →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-500">No significant financial risks detected</p>
            <p className="text-xs text-gray-400 mt-1">Your financial health looks stable</p>
          </div>
        )}
      </div>
    </div>
  );
}



