'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/utils';
import { Package, ChevronDown, ChevronUp, X } from 'lucide-react';

interface AccessoryItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  unit?: string;
}

interface InstallationAccessoriesProps {
  accessories: AccessoryItem[];
  title?: string;
  onRemove?: (accessoryId: number) => void;
  readonly?: boolean;
  className?: string;
}

export default function InstallationAccessories({
  accessories,
  title = 'Installation Accessories',
  onRemove,
  readonly = false,
  className = ''
}: InstallationAccessoriesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!accessories || accessories.length === 0) return null;

  const totalItems = accessories.reduce((sum, a) => sum + a.quantity, 0);
  const totalPrice = accessories.reduce((sum, a) => sum + (a.price * a.quantity), 0);

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 cursor-pointer hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {title}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {totalItems} items • {accessories.length} types
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-[#1a2a8a] dark:text-green-400">
            {formatCurrency(totalPrice)}
          </p>
          <p className="text-xs text-gray-400 flex items-center justify-end gap-1">
            {isExpanded ? (
              <>Hide <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>Show <ChevronDown className="w-3 h-3" /></>
            )}
          </p>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
          {accessories.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              {/* Image */}
              <div className="w-12 h-12 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.quantity} × {formatCurrency(item.price)}
                  {item.unit && <span className="ml-1 text-gray-400">({item.unit})</span>}
                </p>
              </div>

              {/* Price & Actions */}
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(item.price * item.quantity)}
                </p>
                {!readonly && onRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(item.id);
                    }}
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Remove accessory"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Total */}
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