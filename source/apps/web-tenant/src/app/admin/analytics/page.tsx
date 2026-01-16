import { RoleGuard } from '@/shared/guards';
import { AnalyticsPage } from '@/features/analytics';

export default function Analytics() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AnalyticsPage />
    </RoleGuard>
  );
}
