'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import InvoiceManager from '@/components/admin/invoices/InvoiceManager';
import ProductsManagement from '@/app/admin/products/page';
import AdminAccessoriesPage from '@/app/admin/accessories/page';
import AdminServicesPage from '@/app/admin/services/page';
import { FileText, Package, Box, Wrench, User, Lock, Save, KeyRound, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

type SalesTab = 'invoices' | 'products' | 'accessories' | 'services' | 'profile';

function SalesDashboardContent() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = (searchParams.get('tab') as SalesTab) || 'invoices';
  const [activeTab, setActiveTab] = useState<SalesTab>(tabParam);

  useEffect(() => {
    if (tabParam && ['invoices', 'products', 'accessories', 'services', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: SalesTab) => {
    setActiveTab(tab);
    router.replace(`/sales/dashboard?tab=${tab}`);
  };

  if (!user) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">Loading Sales Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-wrap gap-2">
        <button
          onClick={() => handleTabChange('invoices')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'invoices'
              ? 'bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white shadow-md'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Invoices
        </button>

        <button
          onClick={() => handleTabChange('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'products'
              ? 'bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white shadow-md'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Package className="w-4 h-4" />
          Products
        </button>

        <button
          onClick={() => handleTabChange('accessories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'accessories'
              ? 'bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white shadow-md'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Box className="w-4 h-4" />
          Accessories
        </button>

        <button
          onClick={() => handleTabChange('services')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'services'
              ? 'bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white shadow-md'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Services
        </button>

        <button
          onClick={() => handleTabChange('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ml-auto ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <User className="w-4 h-4" />
          Profile & Security
        </button>
      </div>

      {/* Tab Content Panes */}
      <div className="transition-all duration-200">
        {activeTab === 'invoices' && (
          <InvoiceManager
            user={{
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role,
            }}
            mode="sales_agent"
          />
        )}

        {activeTab === 'products' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <ProductsManagement />
          </div>
        )}

        {activeTab === 'accessories' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <AdminAccessoriesPage />
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <AdminServicesPage />
          </div>
        )}

        {activeTab === 'profile' && (
          <SalesAgentProfileTab user={user} />
        )}
      </div>
    </div>
  );
}

// ----------------- Profile & Security Tab -----------------
function SalesAgentProfileTab({ user }: { user: any }) {
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email] = useState(user.email || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First and last name are required');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update profile');
      }

      toast.success('Profile details updated successfully');
      // Update local storage and auth store
      const updatedUser = { ...user, firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() };
      useAuthStore.setState({ user: updatedUser });
      localStorage.setItem('pa_user', JSON.stringify(updatedUser));
    } catch (err: any) {
      toast.error(err.message || 'Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to change password');
      }

      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Error changing password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Profile Details Card */}
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sales Agent Profile</h3>
            <p className="text-xs text-gray-500">Manage your personal and contact details.</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
            <p className="text-[11px] text-gray-400 mt-1">Contact Superadmin if you need to update your login email.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="+234 800 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>Assigned Role: <strong>Sales Agent</strong> (Authorized store catalog & invoicing operator)</span>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {savingProfile ? 'Saving Changes...' : 'Save Profile Details'}
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Account Password</h3>
            <p className="text-xs text-gray-500">Update your secret password for secure portal sign-in.</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Current Password *</label>
            <input
              type="password"
              required
              placeholder="Enter existing password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">New Password *</label>
            <input
              type="password"
              required
              placeholder="Min. 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Confirm New Password *</label>
            <input
              type="password"
              required
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <p className="text-[11px] text-gray-500">
            Make sure your password is unique and not shared with others.
          </p>

          <button
            type="submit"
            disabled={savingPassword}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] hover:opacity-95 text-white font-semibold rounded-xl text-sm transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            {savingPassword ? 'Updating Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SalesDashboardPage() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">Loading Sales Portal...</p>
      </div>
    }>
      <SalesDashboardContent />
    </Suspense>
  );
}
