import { Suspense } from 'react';
import CustomerIntelligence from '@/components/admin/CustomerIntelligence';

function CustomerIntelligenceContent() {
  return <CustomerIntelligence />;
}

export default function customersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading customers data...</div>}>
      <CustomerIntelligenceContent />
    </Suspense>
  );
}
