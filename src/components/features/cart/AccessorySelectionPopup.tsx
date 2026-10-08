'use client';

import React, { useState, useEffect } from 'react';
import { useAccessoryStore } from '@/lib/stores/accessoryStore';
import { formatCurrency } from '@/utils';
import { Search, X, Plus, Minus, ShoppingCart, Package, Check, ChevronUp } from 'lucide-react';

interface AccessorySelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToOrder: (selectedItems: any[]) => void;
}

interface SelectedAccessory {
  id: number;
  name: string;
  price: number;
  unit: string;
  stock: number;
  image: string;
  quantity: number;
}

// Accessory Card Component
const AccessoryCard = ({ accessory, quantity, isSelected, onQuantityChange, onAdd }: any) => {
  const qty = quantity || 0;
  
  return (
    <div className={`group relative bg-white dark:bg-gray-800 rounded-xl border-2 p-3 sm:p-4 transition-all duration-200 ${
      isSelected
        ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10 shadow-md'
        : 'border-gray-200 dark:border-gray-700 hover:border-[#1a2a8a] hover:shadow-md'
    }`}>
      <div className="flex gap-3">
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          {accessory.image ? (
            <img src={accessory.image} alt={accessory.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
          )}
          {isSelected && (
            <div className="absolute top-2 right-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{accessory.name}</h3>
          <p className="text-base font-bold text-[#1a2a8a] dark:text-green-400">{formatCurrency(accessory.price)}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">Stock: {accessory.stock} {accessory.unit}</span>
            {accessory.stock < 10 && accessory.stock > 0 && (
              <span className="text-[10px] text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full">Low</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => onQuantityChange(accessory.id, -1)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              disabled={qty <= 0}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center font-medium text-sm">{qty}</span>
            <button
              onClick={() => onQuantityChange(accessory.id, 1)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={qty >= (accessory.stock || 99)}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            {qty > 0 && (
              <button
                onClick={() => onAdd(accessory)}
                className={`ml-auto px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isSelected ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-[#1a2a8a] text-white hover:bg-[#0f1a66]'
                }`}
              >
                {isSelected ? 'Update' : 'Add'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Selected Item Component for Mobile Sheet
const SelectedItem = ({ item, onRemove, onQuantityChange }: any) => (
  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {formatCurrency(item.price)} × {item.quantity}
        </p>
      </div>
      <button onClick={() => onRemove(item.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
    <div className="flex items-center justify-between mt-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onQuantityChange(item.id, -1)}
          className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="text-base font-semibold w-8 text-center">{item.quantity}</span>
        <button
          onClick={() => onQuantityChange(item.id, 1)}
          className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <span className="text-base font-bold text-[#1a2a8a] dark:text-green-400">
        {formatCurrency(item.price * item.quantity)}
      </span>
    </div>
  </div>
);

export default function AccessorySelectionPopup({ isOpen, onClose, onAddToOrder }: AccessorySelectionPopupProps) {
  const { accessories, loading, fetchAccessories } = useAccessoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedAccessory[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 1024);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAccessories();
      setSelectedItems([]);
      setQuantities({});
      setSearchTerm('');
      setIsSheetOpen(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleQuantityChange = (id: number, change: number) => {
    setQuantities(prev => {
      const current = prev[id] || 0;
      const newQty = Math.max(0, current + change);
      if (newQty === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newQty };
    });
  };

  const handleAddToSelection = (accessory: any) => {
    const quantity = quantities[accessory.id] || 0;
    if (quantity <= 0) return;

    const existing = selectedItems.find(a => a.id === accessory.id);
    if (existing) {
      setSelectedItems(prev => prev.map(a => a.id === accessory.id ? { ...a, quantity: a.quantity + quantity } : a));
    } else {
      setSelectedItems(prev => [...prev, {
        id: accessory.id,
        name: accessory.name,
        price: accessory.price,
        unit: accessory.unit || 'piece',
        stock: accessory.stock,
        image: accessory.image || '',
        quantity
      }]);
    }

    setQuantities(prev => {
      const { [accessory.id]: _, ...rest } = prev;
      return rest;
    });

    if (!isDesktop) setIsSheetOpen(true);
  };

  const removeFromSelection = (id: number) => {
    setSelectedItems(prev => prev.filter(a => a.id !== id));
    if (selectedItems.length <= 1) setIsSheetOpen(false);
  };

  const updateSelectedQuantity = (id: number, change: number) => {
    setSelectedItems(prev => prev.map(a => {
      if (a.id === id) {
        const newQty = Math.max(1, a.quantity + change);
        return { ...a, quantity: newQty };
      }
      return a;
    }));
  };

  const getTotalPrice = () => selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getTotalItems = () => selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToOrder = () => {
    if (selectedItems.length === 0) return;
    onAddToOrder(selectedItems);
    onClose();
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
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />
      
      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4 pointer-events-none">
        <div className="pointer-events-auto w-full lg:max-w-6xl lg:max-h-[90vh] bg-white dark:bg-gray-900 rounded-none lg:rounded-2xl shadow-2xl flex flex-col h-full lg:h-auto lg:min-h-[600px] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Add Accessories</h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{selectedItems.length} items selected</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-900">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search accessories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#1a2a8a] border-t-transparent" />
              </div>
            ) : filteredAccessories.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No accessories found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredAccessories.map((accessory) => (
                  <AccessoryCard
                    key={accessory.id}
                    accessory={accessory}
                    quantity={quantities[accessory.id] || 0}
                    isSelected={selectedItems.some(a => a.id === accessory.id)}
                    onQuantityChange={handleQuantityChange}
                    onAdd={handleAddToSelection}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop Footer */}
          {isDesktop && selectedItems.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[#1a2a8a] dark:text-green-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">{getTotalItems()} items</span>
                  </div>
                  <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total:</span>
                    <span className="ml-2 text-xl font-bold text-[#1a2a8a] dark:text-green-400">{formatCurrency(getTotalPrice())}</span>
                  </div>
                </div>
                <button
                  onClick={handleAddToOrder}
                  disabled={selectedItems.length === 0}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Add {selectedItems.length} Items
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile FAB */}
      {!isDesktop && selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-[60] animate-slide-up">
          <button
            onClick={() => setIsSheetOpen(true)}
            className="w-full px-5 py-4 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-2xl shadow-2xl shadow-[#1a2a8a]/30 hover:shadow-xl transition-all duration-300 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl"><ShoppingCart className="w-5 h-5" /></div>
              <div className="text-left">
                <p className="text-sm font-medium">{getTotalItems()} items selected</p>
                <p className="text-xs opacity-80">{selectedItems.length} types</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">{formatCurrency(getTotalPrice())}</span>
              <div className="p-1.5 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
                <ChevronUp className="w-5 h-5" />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Mobile Sheet */}
      {!isDesktop && isSheetOpen && (
        <div className="fixed inset-0 z-[70] flex items-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsSheetOpen(false)} />
          <div className="relative w-full bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[75vh] overflow-hidden animate-slide-up">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>
            <div className="p-5 overflow-y-auto max-h-[calc(75vh-20px)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Selected Items</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getTotalItems()} items • {selectedItems.length} types</p>
                </div>
                <span className="text-2xl font-bold text-[#1a2a8a] dark:text-green-400">{formatCurrency(getTotalPrice())}</span>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {selectedItems.map((item) => (
                  <SelectedItem
                    key={item.id}
                    item={item}
                    onRemove={removeFromSelection}
                    onQuantityChange={updateSelectedQuantity}
                  />
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <button
                  onClick={handleAddToOrder}
                  disabled={selectedItems.length === 0}
                  className="w-full px-5 py-4 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-2xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base"
                >
                  <Check className="w-5 h-5" /> Add All to Order
                </button>
                <button
                  onClick={() => setIsSheetOpen(false)}
                  className="w-full mt-2 px-5 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-sm font-medium"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}