'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { useUserProfileStore } from '@/lib/stores/userStore';
import { useCartStore } from '@/lib/stores/cartStore';
import { useServiceStore } from '@/lib/stores/serviceStore';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import Link from 'next/link';
import { formatCurrency } from '@/utils';
import { Address } from '@/types/auth';
import AccessorySelectionPopup from '@/components/features/cart/AccessorySelectionPopup';
import { 
  Package, 
  Wrench, 
  Settings, 
  Trash2, 
  Plus, 
  Minus, 
  Edit, 
  ArrowLeft,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

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
  paymentMethod: 'bank_transfer' | 'pay_on_delivery';
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const {
    items,
    accessories,
    removeItem,
    updateQuantity,
    addAccessory,
    removeAccessory,
    updateAccessoryQuantity,
    setService,
    clearCart,
    editingOrderId,
    editingOrderNumber,
    cancelEditingOrder,
    finishEditingOrder,
    editingShippingAddress,
    editingPaymentMethod
  } = useCartStore();

  const { services, fetchServices } = useServiceStore();
  const { addNotification } = useNotificationStore();

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAccessoryPopup, setShowAccessoryPopup] = useState(false);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Calculate totals separated by Phase 1, Phase 2, Phase 3
  const productItems = items.filter(i => i.type !== 'service' && i.serviceId == null);
  const serviceItems = items.filter(i => i.type === 'service' || i.serviceId != null);

  const productTotal = productItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const serviceTotal = serviceItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const accessoriesTotal = accessories.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);

  const combinedSubtotal = productTotal + serviceTotal + accessoriesTotal;
  const shipping = 15000;
  const tax = combinedSubtotal * 0.08;
  const total = combinedSubtotal + shipping + tax;

  const currentService = serviceItems[0] || null;

  // Form state
  const [formData, setFormData] = useState<CheckoutFormData>({
    selectedAddressId: null,
    useNewAddress: false,
    shippingAddress: {
      name: user ? `${user.firstName} ${user.lastName}`.trim() : '',
      street: '',
      city: '',
      state: '',
      country: 'Nigeria',
      postalCode: '',
      phone: user?.phone || ''
    },
    paymentMethod: 'bank_transfer'
  });

  // Check if cart is empty and redirect
  useEffect(() => {
    if (items.length === 0 && accessories.length === 0) {
      addNotification('warning', 'Your cart is empty');
      router.push('/');
    }
  }, [items.length, accessories.length]);

  // If not authenticated, redirect to home (auth modal will trigger)
  useEffect(() => {
    if (!isAuthenticated) {
      addNotification('warning', 'Please sign in to checkout');
      localStorage.setItem('checkout_redirect', '/checkout');
      router.push('/');
    }
  }, [isAuthenticated]);

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/addresses?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setSavedAddresses(data);
          const defaultAddress = data.find((addr: Address) => addr.isDefault) || data[0];
          if (!editingOrderId) {
            if (defaultAddress) {
              setFormData(prev => ({
                ...prev,
                selectedAddressId: defaultAddress.id,
                useNewAddress: false
              }));
            } else {
              setFormData(prev => ({
                ...prev,
                selectedAddressId: null,
                useNewAddress: true
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [user, editingOrderId]);

  // Sync user phone and name into form data when user is loaded
  useEffect(() => {
    if (user && !editingOrderId) {
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          name: prev.shippingAddress.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Customer',
          phone: prev.shippingAddress.phone || user.phone || ''
        }
      }));
    }
  }, [user, editingOrderId]);

  // If editing an existing order, pre-populate shipping address and payment method
  useEffect(() => {
    if (editingOrderId) {
      setFormData(prev => ({
        ...prev,
        useNewAddress: true,
        selectedAddressId: null,
        shippingAddress: {
          name: editingShippingAddress?.name || (user ? `${user.firstName} ${user.lastName}`.trim() : 'Customer'),
          street: editingShippingAddress?.street || '',
          city: editingShippingAddress?.city || '',
          state: editingShippingAddress?.state || '',
          country: editingShippingAddress?.country || 'Nigeria',
          postalCode: editingShippingAddress?.postalCode || '',
          phone: editingShippingAddress?.phone || user?.phone || ''
        },
        paymentMethod: (editingPaymentMethod as any) || prev.paymentMethod
      }));
    }
  }, [editingOrderId, editingShippingAddress, editingPaymentMethod, user]);

  const handleAddressSelect = (addressId: string) => {
    const address = savedAddresses.find(a => a.id === addressId);
    if (address) {
      setFormData(prev => ({
        ...prev,
        selectedAddressId: addressId,
        useNewAddress: false
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.startsWith('shipping.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Product actions
  const handleUpdateProductQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId, 'product');
      addNotification('info', 'Product removed from order');
      return;
    }
    updateQuantity(productId, newQuantity, 'product');
  };

  const handleRemoveProduct = (productId: number) => {
    removeItem(productId, 'product');
    addNotification('info', 'Product removed from order');
  };

  // Accessory actions
  const handleUpdateAccessoryQuantity = (accessoryId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeAccessory(accessoryId);
      addNotification('info', 'Accessory removed from order');
      return;
    }
    updateAccessoryQuantity(accessoryId, newQuantity);
  };

  const handleRemoveAccessory = (accessoryId: number) => {
    removeAccessory(accessoryId);
    addNotification('info', 'Accessory removed from order');
  };

  // Service actions
  const handleServiceSelect = (serviceIdStr: string) => {
    if (serviceIdStr === 'none') {
      setService(null);
      addNotification('info', 'Service removed from order');
      return;
    }

    const selected = services.find(s => s.id.toString() === serviceIdStr);
    if (selected) {
      setService(selected, 1);
      addNotification('success', `Selected ${selected.name}`);
    }
  };

  const handleUpdateServiceQuantity = (newQuantity: number) => {
    if (newQuantity < 1) {
      setService(null);
      addNotification('info', 'Service removed from order');
      return;
    }
    if (currentService) {
      updateQuantity(currentService.id, newQuantity, 'service');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate form
      let shippingAddress;

      if (formData.selectedAddressId && !formData.useNewAddress) {
        const selected = savedAddresses.find(a => a.id === formData.selectedAddressId);
        if (!selected) {
          setError('Please select a valid address');
          setIsSubmitting(false);
          return;
        }
        shippingAddress = selected;
      } else {
        if (!formData.shippingAddress.street && !formData.shippingAddress.city) {
          setError('Please provide a shipping address');
          setIsSubmitting(false);
          return;
        }
        shippingAddress = formData.shippingAddress;
      }

      // Build order data
      const orderItems = items.map((item, index) => {
        const isService = item.type === 'service' || item.serviceId != null;
        return {
          productId: isService ? undefined : (item.productId || item.id),
          serviceId: isService ? (item.serviceId || item.id) : undefined,
          name: item.title,
          title: item.title,
          price: Number(item.price),
          quantity: Number(item.quantity),
          image: item.image || '',
          type: isService ? ('service' as const) : ('product' as const),
          lineItemId: `${isService ? 'service' : 'product'}_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
        };
      });

      const orderAccessories = accessories.map((a) => ({
        accessoryId: Number((a as any).accessoryId || a.id || 0),
        name: a.title || '',
        quantity: Number(a.quantity || 1),
        unit_price: Number(a.price || 0),
        total_price: Number(a.price || 0) * Number(a.quantity || 1),
        unit: (a as any)?.unit || 'piece'
      }));

      const activeServices = orderItems.filter(i => i.type === 'service');
      const serviceTotalCalc = activeServices.reduce((sum, s) => sum + (Number(s.price) * Number(s.quantity)), 0);

      const orderData = {
        userId: user?.id,
        customerName: shippingAddress.name || user?.firstName || 'Customer',
        customerPhone: shippingAddress.phone || user?.phone || '',
        customerEmail: user?.email || '',
        items: orderItems,
        accessories: orderAccessories,
        subtotal: combinedSubtotal,
        shipping: shipping,
        tax: tax,
        total: total,
        status: 'pending',
        paymentMethod: formData.paymentMethod || 'bank_transfer',
        notes: '',
        shippingAddress: shippingAddress,
        hasService: activeServices.length > 0,
        serviceId: activeServices[0]?.serviceId || null,
        serviceName: activeServices[0]?.name || null,
        servicePrice: serviceTotalCalc
      };

      let response;
      if (editingOrderId) {
        response = await fetch(`/api/orders/${editingOrderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
      } else {
        response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || (editingOrderId ? 'Failed to update order' : 'Failed to place order'));
      }

      if (editingOrderId) {
        const updatedNumber = result.orderNumber || result.id || editingOrderNumber || editingOrderId;
        useUserProfileStore.getState().updateOrder(result);
        finishEditingOrder();
        addNotification('success', `Order #${updatedNumber} updated successfully!`);
        router.refresh();
      } else {
        clearCart();
        addNotification('success', `Order #${result.id} placed successfully!`);
      }
      router.push('/account?tab=orders');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && accessories.length === 0) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingOrderId ? `Edit Order #${editingOrderNumber || editingOrderId}` : 'Checkout'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Review and edit equipment, accessories, services, and shipping details.
            </p>
          </div>
          <Link href="/cart" className="text-sm text-[#1a2a8a] dark:text-green-400 hover:underline flex items-center gap-1 font-medium">
            <ArrowLeft className="w-4 h-4" /> Open Full Cart
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {editingOrderId && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1a2a8a] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-blue-950 dark:text-blue-200">
                  Editing Order #{editingOrderNumber || editingOrderId}
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  You are modifying this pending order. Changes to products, quantities, accessories, services, and address will update the existing order without creating a duplicate.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                cancelEditingOrder();
                addNotification('info', 'Order editing cancelled. Cart reverted.');
                router.push('/account?tab=orders');
              }}
              className="px-4 py-2 text-xs font-semibold text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg border border-blue-300 dark:border-blue-700 transition-colors self-start sm:self-center"
            >
              Cancel Editing
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">

            {/* INTERACTIVE ORDER ITEMS & PHASES EDITOR */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Order Items & Configuration
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Directly edit products, accessories, and services included in this order.
                  </p>
                </div>
                <Link
                  href="/cart"
                  className="text-xs font-semibold text-[#1a2a8a] dark:text-green-400 hover:underline flex items-center gap-1"
                >
                  Cart View <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {/* PHASE 1: PRODUCTS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/40 text-[#1a2a8a] dark:text-blue-400 font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                      Phase 1 — Products ({productItems.length})
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(productTotal)}
                    </span>
                    <Link
                      href="/products"
                      className="text-xs text-[#1a2a8a] dark:text-green-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Product
                    </Link>
                  </div>
                </div>

                {productItems.length === 0 ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-center text-xs text-gray-500">
                    No products in order. <Link href="/products" className="text-[#1a2a8a] dark:text-green-400 underline">Add products</Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700 space-y-2">
                    {productItems.map((item) => (
                      <div key={`p-${item.id}`} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <img
                            src={item.image || '/placeholder-image.png'}
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded-md border border-gray-200 dark:border-gray-700 flex-shrink-0"
                            onError={(e) => { e.currentTarget.src = '/placeholder-image.png'; }}
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              {formatCurrency(Number(item.price))} each
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/50">
                            <button
                              type="button"
                              onClick={() => handleUpdateProductQuantity(item.id, Number(item.quantity) - 1)}
                              className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold text-gray-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateProductQuantity(item.id, Number(item.quantity) + 1)}
                              className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white min-w-[70px] text-right">
                            {formatCurrency(Number(item.price) * Number(item.quantity))}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(item.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded"
                            title="Remove product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PHASE 2: ACCESSORIES */}
              <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-[#40b553] dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                      Phase 2 — Accessories ({accessories.length})
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(accessoriesTotal)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAccessoryPopup(true)}
                      className="text-xs text-[#40b553] dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-3 h-3" /> Add Accessories
                    </button>
                  </div>
                </div>

                {accessories.length === 0 ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-center text-xs text-gray-500">
                    No accessories added.{' '}
                    <button
                      type="button"
                      onClick={() => setShowAccessoryPopup(true)}
                      className="text-[#40b553] dark:text-emerald-400 underline font-semibold"
                    >
                      + Add Accessories (Breakers, Cables, Combiner Boxes)
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700 space-y-2">
                    {accessories.map((acc) => (
                      <div key={`a-${acc.id}`} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {acc.image ? (
                            <img
                              src={acc.image}
                              alt={acc.title}
                              className="w-10 h-10 object-cover rounded-md border border-gray-200 dark:border-gray-700 flex-shrink-0"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                              <Wrench className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                              {acc.title}
                            </h4>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              {formatCurrency(Number(acc.price))} / {(acc as any).unit || 'piece'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/50">
                            <button
                              type="button"
                              onClick={() => handleUpdateAccessoryQuantity(acc.id, Number(acc.quantity) - 1)}
                              className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold text-gray-900 dark:text-white">
                              {acc.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateAccessoryQuantity(acc.id, Number(acc.quantity) + 1)}
                              className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white min-w-[70px] text-right">
                            {formatCurrency(Number(acc.price) * Number(acc.quantity))}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveAccessory(acc.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded"
                            title="Remove accessory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PHASE 3: SERVICES */}
              <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                      Phase 3 — Services & Installation
                    </h3>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(serviceTotal)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-purple-50/60 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/50 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-purple-900 dark:text-purple-200 font-medium">
                    <Settings className="w-3.5 h-3.5 text-purple-600" />
                    <span>Select Service:</span>
                  </div>
                  <select
                    value={currentService ? currentService.serviceId || currentService.id : 'none'}
                    onChange={(e) => handleServiceSelect(e.target.value)}
                    className="px-2.5 py-1 text-xs bg-white dark:bg-gray-700 border border-purple-300 dark:border-purple-700 rounded-md text-gray-900 dark:text-white focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="none">No Service Selected</option>
                    {services.filter(s => s.isActive).map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} — {formatCurrency(Number(service.price))}
                      </option>
                    ))}
                  </select>
                </div>

                {currentService && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {currentService.title}
                      </h4>
                      <p className="text-[11px] text-purple-700 dark:text-purple-300">
                        {formatCurrency(Number(currentService.price))} each
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-purple-300 dark:border-purple-700 rounded-md bg-white dark:bg-gray-800">
                        <button
                          type="button"
                          onClick={() => handleUpdateServiceQuantity(Number(currentService.quantity) - 1)}
                          className="px-2 py-1 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-gray-900 dark:text-white">
                          {currentService.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateServiceQuantity(Number(currentService.quantity) + 1)}
                          className="px-2 py-1 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white min-w-[70px] text-right">
                        {formatCurrency(Number(currentService.price) * Number(currentService.quantity))}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleServiceSelect('none')}
                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                        title="Remove service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SHIPPING ADDRESS */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Shipping Address</h2>

              {savedAddresses.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select saved address
                  </label>
                  <select
                    value={formData.selectedAddressId || ''}
                    onChange={(e) => {
                      if (e.target.value === 'new') {
                        setFormData(prev => ({ ...prev, useNewAddress: true, selectedAddressId: null }));
                      } else {
                        handleAddressSelect(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select an address</option>
                    {savedAddresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.name || addr.type} - {addr.city}, {addr.state}
                        {addr.isDefault ? ' (Default)' : ''}
                      </option>
                    ))}
                    <option value="new">+ Add new address</option>
                  </select>
                </div>
              )}

              {(formData.useNewAddress || savedAddresses.length === 0) && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="shipping.name"
                        value={formData.shippingAddress.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                      <input
                        type="tel"
                        name="shipping.phone"
                        value={formData.shippingAddress.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address *</label>
                    <input
                      type="text"
                      name="shipping.street"
                      value={formData.shippingAddress.street}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
                      <input
                        type="text"
                        name="shipping.city"
                        value={formData.shippingAddress.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State *</label>
                      <input
                        type="text"
                        name="shipping.state"
                        value={formData.shippingAddress.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                    <input
                      type="text"
                      name="shipping.country"
                      value={formData.shippingAddress.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* PAYMENT METHOD */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={formData.paymentMethod === 'bank_transfer'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#1a2a8a] dark:text-green-400"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bank Transfer</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="pay_on_delivery"
                    checked={formData.paymentMethod === 'pay_on_delivery'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#1a2a8a] dark:text-green-400"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pay on Delivery</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md text-base"
            >
              {isSubmitting
                ? (editingOrderId ? 'Updating Order...' : 'Placing Order...')
                : (editingOrderId ? 'Update Order' : 'Place Order')}
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingOrderId ? 'Order Summary (Editing)' : 'Order Summary'}
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Phase 1 — Products</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(productTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Phase 2 — Accessories</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(accessoriesTotal)}</span>
                </div>
                {serviceTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Phase 3 — Services</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(serviceTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Tax (8%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(tax)}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-[#1a2a8a] dark:text-green-400">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {editingOrderId 
                    ? 'Submitting will immediately update the items and details of this order in the database.'
                    : 'You will be redirected to payment after placing your order.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accessories Selection Popup */}
      <AccessorySelectionPopup
        isOpen={showAccessoryPopup}
        onClose={() => setShowAccessoryPopup(false)}
        onAddToOrder={(selectedItems) => {
          selectedItems.forEach((item) => {
            addAccessory({
              id: item.id,
              name: item.name,
              price: item.price,
              stock: item.stock || 0,
              image: item.image || '',
              unit: (item as any)?.unit || 'piece',
              isActive: true
            }, item.quantity);
          });
          addNotification('success', `Added ${selectedItems.length} accessories to order`);
        }}
      />
    </div>
  );
}
