'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { useUserProfileStore } from '@/lib/stores/userStore';
import OrderInvoice from '@/components/account/receipts/OrderInvoice';
import OrderReceipt from '@/components/account/receipts/OrderReceipt';

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { orders, setOrders } = useUserProfileStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<any>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any>(null);

  // Fetch orders from API when component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/orders?userId=${user.id}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          console.error('Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, setOrders]);

  const statusFilters = [
    { value: 'all', label: 'All Orders', count: orders.length },
    { value: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { value: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
    { value: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
    { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
    { value: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
  ];

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter(order => order.status === selectedStatus);

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

  const getStatusText = (status: string) => {
    return (status || "").charAt(0).toUpperCase() + (status || "").slice(1);
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

  const openReceipt = (order: any) => {
    setSelectedOrderForReceipt(order);
  };

  const openInvoice = (order: any) => {
    setSelectedOrderForInvoice(order);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2a8a] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2a8a] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Order History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track and manage all your solar energy purchases
          </p>
        </div>

        {/* Order Stats and Filters */}
        {orders.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {statusFilters.map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedStatus(filter.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedStatus === filter.value
                        ? 'bg-[#1a2a8a] text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Spent
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  â‚¦{orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Order #{order.id}
                      </h3>
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    {(() => {
                      const allOrderItems = [
                        ...(Array.isArray((order as any).products) ? (order as any).products : (order.items || [])),
                        ...(Array.isArray((order as any).services) ? (order as any).services : [])
                      ];
                      const totalCount = allOrderItems.length + (order.accessories?.length || 0);
                      return (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Placed on {new Date(order.createdAt).toLocaleString()} • {totalCount} item{totalCount !== 1 ? 's' : ''}
                        </p>
                      );
                    })()}
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
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      {['Order Placed', 'Confirmed', 'Shipped', 'Delivered'].map((step, index) => (
                        <div
                          key={step}
                          className={`text-xs font-medium ${
                            getStatusProgress(order.status) > index
                              ? 'text-[#1a2a8a] dark:text-green-400'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {step}
                        </div>
                      ))}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-[#1a2a8a] dark:bg-green-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(getStatusProgress(order.status) / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {[
                      ...(Array.isArray((order as any).products) ? (order as any).products : (order.items || [])),
                      ...(Array.isArray((order as any).services) ? (order as any).services : [])
                    ].map((item: any, idx: number) => (
                      <div key={item.id || item.productId || item.serviceId || idx} className="flex items-center space-x-4">
                        <img
                          src={item.image || '/placeholder-image.png'}
                          alt={item.title || item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.png'; }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.title || item.name}
                            {item.type === 'service' ? ' (Service)' : ''}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.brand ? `${item.brand} • ` : ''}Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">
                            ₦{(Number(item.price) * Number(item.quantity)).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ₦{Number(item.price).toLocaleString()} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Shipping to: {order.shippingAddress?.street ?? 'N/A'}, {order.shippingAddress?.city ?? 'N/A'}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 text-sm font-medium text-[#1a2a8a] dark:text-green-400 hover:text-[#0f1a66] dark:hover:text-green-300 border border-[#1a2a8a] dark:border-green-400 rounded-lg transition-colors">
                      View Details
                    </button>
                    <button
                      onClick={() => openInvoice(order)}
                      className="px-4 py-2 text-sm font-medium text-[#1a2a8a] dark:text-green-400 hover:text-[#0f1a66] dark:hover:text-green-300 border border-[#1a2a8a] dark:border-green-400 rounded-lg transition-colors"
                    >
                      Generate Invoice
                    </button>
                    <button
                      onClick={() => openReceipt(order)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                    >
                      Download Receipt
                    </button>
                    {order.status === 'delivered' && (
                      <button className="px-4 py-2 text-sm font-medium bg-[#1a2a8a] hover:bg-[#0f1a66] dark:bg-green-400 dark:hover:bg-green-500 text-white rounded-lg transition-colors">
                        Request Return
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">ðŸ“¦</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {selectedStatus === 'all'
                ? "You haven't placed any orders yet."
                : `You don't have any ${selectedStatus} orders.`
              }
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-[#1a2a8a] hover:bg-[#0f1a66] dark:bg-green-400 dark:hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
            >
              Start Shopping
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedOrderForInvoice && (
        <OrderInvoice order={selectedOrderForInvoice} onClose={() => setSelectedOrderForInvoice(null)} />
      )}
      {selectedOrderForReceipt && (
        <OrderReceipt order={selectedOrderForReceipt} onClose={() => setSelectedOrderForReceipt(null)} />
      )}
    </div>
  );
}
