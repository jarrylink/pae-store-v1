'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [showRegisterModal, setShowRegisterModal] = React.useState(false);

  useEffect(() => {
    // Check if we need to open login modal
    const shouldOpen = localStorage.getItem('open_login_modal');
    if (shouldOpen === 'true') {
      localStorage.removeItem('open_login_modal');
      setShowLoginModal(true);
    }

    // Check if user is authenticated and has a redirect
    if (isAuthenticated) {
      const redirect = localStorage.getItem('checkout_redirect');
      if (redirect) {
        localStorage.removeItem('checkout_redirect');
        router.push(redirect);
      }
    }
  }, [isAuthenticated]);

  return (
    <>
      {children}
      
      {/* Auth Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </>
  );
}