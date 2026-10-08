import { Suspense } from 'react';
import FieldServicesIntelligence from '@/components/admin/FieldServicesIntelligence';

function FieldServicesIntelligenceContent() {
  return <FieldServicesIntelligence />;
}

export default function fieldPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading field data...</div>}>
      <FieldServicesIntelligenceContent />
    </Suspense>
  );
}
