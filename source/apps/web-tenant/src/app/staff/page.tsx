import { RoleGuard } from '@/shared/guards';
import { StaffPage } from '@/features/staff';

export default function StaffFullscreen() {
  return (
    <RoleGuard allowedRoles={['waiter', 'admin']}>
      <StaffPage />
    </RoleGuard>
  );
}
