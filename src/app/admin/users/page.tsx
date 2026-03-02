'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { userService, UserFilters } from '@/lib/services/userService';
import UserTable from '@/components/admin/users/UserTable';
import UserFiltersBar from '@/components/admin/users/UserFiltersBar';
import UserStats from '@/components/admin/users/UserStats';
import CreateUserModal from '@/components/admin/users/CreateUserModal';
import EditUserModal from '@/components/admin/users/EditUserModal';
import UserDetails from '@/components/admin/users/UserDetails';
import { useAuthStore } from '@/lib/stores/authStore';

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({});
  const [stats, setStats] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Omit<User, 'password'> | null>(null);
  const [selectedUser, setSelectedUser] = useState<Omit<User, 'password'> | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const usersResponse = await userService.getUsers(filters);
      if (usersResponse.success) {
        setUsers(usersResponse.data);
      }

      const statsData = await userService.getUserStats();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, refreshKey]);

  const handleFilterChange = (newFilters: UserFilters) => {
    setFilters(newFilters);
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await userService.toggleUserStatus(id, isActive);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await userService.deleteUser(id);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      await userService.createUser(userData);
      setShowCreateModal(false);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const handleUpdateUser = async (id: string, userData: Partial<User>) => {
    try {
      await userService.updateUser(id, userData);
      setEditingUser(null);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a2a8a]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage all users, staff, and administrators in the system
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg hover:from-[#0f1a66] hover:to-[#2e8b47] transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New User
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-600 dark:text-red-400 font-medium">{error}</span>
          </div>
        </div>
      )}

      {stats && <UserStats stats={stats} />}

      <div className="mb-6">
        <UserFiltersBar onFilterChange={handleFilterChange} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1a2a8a] mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-2.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or add a new user.</p>
          </div>
        ) : (
          <UserTable
            users={users}
            currentUserId={currentUser?.id}            onEdit={setEditingUser}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteUser}
          />
        )}
      </div>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdateUser}
        />
      )}

      {selectedUser && (
        <UserDetails
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          isSuperAdmin={currentUser?.role === 'superadmin'}
        />
      )}
    </div>
  );
}





