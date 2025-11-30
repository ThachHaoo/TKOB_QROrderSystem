import React from 'react';
import { LayoutDashboard, Menu, QrCode, ShoppingBag, BarChart3, Users, Settings } from 'lucide-react';

import type { AdminNavItem, AdminScreenId } from './AdminShell';

interface SidebarProps {
  activeItem: AdminNavItem;
  onNavigate: (item: AdminScreenId) => void;
}

export function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu', icon: Menu },
    { id: 'tables', label: 'Tables & QR', icon: QrCode },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'tenant-profile', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-white border-r border-slate-200 z-40">
      {/* Logo (aligned with TopBar padding, no bottom border for clean seam) */}
      <div className="flex items-center h-20 px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-slate-900">TKQR</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as AdminScreenId)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[15px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}