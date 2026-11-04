'use client';

import React from 'react';
import InvoiceManager from '@/components/admin/invoices/InvoiceManager';
import { useAuthStore } from '@/lib/stores/authStore';

export default function SuperadminInvoicesPage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">Authenticating session...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <InvoiceManager
        user={{
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        }}
        mode="superadmin"
      />
    </div>
  );
}
