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
      pending: 'bg-red-400 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
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

  const handleMakePayment = () => {
    // Redirect to payment page with order ID
    window.location.href = `/checkout?orderId=${order.id}`;
  };

  const handleWhatsAppChat = () => {
    // Format message with order details
    const message = `Hello Power Afric Team, I would like to discuss my order #${order.orderNumber || order.id} (Total: ₦${order.total.toLocaleString()}).`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/2348000000000?text=${encodedMessage}`, '_blank');
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
                Order #{order.orderNumber || order.id}
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

        {/* Order Actions - Now with 4 buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            {/* View Details Button */}
            <button
              onClick={() => {/* handle view details */}}
              className="px-4 py-2 text-sm font-medium text-[#1a2a8a] dark:text-green-400 hover:text-[#0f1a66] dark:hover:text-green-300 border border-[#1a2a8a] dark:border-green-400 rounded-lg transition-colors"
            >
              View Details
            </button>

            {/* Download Receipt Button */}
            <button
              onClick={() => {/* handle download receipt */}}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
            >
              Download Receipt
            </button>

            {/* Make Payment Button - Only for pending orders */}
            {order.status === 'pending' && (
              <button
                onClick={handleMakePayment}
                className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Make Payment
              </button>
            )}

            {/* Talk to Agent Button - WhatsApp */}
            <button
              onClick={handleWhatsAppChat}
              className="px-4 py-2 text-sm font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.121 1.521 5.861L.53 23.22c-.092.361.222.675.583.583l5.36-1.002C8.08 23.657 9.994 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.935 0-3.78-.525-5.36-1.44l-3.84.72.72-3.84C2.525 15.78 2 13.935 2 12 2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
              </svg>
              Talk to Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
