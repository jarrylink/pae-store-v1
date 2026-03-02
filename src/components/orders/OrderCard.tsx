'use client';

import React, { useState } from 'react';
import { Order } from '@/types/auth';
import { formatCurrency } from '@/utils';

interface OrderCardProps {
  order: Order;
  isAdmin?: boolean;
  onStatusUpdate?: (orderId: number, status: Order['status']) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, isAdmin = false, onStatusUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      saved: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      pending_agent: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (!isAdmin || !onStatusUpdate) return;

    try {
      setUpdatingStatus(true);
      await onStatusUpdate(order.id, newStatus);
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusOptions: Array<{ value: Order['status']; label: string; color: string }> = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Order Header */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Order #{order.orderNumber}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(order.total)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Order Content */}
      <div className="p-4">
        {/* Admin Status Controls */}
        {isAdmin && onStatusUpdate && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Update Status:</p>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusUpdate(option.value)}
                  disabled={updatingStatus || order.status === option.value}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    order.status === option.value
                      ? `${option.color} cursor-default`
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Order Items Summary */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Items</h4>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-[#1a2a8a] dark:text-[#40b553] hover:underline"
            >
              {isExpanded ? 'Show Less' : 'Show Details'}
            </button>
          </div>

          {isExpanded ? (
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex-shrink-0 h-12 w-12">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {order.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      +{order.items.length - 3}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {order.items.length} product{order.items.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Shipping Address</p>
            <p className="font-medium text-gray-900 dark:text-white mt-1">
              {order.shippingAddress?.name || 'N/A'}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {order.shippingAddress?.street || 'N/A'}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br />
              {order.shippingAddress?.country || 'N/A'}
            </p>
            {order.shippingAddress?.phone && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                📞 {order.shippingAddress.phone}
              </p>
            )}
          </div>

          <div>
            <p className="text-gray-600 dark:text-gray-400">Payment & Shipping</p>
            <div className="mt-1 space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {order.paymentMethod.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Payment Status:</span>
                <span className={`font-medium ${
                  order.paymentStatus === 'paid' ? 'text-green-600 dark:text-green-400' :
                  order.paymentStatus === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tracking:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {order.trackingNumber}
                  </span>
                </div>
              )}
              {order.estimatedDelivery && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Estimated Delivery:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(order.estimatedDelivery).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cost Breakdown</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700">
                <span className="font-medium text-gray-900 dark:text-white">Total</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
