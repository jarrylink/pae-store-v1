'use client';

import React from 'react';
import { Order } from '@/types/auth';

interface OrderDetailsProps {
  order: Order;
  onBack: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onBack }) => {
  console.log("OrderDetails received:", { 
    orderId: order.id, 
    hasShippingAddress: !!order.shippingAddress,
    shippingAddress: order.shippingAddress 
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status] || colors.pending;
  };

  const getStatusProgress = (status: string) => {
    const steps: Record<string, number> = {
      pending: 1,
      confirmed: 2,
      shipped: 3,
      delivered: 4,
      cancelled: 0
    };
    return steps[status] || 0;
  };

  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Order Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors group"
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to Orders</span>
          </button>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order #{order.id}</h3>
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Order Progress Tracking */}
      {order.status !== 'cancelled' && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/10 dark:to-green-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Delivery Progress</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              {['Order Placed', 'Confirmed', 'Shipped', 'Delivered'].map((step, index) => (
                <div key={step} className="text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    getStatusProgress(order.status) > index
                      ? 'bg-[#1a2a8a] text-white dark:bg-green-400 dark:text-gray-900'
                      : getStatusProgress(order.status) === index
                      ? 'bg-blue-200 text-blue-800 dark:bg-green-200 dark:text-green-900 border-2 border-[#1a2a8a] dark:border-green-400'
                      : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                  }`}>
                    {getStatusProgress(order.status) > index ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className={`text-xs font-medium ${
                    getStatusProgress(order.status) >= index
                      ? 'text-[#1a2a8a] dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {index === 2 && order.trackingNumber && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Track: {order.trackingNumber}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#1a2a8a] to-[#40b553] h-2 rounded-full transition-all duration-500"
                style={{ width: `${(getStatusProgress(order.status) / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Order Items</h4>
            <div className="space-y-4">
              {order.items.map((item: any, index: number) => {
                const itemKey = item.lineItemId || `order-${order.id}-product-${item.productId || item.id}-${index}`;
                return (
                  <div key={itemKey} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-600 rounded-lg">
                    <img
                      src={item.image || "/placeholder-image.png"}
                      alt={item.title || "Product image"}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => { e.currentTarget.src = "/placeholder-image.png"; }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.brand} • {item.spec}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Capacity: {item.capacity}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Warranty: {item.warranty}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(item.price)} each
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1a2a8a] dark:text-green-400">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Order Timeline</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#1a2a8a] dark:bg-green-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Order Placed</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              {order.status !== 'pending' && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#1a2a8a] dark:bg-green-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Order Confirmed</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.updatedAt)}</p>
                  </div>
                </div>
              )}
              {order.trackingNumber && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#1a2a8a] dark:bg-green-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Shipped</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Tracking: {order.trackingNumber}
                    </p>
                  </div>
                </div>
              )}
              {order.actualDelivery && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#1a2a8a] dark:bg-green-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Delivered</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.actualDelivery)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(order.subtotal || order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(order.shipping || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(order.tax || 0)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-[#1a2a8a] dark:text-green-400">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Shipping Information</h4>
            {order.shippingAddress ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-900 dark:text-white font-medium">{order.shippingAddress.name || "Recipient"}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{order.shippingAddress.street}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postalCode].filter(Boolean).join(', ')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {order.shippingAddress.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No shipping address provided with this order</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{order.paymentMethod || 'Bank Transfer'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
