import { Suspense } from 'react';
import MarketingESGIntelligence from '@/components/admin/MarketingESGIntelligence';

function MarketingESGIntelligenceContent() {
  return <MarketingESGIntelligence />;
}

export default function marketingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading marketing data...</div>}>
      <MarketingESGIntelligenceContent />
    </Suspense>
  );
}
