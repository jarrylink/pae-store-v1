import { Suspense } from 'react';
import OperationsSupplyChain from '@/components/admin/OperationsSupplyChain';

function OperationsSupplyChainContent() {
  return <OperationsSupplyChain />;
}

export default function operationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading operations data...</div>}>
      <OperationsSupplyChainContent />
    </Suspense>
  );
}
