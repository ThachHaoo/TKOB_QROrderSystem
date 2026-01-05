import { Metadata } from 'next';
import { RoleGuard } from '@/shared/guards';
import { MenuItemModifiersPage } from '@/features/menu';

export const metadata: Metadata = {
  title: 'Item Modifiers | TKQR Admin',
  description: 'Manage size and topping modifiers for a specific menu item',
};

export default function MenuItemModifiersRoute() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <MenuItemModifiersPage />
    </RoleGuard>
  );
}
