'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { useCartStore } from '@/lib/stores/cartStore';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import StickyHeaderWrapper from '@/components/layout/StickyHeaderWrapper';
import Footer from '@/components/layout/footer/Footer';

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [showLogin, setShowLogin] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);

  // Watch for authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      // User just logged in - redirect to checkout or home
      const redirectUrl = localStorage.getItem('checkout_redirect') || '/';
      localStorage.removeItem('checkout_redirect');
      router.push(redirectUrl);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Restore saved cart if any
    const savedCart = localStorage.getItem('checkout_cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        const { addItem, addAccessory } = useCartStore.getState();
        cartData.items?.forEach((item: any) => {
          addItem(item, item.quantity);
        });
        cartData.accessories?.forEach((acc: any) => {
          addAccessory(acc, acc.quantity);
        });
        // Don't remove cart yet - keep it until login completes
      } catch (error) {
        console.error('Error restoring cart:', error);
      }
    }

    // Check if user is already authenticated
    if (isAuthenticated) {
      const redirectUrl = localStorage.getItem('checkout_redirect') || '/';
      localStorage.removeItem('checkout_redirect');
      router.push(redirectUrl);
    }
    
    setLoading(false);
  }, []);

  const handleCloseModal = () => {
    // If user closes modal without logging in, clear the saved cart
    localStorage.removeItem('checkout_cart');
    localStorage.removeItem('checkout_redirect');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2a8a]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <StickyHeaderWrapper />
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md">
          {showLogin && (
            <LoginModal
              isOpen={true}
              onClose={handleCloseModal}
              onSwitchToRegister={() => {
                setShowLogin(false);
                setShowRegister(true);
              }}
            />
          )}
          {showRegister && (
            <RegisterModal
              isOpen={true}
              onClose={handleCloseModal}
              onSwitchToLogin={() => {
                setShowRegister(false);
                setShowLogin(true);
              }}
            />
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
