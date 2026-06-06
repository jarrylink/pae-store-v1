'use client';

import React, { useState } from 'react';
import { Maximize2, Download, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

interface ChartData {
  month: string;
  revenue: number;
  orders: number;
}

interface RevenueTrendChartProps {
  data: ChartData[];
  selectedYear?: number;
  onYearChange?: (year: number) => void;
  availableYears?: number[];
}

const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ data, selectedYear = 2026, onYearChange, availableYears = [] }) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
        <p className="text-gray-400">No revenue data available</p>
      </div>
    );
  }

  // Calculate max revenue - scale up to next billion if needed
  const maxRevenue = Math.max(...data.map(d => d.revenue), 200000000);
  let chartMax = 200000000; // Start at 200M minimum
  
  if (maxRevenue > 1000000000) {
    chartMax = Math.ceil(maxRevenue / 1000000000) * 1000000000;
  } else if (maxRevenue > 500000000) {
    chartMax = 1000000000;
  } else if (maxRevenue > 200000000) {
    chartMax = Math.ceil(maxRevenue / 100000000) * 100000000;
  }
  
  // Generate Y-axis labels: 200M, 400M, 600M, 800M, 1B, 1.2B, etc.
  const yAxisLabels = [];
  const step = chartMax >= 1000000000 ? 200000000 : 200000000;
  for (let i = step; i <= chartMax; i += step) {
    yAxisLabels.push(i);
  }
  // Add 0 at the beginning if not present
  if (yAxisLabels[0] !== 0) {
    yAxisLabels.unshift(0);
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const fullYearData = months.map(month => {
    const existing = data.find(d => d.month.includes(month));
    return existing || { month, revenue: 0, orders: 0 };
  });

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `₦${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(0)}M`;
    return `₦${amount.toLocaleString()}`;
  };

  const formatYAxisLabel = (amount: number) => {
    if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(0)}M`;
    return `${(amount / 1000).toFixed(0)}K`;
  };

  const chartHeight = 420;
  const barWidth = 70;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      {/* Chart Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-gray-900 text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#40b553]" />
            Revenue Performance
          </h3>
          <p className="text-gray-400 text-sm mt-1">12-month trend analysis · ₦ (Naira)</p>
        </div>
        <div className="flex gap-3 items-center">
          {/* Year Selector */}
          <div className="relative">
            <button
              onClick={() => setShowYearDropdown(!showYearDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {selectedYear}
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {showYearDropdown && (
              <div className="absolute right-0 mt-2 w-28 bg-white rounded-lg shadow-lg border border-gray-100 z-20 max-h-64 overflow-y-auto">
                {availableYears.map(year => (
                  <button
                    key={year}
                    onClick={() => {
                      onYearChange?.(year);
                      setShowYearDropdown(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedYear === year ? 'text-[#1a2a8a] font-medium bg-gray-50' : 'text-gray-600'}`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <Download className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <Maximize2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative">
        <div className="flex">
          {/* Y-Axis Labels */}
          <div className="w-16 flex flex-col justify-between pr-4" style={{ height: chartHeight }}>
            {yAxisLabels.map((label, i) => (
              <div key={i} className="text-right -mt-2">
                <span className="text-xs font-mono text-gray-400">{formatYAxisLabel(label)}</span>
              </div>
            ))}
          </div>

          {/* Chart Grid and Bars */}
          <div className="flex-1 relative" style={{ height: chartHeight }}>
            {/* Horizontal Grid Lines */}
            {yAxisLabels.map((label, i) => (
              <div
                key={i}
                className="absolute w-full border-t border-gray-100"
                style={{ bottom: `${(i / (yAxisLabels.length - 1)) * 100}%` }}
              />
            ))}

            {/* Bars */}
            <div className="absolute inset-0 flex items-end justify-between px-2">
              {fullYearData.map((item, index) => {
                const barHeight = item.revenue > 0 ? (item.revenue / chartMax) * chartHeight : 4;
                const isPositive = index > 0 && item.revenue > (fullYearData[index - 1]?.revenue || 0);
                
                return (
                  <div
                    key={index}
                    className="relative flex flex-col items-center group"
                    style={{ width: barWidth }}
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Bar */}
                    <div
                      className="relative w-10 rounded-t-lg transition-all duration-300 cursor-pointer"
                      style={{
                        height: barHeight,
                        background: `linear-gradient(180deg, 
                          ${isPositive ? '#40b553' : '#1a2a8a'} 0%, 
                          ${isPositive ? '#2d8a3d' : '#0f1a66'} 100%)`,
                        boxShadow: hoveredBar === index ? `0 4px 12px ${isPositive ? 'rgba(64, 181, 83, 0.3)' : 'rgba(26, 42, 138, 0.3)'}` : 'none',
                        opacity: item.revenue > 0 ? 0.9 : 0.3,
                      }}
                    >
                      {/* Glass reflection */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/5 to-white/10 rounded-t-lg" />
                      
                      {/* Hover Tooltip */}
                      {hoveredBar === index && item.revenue > 0 && (
                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 shadow-xl rounded-lg px-3 py-2 whitespace-nowrap z-20">
                          <p className="text-white text-sm font-semibold">{formatCurrency(item.revenue)}</p>
                          <p className="text-gray-400 text-xs">{item.orders} orders</p>
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                        </div>
                      )}
                    </div>
                    
                    {/* X-Axis Label */}
                    <span className="mt-3 text-xs font-medium text-gray-500">{item.month}</span>
                    
                    {/* Value indicator for positive bars */}
                    {item.revenue > 0 && (
                      <span className="mt-1 text-[10px] font-mono text-gray-400">
                        {formatCurrency(item.revenue)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#40b553]" />
            <span className="text-xs text-gray-500">Positive Growth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1a2a8a]" />
            <span className="text-xs text-gray-500">Revenue Bar</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-px bg-gray-300" />
            <span className="text-xs text-gray-500">Grid line (200M increments)</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Peak Revenue</p>
          <p className="text-base font-semibold text-gray-900 mt-1">{formatCurrency(Math.max(...data.map(d => d.revenue)))}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{data.find(d => d.revenue === Math.max(...data.map(d => d.revenue)))?.month}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Average Monthly</p>
          <p className="text-base font-semibold text-gray-900 mt-1">{formatCurrency(data.reduce((a, b) => a + b.revenue, 0) / data.length)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">per month</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Total Orders</p>
          <p className="text-base font-semibold text-gray-900 mt-1">{data.reduce((a, b) => a + b.orders, 0).toLocaleString()}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">last 12 months</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Annual Growth</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            {data[data.length - 1]?.revenue > data[0]?.revenue ? (
              <TrendingUp className="w-3.5 h-3.5 text-[#40b553]" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            )}
            <p className={`text-base font-semibold ${data[data.length - 1]?.revenue > data[0]?.revenue ? 'text-[#40b553]' : 'text-rose-500'}`}>
              {((data[data.length - 1]?.revenue - data[0]?.revenue) / data[0]?.revenue * 100).toFixed(1)}%
            </p>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">year over year</p>
        </div>
      </div>
    </div>
  );
};

export default RevenueTrendChart;
