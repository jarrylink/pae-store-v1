'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/stores/cartStore';
import { useServiceStore } from '@/lib/stores/serviceStore';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import { formatCurrency } from '@/utils';
import AccessorySelectionPopup from '@/components/features/cart/AccessorySelectionPopup';
import { useAuthStore } from '@/lib/stores/authStore';
import { useUserProfileStore } from '@/lib/stores/userStore';
import { 
  Package, 
  Wrench, 
  Settings, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  ArrowRight, 
  ArrowLeft,
  Edit,
  AlertCircle,
  Check
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuthStore();
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

  const [showAccessoryPopup, setShowAccessoryPopup] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);

  const handleSaveOrderChanges = async () => {
    if (!editingOrderId) return;
    setIsSavingChanges(true);

    try {
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
        items: orderItems,
        accessories: orderAccessories,
        subtotal: grandTotal,
        hasService: activeServices.length > 0,
        serviceId: activeServices[0]?.serviceId || null,
        serviceName: activeServices[0]?.name || null,
        servicePrice: serviceTotalCalc,
        shippingAddress: editingShippingAddress,
        paymentMethod: editingPaymentMethod || 'bank_transfer'
      };

      const response = await fetch(`/api/orders/${editingOrderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update order');
      }

      useUserProfileStore.getState().updateOrder(result);
      const updatedNumber = result.orderNumber || result.id || editingOrderNumber || editingOrderId;
      finishEditingOrder();
      addNotification('success', `Order #${updatedNumber} updated successfully!`);
      router.refresh();
      router.push('/account?tab=orders');
    } catch (err: any) {
      console.error('Error saving order changes from cart:', err);
      addNotification('error', err.message || 'Failed to save order changes');
    } finally {
      setIsSavingChanges(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Separate items into Phase 1 Products and Phase 3 Services
  const productItems = items.filter(i => i.type !== 'service' && i.serviceId == null);
  const serviceItems = items.filter(i => i.type === 'service' || i.serviceId != null);

  const productTotal = productItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const accessoriesTotal = accessories.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const serviceTotal = serviceItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const grandTotal = productTotal + accessoriesTotal + serviceTotal;

  const currentService = serviceItems[0] || null;

  const handleUpdateProductQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId, 'product');
      addNotification('info', 'Product removed from cart');
      return;
    }
    updateQuantity(productId, newQuantity, 'product');
  };

  const handleRemoveProduct = (productId: number) => {
    removeItem(productId, 'product');
    addNotification('info', 'Product removed from cart');
  };

  const handleUpdateAccessoryQuantity = (accessoryId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeAccessory(accessoryId);
      addNotification('info', 'Accessory removed from cart');
      return;
    }
    updateAccessoryQuantity(accessoryId, newQuantity);
  };

  const handleRemoveAccessory = (accessoryId: number) => {
    removeAccessory(accessoryId);
    addNotification('info', 'Accessory removed from cart');
  };

  const handleServiceSelect = (serviceIdStr: string) => {
    if (serviceIdStr === 'none') {
      setService(null);
      addNotification('info', 'Service removed from order');
      return;
    }

    const selected = services.find(s => s.id.toString() === serviceIdStr);
    if (selected) {
      setService(selected, 1);
      addNotification('success', `Added ${selected.name} to order`);
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

  const handleClearCart = () => {
    if (items.length === 0 && accessories.length === 0) return;
    clearCart();
    addNotification('info', 'Cart cleared');
  };

  const isCartEmpty = productItems.length === 0 && accessories.length === 0 && serviceItems.length === 0;

  if (isCartEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-3xl">
            🛒
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Your Cart is Empty</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {editingOrderId 
              ? `You removed all items from Order #${editingOrderNumber || editingOrderId}. You can cancel or add new equipment.`
              : 'Looks like you haven\'t added any solar equipment or accessories yet.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Browse Solar Products
            </Link>
            {editingOrderId && (
              <button
                type="button"
                onClick={() => {
                  cancelEditingOrder();
                  addNotification('info', 'Order editing cancelled. Cart reverted.');
                  router.push('/account?tab=orders');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 rounded-xl font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              >
                Cancel Editing Order
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editing Order Alert Banner */}
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
                  You are editing this pending order. Update quantities, add/remove accessories, or switch services below, then proceed to checkout to save your changes.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => {
                  cancelEditingOrder();
                  addNotification('info', 'Order editing cancelled. Cart reverted.');
                  router.push('/account?tab=orders');
                }}
                className="px-4 py-2 text-xs font-semibold text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg border border-blue-300 dark:border-blue-700 transition-colors"
              >
                Cancel Editing
              </button>
              <button
                type="button"
                onClick={handleSaveOrderChanges}
                disabled={isSavingChanges}
                className="px-4 py-2 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                {isSavingChanges ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href="/checkout"
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
              >
                Edit Address & Pay →
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {editingOrderId ? `Edit Order #${editingOrderNumber || editingOrderId}` : 'Shopping Cart'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Review and configure Phase 1 (Products), Phase 2 (Accessories), and Phase 3 (Services).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center text-sm font-medium text-[#1a2a8a] dark:text-green-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Continue Shopping
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Items Area */}
          <div className="lg:col-span-2 space-y-6">

            {/* PHASE 1 — PRODUCTS */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-[#1a2a8a] dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      Phase 1 — Products
                      <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                        ({productItems.length} item{productItems.length !== 1 ? 's' : ''})
                      </span>
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(productTotal)}
                  </span>
                  <Link
                    href="/products"
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-[#1a2a8a] dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Products
                  </Link>
                </div>
              </div>

              {productItems.length === 0 ? (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm">No products in this order.</p>
                  <Link
                    href="/products"
                    className="mt-2 inline-flex items-center text-xs font-medium text-[#1a2a8a] dark:text-green-400 hover:underline"
                  >
                    + Browse Catalog to Add Equipment
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700/50 mt-4 space-y-4">
                  {productItems.map((item) => (
                    <div key={`product-${item.id}`} className="pt-4 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <img
                          src={item.image || '/placeholder-image.png'}
                          alt={item.title}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700 flex-shrink-0"
                          onError={(e) => { e.currentTarget.src = '/placeholder-image.png'; }}
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {item.title}
                          </h3>
                          {(item.brand || item.spec) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {[item.brand, item.spec].filter(Boolean).join(' • ')}
                            </p>
                          )}
                          <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                            {formatCurrency(Number(item.price))} each
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6">
                        {/* Stepper */}
                        <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700/50">
                          <button
                            type="button"
                            onClick={() => handleUpdateProductQuantity(item.id, Number(item.quantity) - 1)}
                            className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val)) handleUpdateProductQuantity(item.id, val);
                            }}
                            className="w-12 text-center text-sm font-semibold bg-transparent text-gray-900 dark:text-white border-0 focus:ring-0 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateProductQuantity(item.id, Number(item.quantity) + 1)}
                            className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Line Total & Remove */}
                        <div className="text-right flex items-center gap-3">
                          <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white min-w-[80px]">
                            {formatCurrency(Number(item.price) * Number(item.quantity))}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Remove product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PHASE 2 — ACCESSORIES */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-[#40b553] dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      Phase 2 — Accessories
                      <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                        ({accessories.length} item{accessories.length !== 1 ? 's' : ''})
                      </span>
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(accessoriesTotal)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAccessoryPopup(true)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-[#40b553] dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Accessories
                  </button>
                </div>
              </div>

              {accessories.length === 0 ? (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  <Wrench className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm">No accessories attached to this order.</p>
                  <button
                    type="button"
                    onClick={() => setShowAccessoryPopup(true)}
                    className="mt-2 inline-flex items-center text-xs font-semibold text-[#40b553] dark:text-emerald-400 hover:underline"
                  >
                    + Open Accessories Catalog (Breakers, Cables, Combiner Boxes)
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700/50 mt-4 space-y-4">
                  {accessories.map((acc) => (
                    <div key={`acc-${acc.id}`} className="pt-4 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        {acc.image ? (
                          <img
                            src={acc.image}
                            alt={acc.title}
                            className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700 flex-shrink-0"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <Wrench className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                            {acc.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {formatCurrency(Number(acc.price))} per {(acc as any).unit || 'piece'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6">
                        {/* Stepper */}
                        <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700/50">
                          <button
                            type="button"
                            onClick={() => handleUpdateAccessoryQuantity(acc.id, Number(acc.quantity) - 1)}
                            className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={acc.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val)) handleUpdateAccessoryQuantity(acc.id, val);
                            }}
                            className="w-12 text-center text-sm font-semibold bg-transparent text-gray-900 dark:text-white border-0 focus:ring-0 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateAccessoryQuantity(acc.id, Number(acc.quantity) + 1)}
                            className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Line Total & Remove */}
                        <div className="text-right flex items-center gap-3">
                          <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white min-w-[80px]">
                            {formatCurrency(Number(acc.price) * Number(acc.quantity))}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAccessory(acc.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Remove accessory"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PHASE 3 — SERVICES */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      Phase 3 — Services & Installation
                    </h2>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(serviceTotal)}
                  </span>
                </div>
              </div>

              {/* Service Selection Dropdown */}
              <div className="mt-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-purple-50/60 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/50 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-purple-900 dark:text-purple-200 font-medium">
                    <Settings className="w-4 h-4 text-purple-600" />
                    <span>Choose Professional Service / Upgrade:</span>
                  </div>
                  <select
                    value={currentService ? currentService.serviceId || currentService.id : 'none'}
                    onChange={(e) => handleServiceSelect(e.target.value)}
                    className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-purple-300 dark:border-purple-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="none">No Service Selected</option>
                    {services.filter(s => s.isActive).map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} — {formatCurrency(Number(service.price))}
                      </option>
                    ))}
                  </select>
                </div>

                {/* If a service is active, display its editable details */}
                {currentService && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                        <Settings className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                          {currentService.title}
                        </h4>
                        <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">
                          Professional labor & installation service • {formatCurrency(Number(currentService.price))} each
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-purple-300 dark:border-purple-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                        <button
                          type="button"
                          onClick={() => handleUpdateServiceQuantity(Number(currentService.quantity) - 1)}
                          className="px-3 py-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-gray-900 dark:text-white">
                          {currentService.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateServiceQuantity(Number(currentService.quantity) + 1)}
                          className="px-3 py-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Total & Remove */}
                      <div className="text-right flex items-center gap-3">
                        <span className="text-base font-bold text-gray-900 dark:text-white min-w-[80px]">
                          {formatCurrency(Number(currentService.price) * Number(currentService.quantity))}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleServiceSelect('none')}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Remove service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {editingOrderId ? 'Order Summary (Editing)' : 'Cart Summary'}
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Phase 1 — Products</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatCurrency(productTotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Phase 2 — Accessories</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatCurrency(accessoriesTotal)}
                  </span>
                </div>

                {serviceTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Phase 3 — Services</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatCurrency(serviceTotal)}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-bold text-gray-900 dark:text-white">Subtotal</span>
                    <span className="text-xl font-bold text-[#1a2a8a] dark:text-green-400">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Shipping & tax calculated at final checkout.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {editingOrderId ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleSaveOrderChanges}
                      disabled={isSavingChanges}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors shadow-md text-center disabled:opacity-50 text-base"
                    >
                      <Check className="w-5 h-5" />
                      {isSavingChanges ? 'Saving Changes...' : 'Save & Update Order'}
                    </button>

                    <Link
                      href="/checkout"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-medium text-sm transition-colors text-center"
                    >
                      Edit Address / Payment at Checkout
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        cancelEditingOrder();
                        addNotification('info', 'Order editing cancelled. Cart reverted.');
                        router.push('/account?tab=orders');
                      }}
                      className="w-full px-6 py-2 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-xs font-medium"
                    >
                      Cancel Editing
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/checkout"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-md text-center"
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={handleClearCart}
                      className="w-full px-6 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      Clear Cart
                    </button>
                  </>
                )}

                <Link
                  href="/products"
                  className="block text-center text-xs text-[#1a2a8a] dark:text-green-400 hover:underline pt-2"
                >
                  + Add more products from catalogue
                </Link>
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
