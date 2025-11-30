import React from 'react';
import { Sidebar } from '@/shared/components/ui/Sidebar';
import { TopBar } from '@/shared/components/ui/TopBar';

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
  // dùng cho devmode / logout / chuyển role
  | 'login'
  | 'kds'
  | 'service-board';

export type AdminNavItem =
  | 'dashboard'
  | 'menu'
  | 'menu-modifiers'
  | 'tables'
  | 'orders'
  | 'analytics'
  | 'staff'
  | 'tenant-profile';

export interface AdminShellProps {
  /** Màn nào đang active để highlight trong Sidebar */
  activeItem: AdminNavItem;

  /** Hàm điều hướng (map ra router.push ở Next hoặc setCurrentScreen ở playground) */
  onNavigate: (screen: AdminScreenId) => void;

  /** Tên nhà hàng hiển thị ở TopBar (có thể bỏ qua) */
  restaurantName?: string;

  /** Nội dung riêng của từng màn (Dashboard, Menu, Orders, …) */
  children: React.ReactNode;

  /** 
   * Có cho phép dùng dev-mode switch role trong TopBar hay không
   * (nếu TopBar của bạn có props kiểu này; nếu không thì bỏ prop này đi)
   */
  enableDevModeSwitch?: boolean;
}

/**
 * AdminShell
 * 
 * Bọc toàn bộ layout Admin:
 * - Nền xám
 * - Sidebar bên trái
 * - TopBar phía trên
 * - main content ở giữa
 */
export const AdminShell: React.FC<AdminShellProps> = ({
  activeItem,
  onNavigate,
  restaurantName = 'The Bistro',
  enableDevModeSwitch = true,
  children,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar bên trái - Fixed */}
      <Sidebar activeItem={activeItem} onNavigate={onNavigate} />

      {/* Phần thân bên phải - with margin left for fixed sidebar */}
      <div className="ml-64 flex flex-col min-h-screen">
          {/* TopBar */}
          <TopBar
            restaurantName={restaurantName}
            onNavigate={onNavigate}
            enableDevModeSwitch={enableDevModeSwitch}
          />

          {/* Nội dung màn hình */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
      </div>
    </div>
  );
};