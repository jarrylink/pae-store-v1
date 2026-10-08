"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccessoryStore } from "@/lib/stores/accessoryStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { formatCurrency } from "@/utils";
import { Search, Plus, Minus, Package, ArrowLeft, Check, X, ShoppingBag } from "lucide-react";

function AccessoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { user, isAuthenticated } = useAuthStore();
  const { accessories, loading, fetchAccessories } = useAccessoryStore();

  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/installation-accessories");
      return;
    }
    setIsLoading(false);
  }, [isAuthenticated, router]);

  // Fetch data
  useEffect(() => {
    if (isAuthenticated && orderId) {
      fetchAccessories();
      fetchOrderDetails();
    }
  }, [isAuthenticated, orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders?userId=${user?.id}`);
      if (response.ok) {
        const orders = await response.json();
        const order = orders.find((o: any) => o.id === Number(orderId));
        if (order) {
          setOrderDetails(order);
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  };

  const handleQuantityChange = (accessoryId: number, change: number) => {
    setQuantities(prev => {
      const current = prev[accessoryId] || 0;
      const newQty = Math.max(0, current + change);
      if (newQty === 0) {
        const { [accessoryId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [accessoryId]: newQty };
    });
  };

  const handleAddToSelection = (accessory: any) => {
    const quantity = quantities[accessory.id] || 0;
    if (quantity <= 0) return;

    const existing = selectedItems.find(a => a.id === accessory.id);
    if (existing) {
      setSelectedItems(prev =>
        prev.map(a =>
          a.id === accessory.id
            ? { ...a, quantity: a.quantity + quantity }
            : a
        )
      );
    } else {
      setSelectedItems(prev => [
        ...prev,
        {
          id: accessory.id,
          name: accessory.name,
          price: accessory.price,
          unit: accessory.unit || "piece",
          stock: accessory.stock,
          image: accessory.image || "",
          quantity: quantity
        }
      ]);
    }

    setQuantities(prev => {
      const { [accessory.id]: _, ...rest } = prev;
      return rest;
    });
    
    // Auto-open sheet on mobile when items are added
    if (window.innerWidth < 1024) {
      setIsMobileSheetOpen(true);
    }
  };

  const removeFromSelection = (accessoryId: number) => {
    setSelectedItems(prev => prev.filter(a => a.id !== accessoryId));
  };

  const updateSelectedQuantity = (accessoryId: number, change: number) => {
    setSelectedItems(prev =>
      prev.map(a => {
        if (a.id === accessoryId) {
          const newQty = Math.max(1, a.quantity + change);
          return { ...a, quantity: newQty };
        }
        return a;
      })
    );
  };

  const getTotalPrice = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleAddToOrder = async () => {
    if (selectedItems.length === 0) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const accessoriesData = selectedItems.map(a => ({
        accessoryId: a.id,
        quantity: a.quantity,
        unit_price: a.price,
        unit: a.unit || "piece"
      }));

      const response = await fetch("/api/order-accessories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: Number(orderId),
          accessories: accessoriesData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add accessories");
      }

      setSuccess(`Successfully added ${selectedItems.length} accessories to your order!`);

      setSelectedItems([]);
      setQuantities({});
      setIsMobileSheetOpen(false);

      setTimeout(() => {
        router.push("/account?tab=orders");
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Failed to add accessories");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAccessories = accessories.filter(a => {
    if (!a.isActive) return false;
    const search = searchTerm.toLowerCase();
    return a.name.toLowerCase().includes(search) ||
           (a.category || "").toLowerCase().includes(search) ||
           (a.sku || "").toLowerCase().includes(search);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2a8a]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 lg:pb-8">
      <div className="py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => router.push("/account?tab=orders")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Add Installation Accessories
                </h1>
                {orderDetails && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Order #{orderDetails.id}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right hidden lg:block">
              <p className="text-sm text-gray-500 dark:text-gray-400">Selected</p>
              <p className="text-lg font-bold text-[#1a2a8a] dark:text-green-400">
                {selectedItems.length} items â€¢ {formatCurrency(getTotalPrice())}
              </p>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Accessories Grid */}
            <div className="flex-1">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accessories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a2a8a]"></div>
                </div>
              ) : filteredAccessories.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No accessories found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {filteredAccessories.map((accessory) => {
                    const qty = quantities[accessory.id] || 0;
                    const isSelected = selectedItems.some(a => a.id === accessory.id);

                    return (
                      <div
                        key={accessory.id}
                        className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-3 sm:p-4 transition-all ${
                          isSelected
                            ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-[#1a2a8a]"
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                            {accessory.image ? (
                              <img
                                src={accessory.image}
                                alt={accessory.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                              {accessory.name}
                            </h3>
                            <p className="text-base font-bold text-[#1a2a8a] dark:text-green-400">
                              {formatCurrency(accessory.price)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Stock: {accessory.stock} {accessory.unit}
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => handleQuantityChange(accessory.id, -1)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                                disabled={qty <= 0}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-medium text-sm">{qty}</span>
                              <button
                                onClick={() => {
                                  const maxStock = accessory.stock || 99;
                                  if (qty < maxStock) {
                                    handleQuantityChange(accessory.id, 1);
                                  }
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                disabled={qty >= (accessory.stock || 99)}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              {qty > 0 && (
                                <button
                                  onClick={() => handleAddToSelection(accessory)}
                                  className="ml-auto px-2 sm:px-3 py-1 bg-[#1a2a8a] text-white text-xs rounded-lg hover:bg-[#0f1a66]"
                                >
                                  Add
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Items Panel - Desktop (right side) */}
            <div className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Selected Items
                  </h3>
                  <span className="text-sm text-gray-500">
                    {selectedItems.length} items
                  </span>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-3">
                  {selectedItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No items selected</p>
                    </div>
                  ) : (
                    selectedItems.map((item) => (
                      <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatCurrency(item.price)} Ã— {item.quantity}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromSelection(item.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateSelectedQuantity(item.id, -1)}
                              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateSelectedQuantity(item.id, 1)}
                              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-[#1a2a8a] dark:text-green-400">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="text-xl font-bold text-[#1a2a8a] dark:text-green-400">
                      {formatCurrency(getTotalPrice())}
                    </span>
                  </div>

                  <button
                    onClick={handleAddToOrder}
                    disabled={selectedItems.length === 0 || isSubmitting}
                    className="w-full px-4 py-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    {isSubmitting ? "Adding..." : `Add ${selectedItems.length} Items to Order`}
                  </button>

                  <button
                    onClick={() => router.push("/account?tab=orders")}
                    className="w-full mt-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
                  >
                    Cancel & Return
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Floating Cart Button */}
      {selectedItems.length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <button
            onClick={() => setIsMobileSheetOpen(true)}
            className="w-full px-4 py-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-xl font-semibold shadow-lg hover:opacity-90 transition-opacity flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">
                {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">
                {formatCurrency(getTotalPrice())}
              </span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        </div>
      )}

      {/* Mobile: Bottom Sheet */}
      {isMobileSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileSheetOpen(false)}
          ></div>
          
          {/* Sheet */}
          <div className="relative w-full bg-white dark:bg-gray-800 rounded-t-2xl shadow-xl max-h-[75vh] overflow-hidden animate-slide-up">
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(75vh-60px)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Selected Items
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedItems.length} items
                  </p>
                </div>
                <span className="text-xl font-bold text-[#1a2a8a] dark:text-green-400">
                  {formatCurrency(getTotalPrice())}
                </span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {selectedItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatCurrency(item.price)} Ã— {item.quantity}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromSelection(item.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateSelectedQuantity(item.id, -1)}
                          className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateSelectedQuantity(item.id, 1)}
                          className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-[#1a2a8a] dark:text-green-400">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <button
                  onClick={handleAddToOrder}
                  disabled={selectedItems.length === 0 || isSubmitting}
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {isSubmitting ? "Adding..." : `Add ${selectedItems.length} Items to Order`}
                </button>

                <button
                  onClick={() => setIsMobileSheetOpen(false)}
                  className="w-full mt-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile: Cancel button when no items */}
      {selectedItems.length === 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <button
            onClick={() => router.push("/account?tab=orders")}
            className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl font-medium shadow-lg"
          >
            Cancel & Return
          </button>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2a8a]"></div>
      </div>
    }>
      <AccessoriesContent />
    </Suspense>
  );
}
