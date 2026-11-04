'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SalesIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/sales/dashboard');
  }, [router]);

  return (
    <div className="py-20 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600 mx-auto mb-2" />
      <p className="text-gray-500 text-sm">Redirecting to Sales Dashboard...</p>
    </div>
  );
}
