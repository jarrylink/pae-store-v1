'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { useCartStore } from '@/lib/stores/cartStore';
import Link from 'next/link';
import { formatCurrency } from '@/utils';
import { Address } from '@/types/auth';

// Form interfaces
interface CheckoutFormData {
  selectedAddressId: string | null;
  useNewAddress: boolean;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone: string;
  };
  billingAddress: {
    sameAsShipping: boolean;
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  paymentMethod: 'card' | 'bank_transfer' | 'pay_on_delivery';
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { items, installationType, getTotal, clearCart } = useCartStore();
  
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 15000; // Fixed shipping for now
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  // Form state
  const [formData, setFormData] = useState<CheckoutFormData>({
    selectedAddressId: null,
    useNewAddress: false,
    shippingAddress: {
      name: user ? `${user.firstName} ${user.lastName}` : '',
      street: '',
      city: '',
      state: '',
      country: 'Nigeria',
      postalCode: '',
      phone: ''
    },
    billingAddress: {
      sameAsShipping: true,
      name: '',
      street: '',
      city: '',
      state: '',
      country: 'Nigeria',
      postalCode: ''
    },
    paymentMethod: 'bank_transfer'
  });

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`/api/addresses?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setSavedAddresses(data);
          
          // Auto-select default address if exists
          const defaultAddress = data.find((addr: Address) => addr.isDefault);
          if (defaultAddress) {
            handleAddressSelect(defaultAddress.id);
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [user]);

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      router.push('/cart');
    }
  }, [isAuthenticated, items.length, router]);

  const handleAddressSelect = (addressId: string) => {
    const selected = savedAddresses.find(addr => addr.id === addressId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        selectedAddressId: addressId,
        useNewAddress: false,
        shippingAddress: {
          name: selected.name || `${user?.firstName} ${user?.lastName}`,
          street: selected.street,
          city: selected.city,
          state: selected.state,
          country: selected.country,
          postalCode: selected.postalCode,
          phone: selected.phone || user?.phone || ''
        }
      }));
    }
  };

  const handleUseNewAddress = () => {
    setFormData(prev => ({
      ...prev,
      selectedAddressId: null,
      useNewAddress: true,
      shippingAddress: {
        name: user ? `${user.firstName} ${user.lastName}` : '',
        street: '',
        city: '',
        state: '',
        country: 'Nigeria',
        postalCode: '',
        phone: user?.phone || ''
      }
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          sameAsShipping: checked
        }
      }));
    } else if (name.startsWith('shipping.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [field]: value
        }
      }));
    } else if (name.startsWith('billing.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form
      if (!formData.shippingAddress.name.trim() ||
          !formData.shippingAddress.street.trim() ||
          !formData.shippingAddress.city.trim() ||
          !formData.shippingAddress.phone.trim()) {
        throw new Error('Please fill in all required shipping information');
      }

      // Prepare order data
      const orderItems = items.map(item => ({
        productId: item.id,
        name: item.brand || item.title,
        title: item.title,
        brand: item.brand,
        spec: item.spec,
        capacity: item.capacity,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        lineItemId: `li_${Date.now()}_${item.id}_${Math.random().toString(36).substr(2, 9)}`
      }));

      // Create shipping address object (matches Address type but without id)
      const shippingAddress = {
        ...formData.shippingAddress,
        type: 'home' as const,
        userId: user!.id,
        isDefault: false
      };

      // Create billing address
      const billingAddress = formData.billingAddress.sameAsShipping
        ? { ...shippingAddress, isDefault: false }
        : {
            ...formData.billingAddress,
            type: 'home' as const,
            userId: user!.id,
            phone: formData.shippingAddress.phone,
            isDefault: false
          };

      const orderData = {
        userId: user!.id,
        customerName: formData.shippingAddress.name,
        customerPhone: formData.shippingAddress.phone,
        customerEmail: user!.email,
        items: orderItems,
        subtotal,
        shipping,
        tax,
        total,
        shippingAddress,
        billingAddress,
        paymentMethod: formData.paymentMethod,
        status: 'pending'
      };

      console.log('Submitting order:', orderData);

      // Create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order');
      }

      // Clear cart and redirect to order confirmation
      clearCart();
      router.push(`/orders/${result.id}?success=true`);

    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your cart is empty</h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Add some products to your cart before checking out.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Complete your purchase securely
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column: Shipping & Payment */}
            <div className="lg:col-span-2 space-y-8">
              {/* Saved Addresses Section */}
              {!loadingAddresses && savedAddresses.length > 0 && !formData.useNewAddress && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Select Shipping Address</h2>
                  <div className="space-y-3 mb-4">
                    {savedAddresses.map((address) => (
                      <label
                        key={address.id}
                        className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                          formData.selectedAddressId === address.id
                            ? 'border-[#1a2a8a] dark:border-green-400 bg-blue-50 dark:bg-green-900/10'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedAddress"
                          value={address.id}
                          checked={formData.selectedAddressId === address.id}
                          onChange={() => handleAddressSelect(address.id)}
                          className="mt-1 w-4 h-4 text-[#1a2a8a] dark:text-green-400"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 dark:text-white capitalize">
                              {address.type} {address.isDefault && '(Default)'}
                            </span>
                            {address.name && (
                              <span className="text-sm text-gray-500 dark:text-gray-400">{address.name}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {address.street}<br />
                            {address.city}, {address.state} {address.postalCode}<br />
                            {address.country}
                          </p>
                          {address.phone && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Phone: {address.phone}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleUseNewAddress}
                    className="text-[#1a2a8a] dark:text-green-400 text-sm hover:underline"
                  >
                    + Use a different address
                  </button>
                </div>
              )}

              {/* New Address Form (shown when no saved addresses or user clicks "Use new address") */}
              {(savedAddresses.length === 0 || formData.useNewAddress) && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {formData.useNewAddress ? 'Enter New Address' : 'Shipping Information'}
                    </h2>
                    {formData.useNewAddress && savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const defaultAddress = savedAddresses.find(addr => addr.isDefault);
                          if (defaultAddress) {
                            handleAddressSelect(defaultAddress.id);
                          } else {
                            setFormData(prev => ({ ...prev, useNewAddress: false, selectedAddressId: savedAddresses[0]?.id || null }));
                          }
                        }}
                        className="text-[#1a2a8a] dark:text-green-400 text-sm hover:underline"
                      >
                        ← Back to saved addresses
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="shipping.name"
                        value={formData.shippingAddress.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="shipping.street"
                        value={formData.shippingAddress.street}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="shipping.city"
                        value={formData.shippingAddress.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="shipping.state"
                        value={formData.shippingAddress.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="shipping.postalCode"
                        value={formData.shippingAddress.postalCode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="shipping.phone"
                        value={formData.shippingAddress.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="+234 800 000 0000"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Billing Information</h2>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="billing.sameAsShipping"
                      checked={formData.billingAddress.sameAsShipping}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Same as shipping address
                    </span>
                  </label>
                </div>

                {!formData.billingAddress.sameAsShipping && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Billing Name *
                      </label>
                      <input
                        type="text"
                        name="billing.name"
                        value={formData.billingAddress.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Billing Street Address *
                      </label>
                      <input
                        type="text"
                        name="billing.street"
                        value={formData.billingAddress.street}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="billing.city"
                        value={formData.billingAddress.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="billing.state"
                        value={formData.billingAddress.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Payment Method</h2>
                <div className="space-y-4">
                  <label className="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === 'bank_transfer'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-4">
                      <span className="font-medium text-gray-900 dark:text-white">Bank Transfer</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Transfer to our bank account</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-4">
                      <span className="font-medium text-gray-900 dark:text-white">Credit/Debit Card</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Pay securely with your card</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="pay_on_delivery"
                      checked={formData.paymentMethod === 'pay_on_delivery'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-4">
                      <span className="font-medium text-gray-900 dark:text-white">Pay on Delivery</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Pay when you receive your order</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right column: Order Summary (unchanged) */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Order Summary</h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="w-16 h-16 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">{item.title}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(item.price)} × {item.quantity}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax (8%)</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-700 pt-4">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </button>

                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                  By placing your order, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
