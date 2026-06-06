'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, Truck, Warehouse, TrendingUp, TrendingDown, AlertCircle,
  ArrowUp, ArrowDown, RefreshCw, BarChart3, Info, Sparkles,
  Building2, Calendar, Download, Filter, Shield, Activity, Clock,
  DollarSign, ShoppingBag, Users, Award, Target, Zap
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
  icon: React.ReactNode;
  change?: number;
  tooltip: string;
  color?: string;
}> = ({ title, value, icon, change, tooltip, color = 'blue' }) => {
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
          {change !== undefined && change !== 0 && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              <span>{Math.abs(change).toFixed(1)}%</span>
              <span className="text-gray-400 ml-1">vs last period</span>
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

export default function OperationsSupplyChain() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics/operations?range=${range}`);
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

  const inventory = data?.inventory || {};
  const valuation = data?.valuation || {};
  const demandForecast = data?.demandForecast || {};
  const stockForecast = data?.stockForecast || [];
  const deadStock = data?.deadStock || {};
  const suppliers = data?.suppliers || [];
  const warehousing = data?.warehousing || {};
  const logistics = data?.logistics || {};

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1a2a8a] to-[#40b553] bg-clip-text text-transparent">
            Operations & Supply Chain
          </h1>
          <p className="text-sm text-gray-500 mt-1">Inventory, logistics, and supply chain analytics</p>
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
          <button className="p-2 hover:bg-gray-100 rounded-lg"><Filter className="w-4 h-4 text-gray-500" /></button>
          <button className="p-2 hover:bg-gray-100 rounded-lg"><Download className="w-4 h-4 text-gray-500" /></button>
          <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-lg"><RefreshCw className="w-4 h-4 text-gray-500" /></button>
        </div>
      </div>

      {/* AI Operations Summary */}
      <div className="bg-gradient-to-r from-[#1a2a8a]/5 to-[#40b553]/5 rounded-xl p-5 border border-[#1a2a8a]/10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#1a2a8a]" />
          <h2 className="text-sm font-semibold text-[#1a2a8a] uppercase">AI Operations Intelligence</h2>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          Total inventory value of {formatCurrency(inventory.totalValue)} across {inventory.totalProducts} products.
          {inventory.lowStockCount > 0 && ` ${inventory.lowStockCount} items are running low on stock.`}
          Fulfillment rate at {logistics.fulfillmentRate?.toFixed(0)}% with {logistics.pendingOrders} pending orders.
        </p>
      </div>

      {/* Inventory KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="TOTAL INVENTORY"
          value={inventory.totalProducts?.toLocaleString() || '0'}
          icon={<Package className="w-5 h-5" />}
          tooltip="Total number of products in catalog"
        />
        <KPICard
          title="INVENTORY VALUE"
          value={formatCurrency(inventory.totalValue)}
          icon={<DollarSign className="w-5 h-5" />}
          tooltip="Total retail value of all inventory"
        />
        <KPICard
          title="LOW STOCK"
          value={inventory.lowStockCount?.toLocaleString() || '0'}
          icon={<AlertCircle className="w-5 h-5 text-orange-500" />}
          tooltip="Products with inventory ≤ 5 units"
        />
        <KPICard
          title="OUT OF STOCK"
          value={inventory.outOfStockCount?.toLocaleString() || '0'}
          icon={<AlertCircle className="w-5 h-5 text-red-500" />}
          tooltip="Products with zero inventory"
        />
      </div>

      {/* Inventory Valuation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-semibold">Retail Value</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(valuation.totalRetailValue)}</p>
          <p className="text-xs text-gray-500 mt-1">At current selling prices</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-purple-500" />
            <h3 className="text-base font-semibold">Cost Value</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(valuation.totalCostValue)}</p>
          <p className="text-xs text-gray-500 mt-1">At purchase prices</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-base font-semibold">Potential Profit</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(valuation.potentialProfit)}</p>
          <p className="text-xs text-gray-500 mt-1">Margin: {valuation.avgMargin?.toFixed(1)}%</p>
        </div>
      </div>

      {/* Low Stock Items Alert */}
      {inventory.lowStockItems?.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-5 border border-orange-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-orange-700">Low Stock Alert</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {inventory.lowStockItems.slice(0, 6).map((item: { title: string; stock: number }, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                <span className="text-sm text-gray-700">{item.title}</span>
                <span className="text-sm font-bold text-orange-600">{item.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Forecasting */}
      {stockForecast.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-5 h-5 text-[#1a2a8a]" />
            <h2 className="text-lg font-semibold">Stock Forecast</h2>
            <Tooltip text="Projected days until out of stock for low inventory items">
              <Info className="w-3.5 h-3.5 text-gray-400" />
            </Tooltip>
          </div>
          <div className="space-y-3">
            {stockForecast.slice(0, 5).map((item: { title: string; daysUntilOut: number; riskLevel: string }, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.title}</span>
                  <span className={`font-semibold ${
                    item.riskLevel === 'CRITICAL' ? 'text-red-600' : 
                    item.riskLevel === 'HIGH' ? 'text-orange-600' : 'text-yellow-600'
                  }`}>
                    {item.daysUntilOut} days left
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      item.riskLevel === 'CRITICAL' ? 'bg-red-500' : 
                      item.riskLevel === 'HIGH' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(100, (item.daysUntilOut / 90) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demand Forecasting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-[#1a2a8a]" />
            <h2 className="text-lg font-semibold">Demand Forecasting</h2>
            <Tooltip text="Projected orders and revenue for next 3 months">
              <Info className="w-3.5 h-3.5 text-gray-400" />
            </Tooltip>
          </div>
          <div className="space-y-4">
            {demandForecast.forecast?.map((item: { month: string; projectedOrders: number; projectedRevenue: number }, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.month}</span>
                  <span className="font-semibold text-gray-900">{item.projectedOrders} orders</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#1a2a8a] to-[#40b553]" style={{ width: `${(item.projectedOrders / (demandForecast.forecast?.[2]?.projectedOrders || 1)) * 100}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{formatCurrency(item.projectedRevenue)} projected revenue</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dead Stock Detection */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold">Dead Stock Detection</h2>
            <Tooltip text="Products with low turnover or no recent sales">
              <Info className="w-3.5 h-3.5 text-gray-400" />
            </Tooltip>
          </div>
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-red-600">{formatCurrency(deadStock.estimatedValue)}</p>
            <p className="text-xs text-gray-500">Estimated dead stock value</p>
            <p className="text-sm text-gray-600 mt-2">{deadStock.candidateCount} products at risk</p>
          </div>
          {deadStock.items?.slice(0, 3).map((item: { title: string; value: number }, idx: number) => (
            <div key={idx} className="flex justify-between items-center p-2 border-t border-gray-100">
              <span className="text-sm text-gray-700">{item.title}</span>
              <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warehousing & Logistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Warehouse className="w-5 h-5 text-[#1a2a8a]" />
            <h2 className="text-lg font-semibold">Warehousing</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-500">Total SKU</p><p className="text-xl font-bold">{warehousing.totalSKU}</p></div>
            <div><p className="text-xs text-gray-500">Total Units</p><p className="text-xl font-bold">{warehousing.totalUnits?.toLocaleString()}</p></div>
            <div><p className="text-xs text-gray-500">Space Utilization</p><p className="text-xl font-bold">{warehousing.spaceUtilization?.toFixed(0)}%</p></div>
            <div><p className="text-xs text-gray-500">Turnover Rate</p><p className="text-xl font-bold">{warehousing.turnoverRate?.toFixed(1)}x</p></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Truck className="w-5 h-5 text-[#40b553]" />
            <h2 className="text-lg font-semibold">Logistics</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-500">Fulfillment Rate</p><p className="text-xl font-bold text-green-600">{logistics.fulfillmentRate?.toFixed(0)}%</p></div>
            <div><p className="text-xs text-gray-500">Pending Orders</p><p className="text-xl font-bold text-yellow-600">{logistics.pendingOrders}</p></div>
            <div><p className="text-xs text-gray-500">In Transit</p><p className="text-xl font-bold text-blue-600">{logistics.inTransit}</p></div>
            <div><p className="text-xs text-gray-500">Completed</p><p className="text-xl font-bold text-green-600">{logistics.completed}</p></div>
          </div>
        </div>
      </div>

      {/* Suppliers */}
      {suppliers.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="w-5 h-5 text-[#1a2a8a]" />
            <h2 className="text-lg font-semibold">Suppliers</h2>
            <Tooltip text="Vendor performance metrics">
              <Info className="w-3.5 h-3.5 text-gray-400" />
            </Tooltip>
          </div>
          <div className="space-y-3">
            {suppliers.slice(0, 5).map((supplier: { name: string; total_orders: number; total_revenue: number; rating: number; is_active: boolean }, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{supplier.name}</p>
                  <p className="text-xs text-gray-500">{supplier.total_orders} orders • ⭐ {supplier.rating}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(supplier.total_revenue)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${supplier.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {supplier.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}




