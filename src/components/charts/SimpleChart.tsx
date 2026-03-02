'use client';

import React from 'react';

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface SimpleChartProps {
  data: ChartData[];
  type?: 'bar' | 'line' | 'area';
  title?: string;
  height?: number;
  dataKey?: string;
}

export const SimpleChart: React.FC<SimpleChartProps> = ({
  data,
  type = 'bar',
  title,
  height = 300,
  dataKey = 'value'
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No chart data available</p>
      </div>
    );
  }

  // Simple CSS-based chart since we don't have recharts installed
  const maxValue = Math.max(...data.map(d => d[dataKey] || d.value || 0));
  
  const renderBarChart = () => (
    <div className="flex items-end justify-between h-full pt-8">
      {data.map((item, index) => {
        const value = item[dataKey] || item.value || 0;
        const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
        
        return (
          <div key={index} className="flex flex-col items-center flex-1 mx-1">
            <div 
              className="w-full bg-gradient-to-t from-[#1a2a8a] to-blue-400 rounded-t-lg transition-all duration-500 hover:opacity-90"
              style={{ height: `${heightPercent}%` }}
            />
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 truncate w-full text-center">
              {item.name}
            </div>
            <div className="text-xs font-medium text-gray-900 dark:text-white mt-1">
              {value.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderLineChart = () => (
    <div className="relative h-full pt-8 pb-4">
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between">
        {[0, 25, 50, 75, 100].map((percent) => (
          <div 
            key={percent}
            className="border-t border-gray-200 dark:border-gray-700"
            style={{ top: `${percent}%` }}
          />
        ))}
      </div>
      
      {/* Line */}
      <svg className="absolute inset-0 w-full h-full" style={{ padding: '32px 0 16px 0' }}>
        <polyline
          fill="none"
          stroke="#1a2a8a"
          strokeWidth="3"
          points={data.map((item, index) => {
            const value = item[dataKey] || item.value || 0;
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((value / maxValue) * 100);
            return `${x}%,${y}%`;
          }).join(' ')}
        />
        
        {/* Points */}
        {data.map((item, index) => {
          const value = item[dataKey] || item.value || 0;
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((value / maxValue) * 100);
          
          return (
            <g key={index}>
              <circle
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill="#1a2a8a"
                className="hover:r-6 transition-all duration-200"
              />
              <circle
                cx={`${x}%`}
                cy={`${y}%`}
                r="8"
                fill="#1a2a8a"
                fillOpacity="0.2"
                className="animate-pulse"
              />
            </g>
          );
        })}
      </svg>
      
      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between">
        {data.map((item, index) => (
          <div key={index} className="text-xs text-gray-600 dark:text-gray-400 text-center">
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAreaChart = () => (
    <div className="relative h-full pt-8 pb-4">
      <svg className="absolute inset-0 w-full h-full" style={{ padding: '32px 0 16px 0' }}>
        {/* Area fill */}
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a2a8a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1a2a8a" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <polygon
          fill="url(#areaGradient)"
          points={`
            0%,100 
            ${data.map((item, index) => {
              const value = item[dataKey] || item.value || 0;
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((value / maxValue) * 100);
              return `${x}%,${y}%`;
            }).join(' ')}
            100%,100
          `}
        />
        
        {/* Line */}
        <polyline
          fill="none"
          stroke="#1a2a8a"
          strokeWidth="3"
          points={data.map((item, index) => {
            const value = item[dataKey] || item.value || 0;
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((value / maxValue) * 100);
            return `${x}%,${y}%`;
          }).join(' ')}
        />
      </svg>
      
      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between">
        {data.map((item, index) => (
          <div key={index} className="text-xs text-gray-600 dark:text-gray-400 text-center">
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );

  const renderChart = () => {
    switch (type) {
      case 'line': return renderLineChart();
      case 'area': return renderAreaChart();
      default: return renderBarChart();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <div style={{ height: `${height}px`, width: '100%' }}>
        {renderChart()}
      </div>
    </div>
  );
};

// Mock data generators for demonstration
export const generateMonthlyData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(month => ({
    name: month,
    revenue: Math.floor(Math.random() * 100000) + 50000,
    orders: Math.floor(Math.random() * 100) + 20,
    customers: Math.floor(Math.random() * 50) + 10,
  }));
};

export const generateWeeklyData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    name: day,
    value: Math.floor(Math.random() * 50000) + 10000,
  }));
};

export const generateProductPerformance = () => {
  const products = ['Solar Kits', 'Inverters', 'Batteries', 'Panels', 'Accessories'];
  return products.map(product => ({
    name: product,
    sales: Math.floor(Math.random() * 100) + 20,
    revenue: Math.floor(Math.random() * 500000) + 100000,
  }));
};
