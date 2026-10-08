import { Suspense } from 'react';
import AlertsMonitoringCenter from '@/components/admin/AlertsMonitoringCenter';

function AlertsMonitoringCenterContent() {
  return <AlertsMonitoringCenter />;
}

export default function alertsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading alerts data...</div>}>
      <AlertsMonitoringCenterContent />
    </Suspense>
  );
}
