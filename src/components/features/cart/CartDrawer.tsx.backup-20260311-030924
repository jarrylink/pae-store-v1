'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, INSTALLATION_OPTIONS } from '@/lib/stores/cartStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { formatCurrency } from '@/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    items,
    installationType,
    removeItem,
    updateQuantity,
    clearCart,
    setInstallationType,
    getTotal,
    getInstallationFee
  } = useCartStore();

  const currentInstallation = (INSTALLATION_OPTIONS as any)[installationType] || INSTALLATION_OPTIONS.none;

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (isSubmitting) return;

    if (!isAuthenticated || !user) {
      alert('Please sign in to checkout');
      router.push('/login?redirect=cart');
      onClose();
      return;
    }

    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        userId: user.id,
        items: items.map(item => ({
          productId: item.id,
          name: item.title,
          title: item.title,
          brand: item.brand,
          spec: item.spec,
          capacity: item.capacity,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal: items.reduce((total, item) => total + (item.price * item.quantity), 0),
        shipping: 0,
        tax: 0,
        total: getTotal(),
        status: 'pending',
        notes: '',
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const createdOrder = await response.json();

      // Clear the cart after successful order creation
      clearCart();

      // Redirect to orders page to see the newly created order
      router.push('/orders');
      onClose();

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-transparent"
        onClick={onClose}
      />
      <div className="w-96 h-full bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Cart</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={clearCart}
                title="Clear cart"
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                disabled={items.length === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m5-4h4m-7 4h10"/>
                </svg>
              </button>
              <button
                onClick={onClose}
                title="Close cart"
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <p className="mt-4 text-gray-500 dark:text-gray-400">Your cart is empty</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Add some products to get started</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">{item.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.brand} • {item.spec}</p>
                    <p className="text-sm font-semibold text-[#1a2a8a] dark:text-green-400 mt-1">
                      {formatCurrency(item.price)}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-gray-900 dark:text-white min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <div className="p-2 bg-blue-50/30 dark:bg-blue-900/5 rounded-lg border border-blue-100/50 dark:border-blue-800/20">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-xs text-gray-900 dark:text-white">Installation</span>
                  </div>
                </div>
                <select
                  value={installationType}
                  onChange={(e) => setInstallationType(e.target.value as keyof typeof INSTALLATION_OPTIONS)}
                  className="w-full px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.values(INSTALLATION_OPTIONS).map((option) => (
                    <option key={option.id} value={option.id} className="text-xs">
                      {option.name} {option.price > 0 ? `(+₦${option.price.toLocaleString()})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Items Subtotal</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {formatCurrency(items.reduce((total, item) => total + (item.price * item.quantity), 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-3 pt-1.5 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-lg text-[#1a2a8a] dark:text-green-400">
                    {formatCurrency(getTotal())}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={items.length === 0 || isSubmitting}
                  className="w-full bg-gradient-to-r from-[#1a2a8a] to-[#40b553] hover:opacity-90 text-white px-3 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-300"
                >
                  {isSubmitting ? 'Placing Order...' : 'Proceed to Checkout'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;



