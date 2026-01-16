import { RoleGuard } from '@/shared/guards';
import { StaffPage } from '@/features/staff';

export default function Staff() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <StaffPage />
    </RoleGuard>
  );
}
