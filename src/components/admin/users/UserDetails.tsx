'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils';
import { User } from '@/types/auth';
import { orderService } from '@/lib/services/orderService';
import { Order } from '@/types/auth';
import OrderCard from '@/components/orders/OrderCard';

interface UserDetailsProps {
  user: Omit<User, 'password'>;
  onClose: () => void;
  isSuperAdmin?: boolean;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user, onClose, isSuperAdmin = false }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'details'>('orders');

  // Fetch user orders
  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        setLoading(true);
        const response = await orderService.getUserOrders(user.id);
        setOrders(response);
      } catch (error) {
        console.error('Error fetching user orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [user.id]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get role display
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'Super Admin';
      case 'staff':
        return 'Staff';
      case 'customer':
        return 'Customer';
      default:
        return role;
    }
  };

  // Calculate total spent
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12">
              <img
                className="h-12 w-12 rounded-full"
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`}
                alt={`${user.firstName} ${user.lastName}`}
              />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.email} • {getRoleDisplay(user.role)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'orders'
                  ? 'border-[#1a2a8a] text-[#1a2a8a] dark:border-[#40b553] dark:text-[#40b553]'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'wishlist'
                  ? 'border-[#1a2a8a] text-[#1a2a8a] dark:border-[#40b553] dark:text-[#40b553]'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Wishlist
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'details'
                  ? 'border-[#1a2a8a] text-[#1a2a8a] dark:border-[#40b553] dark:text-[#40b553]'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              User Details
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === 'orders' && (
            <div>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1a2a8a] mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders found</h3>
                  <p className="text-gray-600 dark:text-gray-400">This user hasn't placed any orders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(totalSpent)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Average Order</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(orders.length > 0 ? totalSpent / orders.length : 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <OrderCard 
                          order={order} 
                          isAdmin={isSuperAdmin}
                          onStatusUpdate={isSuperAdmin ? () => {} : undefined}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Wishlist Coming Soon</h3>
              <p className="text-gray-600 dark:text-gray-400">Wishlist functionality will be implemented in the next update.</p>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                    <p className="text-sm text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
                    <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
                    <p className="text-sm text-gray-900 dark:text-white">{user.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'superadmin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                      user.role === 'staff' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {getRoleDisplay(user.role)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Account Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Activity Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Account Created</p>
                    <p className="text-sm text-gray-900 dark:text-white">{formatDate(user.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                    <p className="text-sm text-gray-900 dark:text-white">{formatDate(user.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Last Login</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Never logged in'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email Verification</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.emailVerified
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {user.emailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  {user.company && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Company</p>
                      <p className="text-sm text-gray-900 dark:text-white">{user.company}</p>
                    </div>
                  )}
                  {user.location && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                      <p className="text-sm text-gray-900 dark:text-white">{user.location}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;


