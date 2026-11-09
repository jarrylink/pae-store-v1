'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import {
  Search, Eye, Truck, CheckCircle, XCircle, Clock, User,
  Mail, Phone, MapPin, Package, DollarSign, AlertCircle,
  RefreshCw, Users, FileText, ShoppingCart, Printer, ArrowUpRight
} from 'lucide-react';
import { openPowerAfricInvoice } from '@/lib/services/invoiceTemplate';
import { toast } from 'react-hot-toast';

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  total: number;
  subtotal?: number;
  taxAmount?: number;
  discount?: number;
  status: string;
  createdAt: string;
  items: any[];
  shippingAddress?: any;
  paymentMethod?: string;
  bankName?: string;
  accountNumber?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  assignedStaffEmail?: string;
  isInvoice?: boolean;
  entryType?: 'order' | 'invoice';
  creatorName?: string;
  creatorRole?: string;
  dueDate?: string;
  notes?: string;
  terms?: string;
}

interface Staff {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  activeOrders: number;
}

export default function AdminOrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pipeline filter: all | orders | invoices
  const [entryTypeFilter, setEntryTypeFilter] = useState<'all' | 'order' | 'invoice'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [assigningStaff, setAssigningStaff] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchStaff();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to database');
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/admin/staff');
      const data = await response.json();
      if (data.success) {
        setStaff(data.staff || []);
      }
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string, isInvoice?: boolean) => {
    try {
      setUpdatingStatus(orderId);
      const url = `/api/admin/orders?id=${orderId}${isInvoice ? '&isInvoice=true' : ''}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, isInvoice })
      });
      const data = await response.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId && !!o.isInvoice === !!isInvoice ? { ...o, status: newStatus } : o));
        toast.success(`Status updated to "${newStatus}"`);
        if (selectedOrder && selectedOrder.id === orderId && !!selectedOrder.isInvoice === !!isInvoice) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }
      } else {
        toast.error('Failed to update: ' + data.error);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Error updating status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const assignOrderToStaff = async (orderId: number, staffId: string) => {
    try {
      setAssigningStaff(orderId);
      const response = await fetch(`/api/admin/orders/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, staffId })
      });
      const data = await response.json();
      if (data.success) {
        fetchOrders();
        toast.success('Staff assigned successfully');
      } else {
        toast.error('Failed to assign: ' + data.error);
      }
    } catch (err) {
      console.error('Error assigning order:', err);
      toast.error('Error assigning order');
    } finally {
      setAssigningStaff(null);
    }
  };

  const getStatusColor = (status: string, isInvoice?: boolean) => {
    const s = status.toLowerCase();
    if (s === 'paid' || s === 'delivered') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'confirmed' || s === 'issued') return 'bg-blue-50 text-[#1a2a8a] border-blue-200';
    if (s === 'processing' || s === 'shipped') return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    if (s === 'pending' || s === 'draft') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'overdue' || s === 'cancelled') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Entry type filter: all, order, invoice
      if (entryTypeFilter === 'order' && order.isInvoice) return false;
      if (entryTypeFilter === 'invoice' && !order.isInvoice) return false;

      // Status filter
      if (selectedStatus !== 'all') {
        const orderStatus = order.status.toLowerCase();
        if (selectedStatus === 'pending_or_draft' && !(orderStatus === 'pending' || orderStatus === 'draft')) return false;
        if (selectedStatus === 'completed_or_paid' && !(orderStatus === 'delivered' || orderStatus === 'paid')) return false;
        if (selectedStatus === 'confirmed_or_issued' && !(orderStatus === 'confirmed' || orderStatus === 'issued')) return false;
        if (!['pending_or_draft', 'completed_or_paid', 'confirmed_or_issued'].includes(selectedStatus) && orderStatus !== selectedStatus) {
          return false;
        }
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesNumber = order.orderNumber?.toLowerCase().includes(term);
        const matchesName = order.customerName?.toLowerCase().includes(term);
        const matchesEmail = order.customerEmail?.toLowerCase().includes(term);
        const matchesCreator = order.creatorName?.toLowerCase().includes(term);
        if (!matchesNumber && !matchesName && !matchesEmail && !matchesCreator) return false;
      }

      return true;
    });
  }, [orders, entryTypeFilter, selectedStatus, searchTerm]);

  // Comprehensive Pipeline Calculations
  const pipelineStats = useMemo(() => {
    const storeOrders = orders.filter(o => !o.isInvoice);
    const invoices = orders.filter(o => o.isInvoice);

    const storeTotal = storeOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const invoiceTotal = invoices.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const grandPipeline = storeTotal + invoiceTotal;

    const settledTotal = orders
      .filter(o => o.status === 'delivered' || o.status === 'paid')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const pendingTotal = orders
      .filter(o => ['pending', 'draft', 'issued', 'processing', 'shipped'].includes(o.status))
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    return {
      storeCount: storeOrders.length,
      storeTotal,
      invoiceCount: invoices.length,
      invoiceTotal,
      grandPipeline,
      settledTotal,
      pendingTotal,
    };
  }, [orders]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a2a8a] mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading orders & invoice pipeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Database Connection Notice</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-5 py-2.5 bg-[#1a2a8a] text-white rounded-xl text-sm font-semibold hover:bg-[#15226e] transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-[#1a2a8a]" />
            Orders & Revenue Pipeline
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time pipeline unifying online store checkouts and agent-generated invoices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
            Refresh Pipeline
          </button>
        </div>
      </div>

      {/* Pipeline Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Pipeline */}
        <div className="bg-gradient-to-br from-[#1a2a8a] to-[#2539a8] text-white p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-medium text-blue-100 uppercase tracking-wider">Total Pipeline Value</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(pipelineStats.grandPipeline)}</p>
          <p className="text-xs text-blue-200 mt-1">{orders.length} total transactions</p>
        </div>

        {/* Store Orders */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Store Orders</p>
            <span className="p-1.5 bg-blue-50 text-[#1a2a8a] rounded-lg">
              <ShoppingCart className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(pipelineStats.storeTotal)}</p>
          <p className="text-xs text-gray-500 mt-1">{pipelineStats.storeCount} orders online</p>
        </div>

        {/* Invoices Generated */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Generated Invoices</p>
            <span className="p-1.5 bg-emerald-50 text-[#40b553] rounded-lg">
              <FileText className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xl font-bold text-[#40b553] mt-1">{formatCurrency(pipelineStats.invoiceTotal)}</p>
          <p className="text-xs text-gray-500 mt-1">{pipelineStats.invoiceCount} official invoices</p>
        </div>

        {/* Settled / Paid */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Settled / Delivered</p>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(pipelineStats.settledTotal)}</p>
          <p className="text-xs text-gray-500 mt-1">Confirmed revenue</p>
        </div>

        {/* Pending Pipeline */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending / In-Flight</p>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xl font-bold text-amber-600 mt-1">{formatCurrency(pipelineStats.pendingTotal)}</p>
          <p className="text-xs text-gray-500 mt-1">Active fulfillment pipeline</p>
        </div>
      </div>

      {/* Filter Tabs: Entry Types & Statuses */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4 shadow-sm">
        {/* Entry Type Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="inline-flex p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setEntryTypeFilter('all')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                entryTypeFilter === 'all'
                  ? 'bg-white text-[#1a2a8a] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Pipeline ({orders.length})
            </button>
            <button
              onClick={() => setEntryTypeFilter('order')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                entryTypeFilter === 'order'
                  ? 'bg-white text-[#1a2a8a] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Store Orders ({pipelineStats.storeCount})
            </button>
            <button
              onClick={() => setEntryTypeFilter('invoice')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                entryTypeFilter === 'invoice'
                  ? 'bg-white text-[#40b553] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Invoices ({pipelineStats.invoiceCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, invoice #, customer or agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a]"
            />
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { id: 'all', label: 'All Statuses' },
            { id: 'pending_or_draft', label: 'Pending / Draft' },
            { id: 'confirmed_or_issued', label: 'Confirmed / Issued' },
            { id: 'processing', label: 'Processing' },
            { id: 'shipped', label: 'Shipped' },
            { id: 'completed_or_paid', label: 'Delivered / Paid' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedStatus(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedStatus === item.id
                  ? 'bg-[#1a2a8a] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders & Invoices Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Transaction</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Total Amount</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Origin / Agent</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const isInvoice = !!order.isInvoice;
                return (
                  <tr key={`${order.isInvoice ? 'inv' : 'ord'}-${order.id}`} className="hover:bg-gray-50/70 transition-colors">
                    {/* Identifier & Type Badge */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isInvoice ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <FileText className="w-3 h-3 text-emerald-600" />
                            INVOICE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#1a2a8a]/10 text-[#1a2a8a] border border-[#1a2a8a]/20">
                            <ShoppingCart className="w-3 h-3 text-[#1a2a8a]" />
                            STORE ORDER
                          </span>
                        )}
                        <span className="text-xs font-mono font-semibold text-gray-900">
                          #{order.orderNumber}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.customerEmail || order.customerPhone || 'Direct Client'}</p>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(order.total)}</span>
                      {order.items?.length > 0 && (
                        <p className="text-[11px] text-gray-400">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value, order.isInvoice)}
                        disabled={updatingStatus === order.id}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status, isInvoice)} focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] cursor-pointer`}
                      >
                        {updatingStatus === order.id ? (
                          <option disabled>Updating...</option>
                        ) : isInvoice ? (
                          <>
                            <option value="draft">Draft</option>
                            <option value="issued">Issued</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                            <option value="cancelled">Cancelled</option>
                          </>
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

                    {/* Origin / Staff Assignment */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {isInvoice ? (
                        <div className="text-xs">
                          <span className="font-semibold text-gray-800">{order.creatorName || 'Superadmin'}</span>
                          <span className="block text-[10px] text-gray-400 capitalize">{order.creatorRole || 'Staff'}</span>
                        </div>
                      ) : user?.role === 'superadmin' ? (
                        <select
                          value={order.assignedStaffId || ''}
                          onChange={(e) => assignOrderToStaff(order.id, e.target.value)}
                          disabled={assigningStaff === order.id}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] min-w-[130px]"
                        >
                          {assigningStaff === order.id ? (
                            <option disabled>Assigning...</option>
                          ) : (
                            <>
                              <option value="">Unassigned</option>
                              {staff.map((staffMember) => (
                                <option key={staffMember.id} value={staffMember.id}>
                                  {staffMember.name} ({staffMember.activeOrders})
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                      ) : (
                        <span className="text-xs text-gray-600">{order.assignedStaffName || 'Unassigned'}</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isInvoice && (
                          <button
                            onClick={() => openPowerAfricInvoice(order)}
                            title="Print / View Invoice"
                            className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowModal(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16 px-4">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">No transactions match your filter</p>
            <p className="text-xs text-gray-400 mt-1">Try resetting the status, search term, or pipeline tab.</p>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                {selectedOrder.isInvoice ? (
                  <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </span>
                ) : (
                  <span className="p-2 bg-blue-50 text-[#1a2a8a] rounded-xl">
                    <ShoppingCart className="w-5 h-5" />
                  </span>
                )}
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedOrder.isInvoice ? 'Invoice Details' : 'Store Order Details'}
                  </h2>
                  <p className="text-xs font-mono text-gray-500">#{selectedOrder.orderNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedOrder.isInvoice && (
                  <button
                    onClick={() => openPowerAfricInvoice(selectedOrder)}
                    className="px-3 py-1.5 bg-[#40b553] text-white rounded-xl text-xs font-semibold hover:bg-[#349444] transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Invoice
                  </button>
                )}
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Key Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Type</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {selectedOrder.isInvoice ? 'Invoice' : 'Store Checkout'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Date</p>
                  <p className="text-xs text-gray-900 mt-0.5">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Status</p>
                  <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(selectedOrder.status, selectedOrder.isInvoice)}`}>
                    {selectedOrder.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Grand Total</p>
                  <p className="text-base font-bold text-[#1a2a8a] mt-0.5">{formatCurrency(selectedOrder.isInvoice ? Math.max(0, (Number(selectedOrder.subtotal) || 0) - (Number(selectedOrder.discount) || 0)) : selectedOrder.total)}</p>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-white p-3.5 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-800">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{selectedOrder.customerEmail || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{selectedOrder.customerPhone || 'No phone provided'}</span>
                  </div>
                  {selectedOrder.shippingAddress && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {typeof selectedOrder.shippingAddress === 'string'
                          ? selectedOrder.shippingAddress
                          : `${selectedOrder.shippingAddress.street || ''}, ${selectedOrder.shippingAddress.city || ''}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  Transaction Items ({selectedOrder.items?.length || 0})
                </h3>
                <div className="space-y-2 border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                  {selectedOrder.items?.map((item: any, idx: number) => {
                    const itemName = item.description || item.name || item.title || `Item #${idx + 1}`;
                    const itemQty = Number(item.quantity) || 1;
                    const itemPrice = Number(item.unitPrice || item.price || 0);
                    const itemTotal = Number(item.total) || (itemQty * itemPrice);

                    return (
                      <div key={idx} className="flex justify-between items-center py-2 px-2 border-b border-gray-100 last:border-0 bg-white rounded-lg">
                        <div>
                          <p className="font-semibold text-xs text-gray-900">{itemName}</p>
                          <p className="text-[11px] text-gray-500">
                            {formatCurrency(itemPrice)} × {itemQty}
                            {item.type && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 capitalize">
                                {item.type}
                              </span>
                            )}
                          </p>
                        </div>
                        <p className="font-bold text-xs text-gray-900">{formatCurrency(itemTotal)}</p>
                      </div>
                    );
                  })}

                  {/* Summary Breakdown */}
                  <div className="pt-3 border-t border-gray-200 space-y-1 text-xs">
                    {Number(selectedOrder.discount || 0) > 0 && (
                      <div className="flex justify-between text-gray-500">
                        <span>Discount:</span>
                        <span className="text-rose-600 font-semibold">-{formatCurrency(Number(selectedOrder.discount))}</span>
                      </div>
                    )}
                    {!selectedOrder.isInvoice && Number(selectedOrder.taxAmount || 0) > 0 && (
                      <div className="flex justify-between text-gray-500">
                        <span>VAT:</span>
                        <span className="font-semibold">{formatCurrency(Number(selectedOrder.taxAmount))}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-100">
                      <span>Total Amount:</span>
                      <span className="text-[#1a2a8a]">{formatCurrency(selectedOrder.isInvoice ? Math.max(0, (Number(selectedOrder.subtotal) || 0) - (Number(selectedOrder.discount) || 0)) : selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creator / Staff Assignment */}
              {selectedOrder.isInvoice ? (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs flex justify-between items-center">
                  <div>
                    <p className="text-gray-500">Created By Sales Agent / Staff:</p>
                    <p className="font-bold text-[#1a2a8a]">{selectedOrder.creatorName || 'Superadmin'}</p>
                  </div>
                  {selectedOrder.dueDate && (
                    <div className="text-right">
                      <p className="text-gray-500">Payment Due Date:</p>
                      <p className="font-semibold text-gray-800">{new Date(selectedOrder.dueDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              ) : user?.role === 'superadmin' && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    Assign Staff for Order Fulfillment
                  </h3>
                  <select
                    value={selectedOrder.assignedStaffId || ''}
                    onChange={(e) => {
                      assignOrderToStaff(selectedOrder.id, e.target.value);
                      setShowModal(false);
                    }}
                    disabled={assigningStaff === selectedOrder.id}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a]"
                  >
                    {assigningStaff === selectedOrder.id ? (
                      <option disabled>Assigning...</option>
                    ) : (
                      <>
                        <option value="">Unassigned</option>
                        {staff.map((staffMember) => (
                          <option key={staffMember.id} value={staffMember.id}>
                            {staffMember.name} ({staffMember.activeOrders} active orders)
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
