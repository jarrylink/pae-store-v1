'use client';

import React, { useState } from 'react';
import { Order } from '@/types/auth';
import OrderDetails from './OrderDetails';
import OrderReceipt from '../receipts/OrderReceipt';

interface OrdersContentProps {
  orders: Order[];
  onOrderSelect: (orderId: string) => void;
  selectedOrder: string | null;
  onBackToOrders: () => void;
}

const OrdersContent: React.FC<OrdersContentProps> = ({
  orders,
  onOrderSelect,
  selectedOrder,
  onBackToOrders
}) => {
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  if (receiptOrder) {
    return (
      <OrderReceipt
        order={receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />
    );
  }

  if (selectedOrder) {
    const order = orders.find(o => o.id === Number(selectedOrder));
    if (!order) return null;

    return (
      <OrderDetails
        order={order}
        onBack={onBackToOrders}
        onDownloadReceipt={() => setReceiptOrder(order)}
      />
    );
  }

  // Show empty state if no orders
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Start shopping to place your first order!</p>
        <a
          href="/"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Browse Products
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Order History</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage all your solar energy purchases</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
          <p className="text-2xl font-bold text-[#1a2a8a] dark:text-green-400">
            ₦{orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onViewDetails={() => onOrderSelect(String(order.id))}
            onDownloadReceipt={() => setReceiptOrder(order)}
          />
        ))}
      </div>
    </div>
  );
};

// Order Card Component
const OrderCard: React.FC<{
  order: Order;
  onViewDetails: () => void;
  onDownloadReceipt: () => void;
}> = ({ order, onViewDetails, onDownloadReceipt }) => {
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

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300">
      {/* Order Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <div className="flex items-center space-x-4">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              Order #{order.id}
            </h4>
            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Placed on {formatDate(order.createdAt)} • {order.items.length} item{order.items.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="mt-2 md:mt-0 text-right">
          <p className="text-2xl font-bold text-[#1a2a8a] dark:text-green-400">
            ₦{order.total.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {order.paymentMethod}
          </p>
        </div>
      </div>

      {/* Order Progress */}
      {order.status !== 'cancelled' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2 text-xs text-gray-500 dark:text-gray-400">
            {['Order Placed', 'Confirmed', 'Shipped', 'Delivered'].map((step, index) => (
              <div key={step} className={getStatusProgress(order.status) > index ? 'text-[#1a2a8a] dark:text-green-400 font-medium' : ''}>
                {step}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#1a2a8a] to-[#40b553] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(getStatusProgress(order.status) / 4) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Order Items Preview */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
        <div className="flex items-center space-x-4">
          {order.items.slice(0, 3).map((item: any, index: number) => (
            <div key={index} className="flex items-center space-x-3">
              <img
                src={item.image}
                alt={item.title}
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Qty: {item.quantity}
                </p>
              </div>
              {index < 2 && order.items.length > 1 && (
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              )}
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              +{order.items.length - 3} more items
            </div>
          )}
        </div>
      </div>

      {/* Order Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Shipping to: {order.shippingAddress?.city ?? 'N/A'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onViewDetails}
            className="px-4 py-2 text-sm font-medium text-[#1a2a8a] dark:text-green-400 hover:text-[#0f1a66] dark:hover:text-green-300 border border-[#1a2a8a] dark:border-green-400 rounded-lg transition-colors"
          >
            View Details
          </button>
          <button
            onClick={onDownloadReceipt}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
          >
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersContent;


