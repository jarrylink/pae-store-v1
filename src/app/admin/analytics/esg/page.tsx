import { Suspense } from 'react';
import ESGImpactIntelligence from '@/components/admin/ESGImpactIntelligence';

function ESGImpactIntelligenceContent() {
  return <ESGImpactIntelligence />;
}

export default function esgPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading esg data...</div>}>
      <ESGImpactIntelligenceContent />
    </Suspense>
  );
}
