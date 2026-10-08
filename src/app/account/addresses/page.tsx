import { Suspense } from 'react';
import AddressesContent from '@/components/account/addresses/AddressesContent';

function AddressesPageContent() {
  return <AddressesContent />;
}

export default function AddressesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading addresses...</div>}>
      <AddressesPageContent />
    </Suspense>
  );
}
