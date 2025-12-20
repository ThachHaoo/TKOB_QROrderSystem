'use client';

import React, { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ROUTES } from '@/lib/routes';

export type AdminScreenId =
  | 'dashboard'
  | 'menu'
  | 'menu-modifiers'
  | 'tables'
  | 'table-qr-detail'
  | 'orders'
  | 'analytics'
  | 'staff'
  | 'tenant-profile'
  | 'account-settings'
  | 'login'
  | 'kds'
  | 'service-board';

export type AdminNavItem =
  | 'dashboard'
  | 'menu'
  | 'menu-modifiers'
  | 'tables'
  | 'orders'
  | 'kds'
  | 'service-board'
  | 'analytics'
  | 'staff'
  | 'tenant-profile';

export interface AdminShellProps {
  restaurantName?: string;
  children: React.ReactNode;
  enableDevModeSwitch?: boolean;
}

export const AdminShell: React.FC<AdminShellProps> = ({
  restaurantName = 'TKOB Restaurant',
  enableDevModeSwitch = false,
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const activeItem: AdminNavItem = useMemo(() => {
    if (pathname.includes('/admin/dashboard')) return 'dashboard';
    if (pathname.includes('/admin/menu')) return 'menu';
    if (pathname.includes('/admin/tables')) return 'tables';
    if (pathname.includes('/admin/orders')) return 'orders';
    if (pathname.includes('/admin/analytics')) return 'analytics';
    if (pathname.includes('/admin/staff')) return 'staff';
    if (pathname.includes('/admin/tenant-profile')) return 'tenant-profile';
    if (pathname.includes('/admin/account-settings')) return 'tenant-profile';
    return 'dashboard';
  }, [pathname]);

  const disableContentScroll = useMemo(() => {
    return pathname.includes('/admin/menu') || pathname.includes('/admin/dashboard');
  }, [pathname]);

  const handleNavigate = (screen: AdminScreenId) => {
    const routeMap: Record<AdminScreenId, string | ((id: string) => string)> = {
      dashboard: ROUTES.dashboard,
      menu: ROUTES.menu,
      'menu-modifiers': ROUTES.menuModifiers,
      tables: ROUTES.tables,
      'table-qr-detail': ROUTES.tableQRDetail,
      orders: ROUTES.orders,
      analytics: ROUTES.analytics,
      staff: ROUTES.staff,
      'tenant-profile': ROUTES.tenantProfile,
      'account-settings': ROUTES.accountSettings,
      login: ROUTES.login,
      kds: ROUTES.kds,
      'service-board': ROUTES.waiterServiceBoard,
    };

    const route = routeMap[screen];
    if (route && typeof route === 'string') {
      router.push(route);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar activeItem={activeItem} onNavigate={handleNavigate} />

      <div className="flex-1 md:ml-64 flex flex-col">
        <header className="shrink-0">
          <TopBar
            restaurantName={restaurantName}
            onNavigate={handleNavigate}
            enableDevModeSwitch={enableDevModeSwitch}
          />
        </header>

        <main className={`flex-1 bg-slate-50 ${disableContentScroll ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};