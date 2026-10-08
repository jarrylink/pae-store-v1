import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/layout/ClientLayout';
import Notification from '@/components/ui/Notification';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';

// System font stack

export const metadata: Metadata = {
  title: 'Power Afric Store - Number One Africa\'s Solar Energy Store',
  description: 'Nigeria\'s most trusted supplier of premium solar panels, inverters, batteries, and complete installation services',
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
