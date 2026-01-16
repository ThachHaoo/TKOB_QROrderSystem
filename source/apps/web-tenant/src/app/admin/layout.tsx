'use client';

import { ReactNode } from 'react';
import { AdminShell } from '@/shared/components';
import { RoleGuard } from '@/shared/guards';

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * Admin Layout
 * 
 * Wraps all /admin routes with AdminShell and RoleGuard.
 * Only OWNER can access admin panel.
 * AdminShell now handles:
 * - Auto-detecting active nav item from pathname
 * - Auto-handling navigation with Next.js router
 * - Auto-disabling scroll for Menu Management page
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AdminShell restaurantName="TKOB Restaurant" enableDevModeSwitch={false}>
        {children}
      </AdminShell>
    </RoleGuard>
  );
}
