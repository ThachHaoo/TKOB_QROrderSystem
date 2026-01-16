import { Metadata } from 'next';
import { RoleGuard } from '@/shared/guards';
import { SubscriptionSettingsPage } from '@/features/settings';

export const metadata: Metadata = {
  title: 'Subscription | TKOB Admin',
  description: 'Manage your subscription plan and billing',
};

export default function Page() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <SubscriptionSettingsPage />
    </RoleGuard>
  );
}
