'use client';

import React, { useState, useEffect } from 'react';
import { useAccessoryStore } from '@/lib/stores/accessoryStore';
import { formatCurrency } from '@/utils';
import { Search, X, Plus, Minus, ShoppingCart, Package, Check } from 'lucide-react';

interface CustomerAccessorySelectionProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  onAccessoriesAdded: () => void;
}

export default function CustomerAccessorySelection({ 
  isOpen, 
  onClose, 
  orderId,
  onAccessoriesAdded 
}: CustomerAccessorySelectionProps) {
  const { accessories, loading, fetchAccessories } = useAccessoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccessories, setSelectedAccessories] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAccessories();
      setSelectedAccessories([]);
      setQuantities({});
      setSearchTerm('');
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, fetchAccessories]);

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

    const existing = selectedAccessories.find(a => a.id === accessory.id);
    if (existing) {
      setSelectedAccessories(prev =>
        prev.map(a =>
          a.id === accessory.id
            ? { ...a, quantity: a.quantity + quantity }
            : a
        )
      );
    } else {
      setSelectedAccessories(prev => [
        ...prev,
        {
          id: accessory.id,
          name: accessory.name,
          price: accessory.price,
          unit: accessory.unit || 'piece',
          stock: accessory.stock,
          image: accessory.image || '',
          quantity: quantity
        }
      ]);
    }

    setQuantities(prev => {
      const { [accessory.id]: _, ...rest } = prev;
      return rest;
    });
  };

  const removeFromSelection = (accessoryId: number) => {
    setSelectedAccessories(prev => prev.filter(a => a.id !== accessoryId));
  };

  const updateSelectedQuantity = (accessoryId: number, change: number) => {
    setSelectedAccessories(prev =>
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
    return selectedAccessories.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleAddToOrder = async () => {
    if (selectedAccessories.length === 0) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const accessoriesData = selectedAccessories.map(a => ({
        accessoryId: a.id,
        quantity: a.quantity,
        unit_price: a.price,
        unit: a.unit || 'piece'
      }));

      const response = await fetch('/api/order-accessories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          accessories: accessoriesData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add accessories');
      }

      setSuccess(`Successfully added ${selectedAccessories.length} accessories to your order!`);
      onAccessoriesAdded();
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Failed to add accessories');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAccessories = accessories.filter(a => {
    if (!a.isActive) return false;
    const search = searchTerm.toLowerCase();
    return a.name.toLowerCase().includes(search) ||
           (a.category || '').toLowerCase().includes(search) ||
           (a.sku || '').toLowerCase().includes(search);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Add Installation Accessories
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select accessories to add to order #{orderId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        <div className="flex-1 overflow-hidden flex">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search accessories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#1a2a8a] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2a8a]"></div>
              </div>
            ) : filteredAccessories.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No accessories found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAccessories.map((accessory) => {
                  const qty = quantities[accessory.id] || 0;
                  const isSelected = selectedAccessories.some(a => a.id === accessory.id);
                  
                  return (
                    <div
                      key={accessory.id}
                      className={`border rounded-xl p-4 transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-[#1a2a8a]'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                          {accessory.image ? (
                            <img
                              src={accessory.image}
                              alt={accessory.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {accessory.name}
                          </h3>
                          <p className="text-lg font-bold text-[#1a2a8a] dark:text-green-400">
                            {formatCurrency(accessory.price)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Stock: {accessory.stock} {accessory.unit}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleQuantityChange(accessory.id, -1)}
                              className="p-1 hover:bg-gray-100 rounded"
                              disabled={qty <= 0}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{qty}</span>
                            <button
                              onClick={() => {
  const maxStock = accessory.stock || 99;
  if (qty < maxStock) {
    handleQuantityChange(accessory.id, 1);
  }
}}
                              className="p-1 hover:bg-gray-100 rounded"
                              disabled={qty >= (accessory.stock || 99)}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            {qty > 0 && (
                              <button
                                onClick={() => handleAddToSelection(accessory)}
                                className="ml-auto px-3 py-1 bg-[#1a2a8a] text-white text-xs rounded-lg hover:bg-[#0f1a66]"
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

          {/* Right Panel */}
          <div className="w-80 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Selected Items
              </h3>
              <span className="text-sm text-gray-500">
                {selectedAccessories.length} items
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {selectedAccessories.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No items selected</p>
                </div>
              ) : (
                selectedAccessories.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatCurrency(item.price)} Ãƒâ€” {item.quantity}
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
                          className="p-0.5 hover:bg-gray-100 rounded"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateSelectedQuantity(item.id, 1)}
                          className="p-0.5 hover:bg-gray-100 rounded"
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
                disabled={selectedAccessories.length === 0 || isSubmitting}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {isSubmitting ? 'Adding...' : `Add ${selectedAccessories.length} Items to Order`}
              </button>

              <button
                onClick={onClose}
                className="w-full mt-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}