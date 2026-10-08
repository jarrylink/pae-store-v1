import { Suspense } from 'react';
import FinancialIntelligence from '@/components/admin/FinancialIntelligence';

function FinancialIntelligenceContent() {
  return <FinancialIntelligence />;
}

export default function financialPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading financial data...</div>}>
      <FinancialIntelligenceContent />
    </Suspense>
  );
}
