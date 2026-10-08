import { Suspense } from 'react';
import ReportsCenter from '@/components/admin/ReportsCenter';

function ReportsCenterContent() {
  return <ReportsCenter />;
}

export default function reportsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading reports data...</div>}>
      <ReportsCenterContent />
    </Suspense>
  );
}
