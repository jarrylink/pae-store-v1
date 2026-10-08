import { Suspense } from 'react';
import DataAuditCenter from '@/components/admin/DataAuditCenter';

function DataAuditCenterContent() {
  return <DataAuditCenter />;
}

export default function auditPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading audit data...</div>}>
      <DataAuditCenterContent />
    </Suspense>
  );
}
