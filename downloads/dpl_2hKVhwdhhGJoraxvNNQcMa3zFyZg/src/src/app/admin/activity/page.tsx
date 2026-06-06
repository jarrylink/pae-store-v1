'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { Clock, ArrowLeft, Search, Filter, Eye, Package, ShoppingCart, Users, Wrench, Shield } from 'lucide-react';

interface ActivityLog {
  id: number;
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  oldData: any;
  newData: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export default function ActivityLogsPage() {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' ? '/api/admin/activity?limit=200' : `/api/admin/activity?action=${filter}&limit=200`;
      const response = await fetch(url);
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('ORDER')) return <ShoppingCart className="w-4 h-4" />;
    if (action.includes('PRODUCT')) return <Package className="w-4 h-4" />;
    if (action.includes('SERVICE')) return <Wrench className="w-4 h-4" />;
    if (action.includes('USER')) return <Users className="w-4 h-4" />;
    return <Eye className="w-4 h-4" />;
  };

  const getActionColor = (action: string) => {
    if (action === 'ORDER_CONFIRMED') return 'text-green-600 bg-green-100';
    if (action === 'ORDER_CANCELLED') return 'text-red-600 bg-red-100';
    if (action === 'ORDER_STATUS_UPDATED') return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (!user || user.role !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">Only super admins can view activity logs</p>
          <Link href="/admin/dashboard" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-3">
              <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
            </div>
            <p className="text-sm text-gray-600 mt-1">Track all actions performed in the system</p>
          </div>
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by Action:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'ORDER_CONFIRMED', 'ORDER_CANCELLED', 'ORDER_STATUS_UPDATED'].map((action) => (
              <button
                key={action}
                onClick={() => setFilter(action)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filter === action
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {action === 'all' ? 'All Actions' : action.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No activity logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {getActionIcon(log.action)}
                          <span>{log.action.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{log.userEmail || log.userId}</div>
                          <div className="text-xs text-gray-500">{log.userRole}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="text-gray-600">{log.entityType}</span>
                        <span className="text-gray-400 text-xs ml-1">#{log.entityId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-md">
                          {log.oldData && log.newData && (
                            <div className="text-xs">
                              <span className="text-red-600">Old: {JSON.stringify(log.oldData)}</span>
                              <br />
                              <span className="text-green-600">New: {JSON.stringify(log.newData)}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ipAddress || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
