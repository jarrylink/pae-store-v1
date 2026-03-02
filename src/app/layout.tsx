import type { Metadata } from 'next';
// Using system fonts instead of Google Fonts for build stability
import './globals.css';
import ClientLayout from '@/components/layout/ClientLayout';

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
      <body className={`font-sans bg-white dark:bg-gray-900 transition-colors duration-300`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

