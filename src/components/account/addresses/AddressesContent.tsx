'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useUserProfileStore } from '@/lib/stores/userStore';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  Home, 
  Building, 
  Check, 
  X, 
  Loader2, 
  Phone, 
  Globe 
} from 'lucide-react';

interface Address {
  id: string;
  type: string;
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  phone?: string;
  isDefault: boolean;
}

interface AddressesContentProps {
  addresses?: Address[];
}

export default function AddressesContent({ addresses: initialAddresses = [] }: AddressesContentProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { setAddresses: setStoreAddresses } = useUserProfileStore();
  const { addNotification } = useNotificationStore();

  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [loading, setLoading] = useState<boolean>(!initialAddresses || initialAddresses.length === 0);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    type: 'home',
    name: '',
    street: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: '',
    phone: '',
    isDefault: false
  });

  const fetchAddresses = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/addresses?userId=${encodeURIComponent(user.id)}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const addressList = Array.isArray(data) ? data : [];
        setAddresses(addressList);
        setStoreAddresses(addressList);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialAddresses && initialAddresses.length > 0) {
      setAddresses(initialAddresses);
    }
  }, [initialAddresses]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const resetForm = () => {
    setFormData({
      type: 'home',
      name: '',
      street: '',
      city: '',
      state: '',
      country: 'Nigeria',
      postalCode: '',
      phone: '',
      isDefault: addresses.length === 0
    });
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      type: address.type || 'home',
      name: address.name || '',
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      country: address.country || 'Nigeria',
      postalCode: address.postalCode || '',
      phone: address.phone || '',
      isDefault: Boolean(address.isDefault)
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (!formData.street?.trim() || !formData.city?.trim() || !formData.state?.trim()) {
      setError('Street address, city, and state are required.');
      setSubmitting(false);
      return;
    }

    try {
      const url = editingAddress ? `/api/addresses/${editingAddress.id}` : '/api/addresses';
      const method = editingAddress ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId: user?.id })
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        const msg = editingAddress ? 'Address updated successfully!' : 'Address added successfully!';
        setSuccess(msg);
        addNotification('success', msg);
        await fetchAddresses();
        resetForm();
        setShowForm(false);
        setEditingAddress(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorMsg = result.error || 'Failed to save address. Please try again.';
        setError(errorMsg);
        addNotification('error', errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred. Please try again.';
      setError(errorMsg);
      addNotification('error', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const response = await fetch(`/api/addresses/${id}?userId=${encodeURIComponent(user?.id || '')}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });

      if (response.ok) {
        setSuccess('Address deleted successfully!');
        addNotification('success', 'Address deleted successfully!');
        await fetchAddresses();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const result = await response.json().catch(() => ({}));
        const errorMsg = result.error || 'Failed to delete address';
        setError(errorMsg);
        addNotification('error', errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete address';
      setError(errorMsg);
      addNotification('error', errorMsg);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/addresses/${id}/default`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });

      if (response.ok) {
        setSuccess('Default address updated!');
        addNotification('success', 'Default address updated!');
        await fetchAddresses();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const result = await response.json().catch(() => ({}));
        const errorMsg = result.error || 'Failed to set default address';
        setError(errorMsg);
        addNotification('error', errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to set default address';
      setError(errorMsg);
      addNotification('error', errorMsg);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'home': return <Home className="w-4 h-4 text-[#1a2a8a] dark:text-blue-400" />;
      case 'office': return <Building className="w-4 h-4 text-[#1a2a8a] dark:text-blue-400" />;
      default: return <MapPin className="w-4 h-4 text-[#1a2a8a] dark:text-blue-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'home': return 'Home';
      case 'office': return 'Office';
      default: return type || 'Address';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-16 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a2a8a] dark:text-blue-400" />
        <span className="text-sm text-gray-500 dark:text-gray-400">Loading addresses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#1a2a8a] dark:text-blue-400" />
            Saved Addresses
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your delivery and billing addresses</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setEditingAddress(null);
              resetForm();
              setShowForm(true);
              setError('');
              setSuccess('');
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a2a8a] hover:bg-[#0f1a66] text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Address
          </button>
        )}
      </div>

      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
          <X className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            {editingAddress ? <Edit2 className="w-5 h-5 text-[#1a2a8a] dark:text-blue-400" /> : <Plus className="w-5 h-5 text-[#1a2a8a] dark:text-blue-400" />}
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-blue-500 outline-none transition-colors"
                >
                  <option value="home">Home</option>
                  <option value="office">Office / Business</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recipient Name / Label
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Home, Office, or Recipient Name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-blue-500 outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="House / building number, street name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-blue-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Ikeja, Lekki, Abuja"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-blue-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="e.g. Lagos, FCT Abuja, Rivers"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-blue-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-blue-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="Postal / ZIP code (optional)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-blue-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 08012345678"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-blue-500 outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 md:col-span-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#1a2a8a] border-gray-300 dark:border-gray-600 rounded focus:ring-[#1a2a8a] accent-[#1a2a8a] cursor-pointer"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                  Set as default delivery address
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-[#1a2a8a] text-white rounded-lg hover:bg-[#0f1a66] disabled:opacity-50 flex items-center gap-2 font-medium text-sm transition-colors shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{editingAddress ? 'Update Address' : 'Save Address'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingAddress(null);
                  resetForm();
                  setError('');
                }}
                className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 font-medium text-sm transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
          <MapPin className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No addresses saved yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Save your shipping addresses here for faster checkout on your solar equipment orders.
          </p>
          <button
            onClick={() => {
              setEditingAddress(null);
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a2a8a] hover:bg-[#0f1a66] text-white rounded-lg font-medium text-sm shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`rounded-xl p-5 transition-all bg-white dark:bg-gray-800 border ${
                address.isDefault
                  ? 'border-[#1a2a8a] dark:border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-md ring-1 ring-[#1a2a8a]/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                    {getTypeIcon(address.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white capitalize">
                        {getTypeLabel(address.type)}
                      </span>
                      {address.isDefault && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    {address.name && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{address.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Edit address"
                    aria-label="Edit address"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Delete address"
                    aria-label="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-sm pt-2 border-t border-gray-100 dark:border-gray-700/60">
                <p className="text-gray-700 dark:text-gray-300 font-medium">{address.street}</p>
                <p className="text-gray-600 dark:text-gray-400">
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span>{address.country}</span>
                </p>
                {address.phone && (
                  <p className="text-gray-600 dark:text-gray-400 text-xs flex items-center gap-1.5 pt-0.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <span>{address.phone}</span>
                  </p>
                )}
              </div>

              {!address.isDefault && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60">
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-xs font-semibold text-[#1a2a8a] dark:text-blue-400 hover:text-[#0f1a66] dark:hover:text-blue-300 transition-colors"
                  >
                    Set as Default
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}