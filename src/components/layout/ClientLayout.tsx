'use client';

import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{ zIndex: 999999 }}
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#111827',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          },
          success: {
            duration: 3500,
            iconTheme: {
              primary: '#40b553',
              secondary: '#ffffff',
            },
            style: {
              background: '#ffffff',
              color: '#111827',
              border: '1px solid #bbf7d0',
            },
          },
          error: {
            duration: 4500,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
            style: {
              background: '#ffffff',
              color: '#111827',
              border: '1px solid #fecaca',
            },
          },
        }}
      />
    </ThemeProvider>
  );
}
