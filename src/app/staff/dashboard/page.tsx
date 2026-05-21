'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingCart, Clock, CheckCircle, Eye, Search, 
  AlertCircle, LogOut, Home, Package, User, Mail, Phone, 
  MapPin, Calendar, DollarSign, Filter, X, 
  Truck, PackageCheck, CreditCard, TrendingUp, RefreshCw
} from 'lucide-react';

interface OrderItem {
  name?: string;
  title?: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
  };
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
}

export default function StaffDashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push('/');
      } else if (user.role !== 'staff') {
        router.push('/');
      } else {
        fetchAssignedOrders();
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/staff/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      const response = await fetch('/api/staff/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        alert(`✅ Order status updated to ${newStatus}`);
        fetchAssignedOrders();
        setShowModal(false);
      } else {
        alert('Failed to update: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error updating order');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = orders.filter(order => {
    if (selectedStatus !== 'all' && order.status !== selectedStatus) return false;
    if (searchTerm && !order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (dateRange.start) {
      const orderDate = new Date(order.createdAt);
      const startDate = new Date(dateRange.start);
      if (orderDate < startDate) return false;
    }
    if (dateRange.end) {
      const orderDate = new Date(order.createdAt);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59);
      if (orderDate > endDate) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc' 
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      return sortOrder === 'desc' ? b.total - a.total : a.total - b.total;
    }
  });

  const confirmedRevenue = orders
    .filter(o => o.status === 'confirmed' || o.status === 'processing' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button onClick={fetchAssignedOrders} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'staff') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Staff Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">
                Welcome back, {user?.firstName}! You have {orders.length} assigned order{orders.length !== 1 ? 's' : ''}.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700"><Home className="w-5 h-5" /></Link>
              <button onClick={() => logout()} className="text-gray-500 hover:text-gray-700"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Revenue Card */}
        <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">Your Revenue (Confirmed Orders)</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(confirmedRevenue)}</p>
              <p className="text-xs opacity-75 mt-1">From {statusCounts.confirmed + statusCounts.processing + statusCounts.shipped + statusCounts.delivered} confirmed orders</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-50" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Total Assigned</p><p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p></div>
              <ShoppingCart className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold text-amber-600">{statusCounts.pending}</p></div>
              <Clock className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">In Progress</p><p className="text-2xl font-bold text-indigo-600">{statusCounts.processing + statusCounts.confirmed}</p></div>
              <Package className="w-8 h-8 text-indigo-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Completed</p><p className="text-2xl font-bold text-green-600">{statusCounts.delivered}</p></div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button key={status} onClick={() => setSelectedStatus(status)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedStatus === status ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by order #, customer name, or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </button>
            <button onClick={fetchAssignedOrders} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date From</label><input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date To</label><input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label><select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="date">Order Date</option><option value="amount">Order Amount</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label><select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="desc">Newest / Highest First</option><option value="asc">Oldest / Lowest First</option></select></div>
              </div>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No orders found matching your criteria</td></tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-mono font-medium text-gray-900">#{order.orderNumber}</span></td>
                      <td className="px-6 py-4"><div className="text-sm"><p className="font-medium text-gray-900">{order.customerName}</p><p className="text-xs text-gray-500">{order.customerEmail}</p></div></td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{formatCurrency(order.total)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select 
                          value={order.status} 
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)} 
                          disabled={updatingStatus === order.id} 
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}
                        >
                          {updatingStatus === order.id ? (
                            <option disabled>⟳ Updating...</option>
                          ) : (
                            <>
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </>
                          )}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => { setSelectedOrder(order); setShowModal(true); }} className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
                          <Eye className="w-4 h-4" /> View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Order Header */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div><p className="text-xs text-gray-500">Order Number</p><p className="font-mono font-medium text-gray-900">#{selectedOrder.orderNumber}</p></div>
                <div><p className="text-xs text-gray-500">Order Date</p><p className="text-gray-900">{formatDate(selectedOrder.createdAt)}</p></div>
                <div><p className="text-xs text-gray-500">Status</p><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}</span></div>
                <div><p className="text-xs text-gray-500">Total Amount</p><p className="text-xl font-bold text-gray-900">{formatCurrency(selectedOrder.total)}</p></div>
              </div>

              {/* Customer Information */}
              <div><h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-gray-400" /><span className="text-gray-700">{selectedOrder.customerName}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-gray-400" /><span className="text-gray-700">{selectedOrder.customerEmail}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-gray-400" /><span className="text-gray-700">{selectedOrder.customerPhone || 'N/A'}</span></div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (<div><h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Shipping Address</h3><div className="p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-700">{selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p></div></div>)}

              {/* Order Items */}
              <div><h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Package className="w-4 h-4" /> Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Item</th><th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Quantity</th><th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Price</th><th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}><td className="px-4 py-3 text-sm text-gray-900">{item.name || item.title}</td><td className="px-4 py-3 text-sm text-gray-600 text-center">{item.quantity}</td><td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(item.price)}</td><td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.price * item.quantity)}</td></tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50"><tr><td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">Total</td><td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(selectedOrder.total)}</td></tr></tfoot>
                  </table>
                </div>
              </div>

              {/* Payment Information */}
              {selectedOrder.paymentMethod && (<div><h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment Information</h3><div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg"><div><p className="text-xs text-gray-500">Payment Method</p><p className="text-sm text-gray-900 capitalize">{selectedOrder.paymentMethod}</p></div><div><p className="text-xs text-gray-500">Payment Status</p><p className={`text-sm font-medium capitalize ${selectedOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>{selectedOrder.paymentStatus || 'Pending'}</p></div></div></div>)}

              {/* Order Notes */}
              {selectedOrder.notes && (<div><h3 className="font-semibold text-gray-900 mb-2">Order Notes</h3><p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedOrder.notes}</p></div>)}

              {/* Update Status */}
              <div className="border-t pt-4"><h3 className="font-semibold text-gray-900 mb-3">Update Order Status</h3>
                <div className="flex gap-3">
                  <select 
                    value={selectedOrder.status} 
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)} 
                    disabled={updatingStatus === selectedOrder.id} 
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {updatingStatus === selectedOrder.id ? (
                      <option disabled>⟳ Updating status...</option>
                    ) : (
                      <>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </>
                    )}
                  </select>
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

