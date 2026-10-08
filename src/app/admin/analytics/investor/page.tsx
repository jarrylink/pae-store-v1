import { Suspense } from 'react';
import InvestorIntelligence from '@/components/admin/InvestorIntelligence';

function InvestorIntelligenceContent() {
  return <InvestorIntelligence />;
}

export default function investorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading investor data...</div>}>
      <InvestorIntelligenceContent />
    </Suspense>
  );
}
