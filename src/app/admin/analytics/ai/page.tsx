import { Suspense } from 'react';
import AIIntelligenceCenter from '@/components/admin/AIIntelligenceCenter';

function AIIntelligenceCenterContent() {
  return <AIIntelligenceCenter />;
}

export default function aiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading ai data...</div>}>
      <AIIntelligenceCenterContent />
    </Suspense>
  );
}
