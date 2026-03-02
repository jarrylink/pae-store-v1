'use client';

import React, { useState } from 'react';
import { UserFilters } from '@/lib/services/userService';

interface UserFiltersBarProps {
  onFilterChange: (filters: UserFilters) => void;
}

const UserFiltersBar: React.FC<UserFiltersBarProps> = ({ onFilterChange }) => {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');

  const handleSearch = () => {
    const filters: UserFilters = {};
    
    if (search.trim()) {
      filters.search = search.trim();
    }
    
    if (role !== 'all') {
      filters.role = role as 'superadmin' | 'staff' | 'customer';
    }
    
    if (status !== 'all') {
      filters.isActive = status === 'active';
    }
    
    onFilterChange(filters);
  };

  const handleReset = () => {
    setSearch('');
    setRole('all');
    setStatus('all');
    onFilterChange({});
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search Users
          </label>
          <input
            type="text"
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or email..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Role Filter */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Super Admin</option>
            <option value="staff">Staff</option>
            <option value="customer">Customer</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-end space-x-2">
          <button
            onClick={handleSearch}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg hover:from-[#0f1a66] hover:to-[#2e8b47] transition-all"
          >
            Apply Filters
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFiltersBar;
