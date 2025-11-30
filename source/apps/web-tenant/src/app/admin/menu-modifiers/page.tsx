import { Metadata } from 'next';
import { RoleGuard } from '@/shared/components/auth';
import { MenuItemModifiersPage } from '@/features/menu-management';

export const metadata: Metadata = {
  title: 'Menu Item Modifiers | TKOB Admin',
  description: 'Manage menu item sizes, toppings, and customizations',
};

export default function MenuModifiersPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <MenuItemModifiersPage />
    </RoleGuard>
  );
}
