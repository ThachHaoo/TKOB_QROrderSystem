import { Metadata } from 'next';
import { RoleGuard } from '@/shared/guards';
import { PaymentSettingsPage } from '@/features/settings';

export const metadata: Metadata = {
  title: 'Payment Settings | TKOB Admin',
  description: 'Configure SePay payment integration and settings',
};

export default function Page() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <PaymentSettingsPage />
    </RoleGuard>
  );
}
