'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/utils';
import { Package, ChevronDown, ChevronUp, X } from 'lucide-react';

interface OrderAccessory {
  id: number;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit: string;
  image?: string;
}

interface OrderAccessoriesSummaryProps {
  accessories: OrderAccessory[];
  className?: string;
  onRemove?: (id: number) => void;
  readonly?: boolean;
}

export default function OrderAccessoriesSummary({
  accessories,
  className = '',
  onRemove,
  readonly = true
}: OrderAccessoriesSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!accessories || accessories.length === 0) return null;

  const totalItems = accessories.reduce((sum, a) => sum + Number(a.quantity || 0), 0);
  const totalPrice = accessories.reduce((sum, a) => sum + Number(a.total_price || 0), 0);

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
      <div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 cursor-pointer hover:from-blue-100 hover:to-purple-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-[#1a2a8a] dark:text-green-400" />
          <div>
            <span className="font-medium text-gray-900 dark:text-white">
              Installation Accessories
            </span>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              ({totalItems} items)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-bold text-[#1a2a8a] dark:text-green-400">
            {formatCurrency(totalPrice)}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
          {accessories.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  × {item.quantity} {item.unit && `(${item.unit})`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(Number(item.total_price))}
                </p>
                {!readonly && onRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(item.id);
                    }}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Accessories Total
            </span>
            <span className="text-lg font-bold text-[#1a2a8a] dark:text-green-400">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}