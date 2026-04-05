'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { Address } from '@/types/auth';
import { useUserProfileStore } from '@/lib/stores/userStore';

interface AddressesContentProps {
  addresses: Address[];
}

const AddressesContent: React.FC<AddressesContentProps> = ({ addresses: initialAddresses }) => {
  const { user } = useAuthStore();
  const { addresses, addAddress, updateAddress, removeAddress, setDefaultAddress } = useUserProfileStore();
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<{
    type: 'home' | 'work' | 'other';
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone: string;
  }>({
    type: 'home',
    name: '',
    street: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: '',
    phone: ''
  });

  // Fetch addresses from database on mount
  useEffect(() => {
    fetchAddressesFromDB();
  }, [user]);

  const fetchAddressesFromDB = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/addresses?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        // Clear existing store and add fetched addresses
        addresses.forEach(addr => removeAddress(addr.id));
        data.forEach((addr: Address) => addAddress(addr));
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddAddress = async () => {
    if (!user) {
      console.error('No user logged in');
      return;
    }

    const newAddress = {
      ...addressForm,
      userId: user.id,
      isDefault: addresses.length === 0
    };

    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress)
      });

      if (response.ok) {
        const savedAddress = await response.json();
        addAddress(savedAddress);
        setIsAddingAddress(false);
        setAddressForm({
          type: 'home',
          name: '',
          street: '',
          city: '',
          state: '',
          country: 'Nigeria',
          postalCode: '',
          phone: ''
        });
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      type: address.type,
      name: address.name || '',
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode || '',
      phone: address.phone || ''
    });
  };

  const handleUpdateAddress = async () => {
    if (!editingAddress || !user) return;

    try {
      const response = await fetch('/api/addresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAddress.id,
          userId: user.id,
          ...addressForm,
          isDefault: editingAddress.isDefault
        })
      });

      if (response.ok) {
        const updatedAddress = await response.json();
        updateAddress(editingAddress.id, updatedAddress);
        setEditingAddress(null);
        setAddressForm({
          type: 'home',
          name: '',
          street: '',
          city: '',
          state: '',
          country: 'Nigeria',
          postalCode: '',
          phone: ''
        });
      }
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await fetch(`/api/addresses?id=${addressId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        removeAddress(addressId);
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/addresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: addressId,
          userId: user.id,
          isDefault: true
        })
      });

      if (response.ok) {
        setDefaultAddress(addressId);
      }
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const AddressForm: React.FC<{ onSubmit: () => void; onCancel: () => void; isEditing?: boolean }> = ({
    onSubmit,
    onCancel,
    isEditing = false
  }) => (
    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 mb-6">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
        {isEditing ? 'Edit Address' : 'Add New Address'}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address Type</label>
          <select
            value={addressForm.type}
            onChange={(e) => setAddressForm({...addressForm, type: e.target.value as "home" | "work" | "other"})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="home">Home</option>
            <option value="work">Work</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address Name (Optional)</label>
          <input
            type="text"
            value={addressForm.name}
            onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="e.g., Home, Office"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Street Address *</label>
          <input
            type="text"
            value={addressForm.street}
            onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="123 Main Street"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City *</label>
          <input
            type="text"
            value={addressForm.city}
            onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Lagos"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State *</label>
          <input
            type="text"
            value={addressForm.state}
            onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Lagos"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Postal Code</label>
          <input
            type="text"
            value={addressForm.postalCode}
            onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="100001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
          <input
            type="tel"
            value={addressForm.phone}
            onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="+234 800 000 0000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
          <input
            type="text"
            value={addressForm.country}
            onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="flex space-x-3 mt-6">
        <button
          onClick={onSubmit}
          className="bg-[#1a2a8a] hover:bg-[#0f1a66] dark:bg-green-400 dark:hover:bg-green-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {isEditing ? 'Update Address' : 'Save Address'}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Address Book</h3>
        <button
          onClick={() => setIsAddingAddress(true)}
          className="bg-[#1a2a8a] hover:bg-[#0f1a66] dark:bg-green-400 dark:hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Add New Address
        </button>
      </div>

      {isAddingAddress && (
        <AddressForm
          onSubmit={handleAddAddress}
          onCancel={() => setIsAddingAddress(false)}
        />
      )}

      {editingAddress && (
        <AddressForm
          onSubmit={handleUpdateAddress}
          onCancel={() => setEditingAddress(null)}
          isEditing
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <div key={address.id} className={`bg-white dark:bg-gray-700 rounded-xl p-6 border-2 ${
            address.isDefault ? 'border-[#1a2a8a] dark:border-green-400' : 'border-gray-200 dark:border-gray-600'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-900 dark:text-white capitalize">{address.type}</span>
              {address.isDefault && (
                <span className="bg-[#1a2a8a] dark:bg-green-400 text-white px-2 py-1 text-xs rounded-full">Default</span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{address.street}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{address.city}, {address.state} {address.postalCode}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{address.country}</p>
            {address.phone && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Phone: {address.phone}</p>
            )}
            <div className="flex space-x-3">
              <button
                onClick={() => handleEditAddress(address)}
                className="text-[#1a2a8a] dark:text-green-400 text-sm hover:underline"
              >
                Edit
              </button>
              {!address.isDefault && (
                <>
                  <button
                    onClick={() => handleDeleteAddress(address.id.toString())}
                    className="text-red-500 dark:text-red-400 text-sm hover:underline"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleSetDefaultAddress(address.id.toString())}
                    className="text-gray-500 dark:text-gray-400 text-sm hover:underline"
                  >
                    Set as Default
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {addresses.length === 0 && !isAddingAddress && (
        <div className="text-center py-12 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
          <div className="text-6xl mb-4">🏠</div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No addresses saved</h4>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Add your first address to get started</p>
          <button
            onClick={() => setIsAddingAddress(true)}
            className="bg-[#1a2a8a] hover:bg-[#0f1a66] dark:bg-green-400 dark:hover:bg-green-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Add Your First Address
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressesContent;
