import { Suspense } from 'react';
import FieldServicesIntelligence from '@/components/admin/FieldServicesIntelligence';

function FieldServicesContent() {
  return <FieldServicesIntelligence />;
}

export default function FieldServicesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading field services data...</div>}>
      <FieldServicesContent />
    </Suspense>
  );
}
