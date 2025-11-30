import React from 'react';
import { UserMenu } from './UserMenu';

import type { AdminScreenId } from './AdminShell';

interface TopBarProps {
  restaurantName: string;
  userName?: string;
  showDateFilter?: boolean;
  timePeriod?: string;
  onTimePeriodChange?: (value: string) => void;
  onNavigate?: (screen: AdminScreenId) => void;
  enableDevModeSwitch?: boolean;
}

export function TopBar({ 
  restaurantName, 
  userName = 'Admin User', 
  showDateFilter = false, 
  timePeriod,
  onTimePeriodChange,
  onNavigate 
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">{restaurantName}</h1>
        {showDateFilter && (
          <select 
            className="px-4 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer focus:outline-none focus:border-emerald-500"
            value={timePeriod}
            onChange={(e) => onTimePeriodChange?.(e.target.value)}
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>Custom Range</option>
          </select>
        )}
      </div>

      <div className="flex items-center gap-4">
        <UserMenu userName={userName} userRole="Admin" avatarColor="emerald" onNavigate={onNavigate} />
      </div>
    </header>
  );
}