'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InstallationMaterialsPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/accessories');
  }, []);
  
  return null;
}