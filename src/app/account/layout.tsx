'use client';

import React from 'react';
import Header from '@/components/layout/header/Header';
import Footer from '@/components/layout/footer/Footer';
import ParticleBackground from '@/components/features/particles/ParticleBackground';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <div className="min-h-screen bg-transparent transition-colors duration-300 relative">
      {/* Particle Background */}
      <div className="fixed inset-0 z-0">
        <ParticleBackground />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Header />
        {children}
        <Footer />
      </div>
    </div>
  );
}
