import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/layout/ClientLayout';
import Notification from '@/components/ui/Notification';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';

// System font stack

export const metadata: Metadata = {
  title: 'Power Afric Store - Number One Africa\'s Solar Energy Store',
  description: 'Nigeria\'s most trusted supplier of premium solar panels, inverters, batteries, and complete installation services',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes" />
      </head>
      <body className={`font-sans bg-white dark:bg-gray-900 transition-colors duration-300`}>
        <GoogleAnalytics />
        <ClientLayout>
          {children}
        </ClientLayout>
        <Notification />
      </body>
    </html>
  );
}
