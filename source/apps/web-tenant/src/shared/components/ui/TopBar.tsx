import React from 'react';
import { Bell } from 'lucide-react';
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
    <div className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <h2 className="text-gray-900">{restaurantName}</h2>
        {showDateFilter && (
          <select 
            className="px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 cursor-pointer focus:outline-none focus:border-emerald-500"
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
        <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <UserMenu userName={userName} userRole="Admin" avatarColor="emerald" onNavigate={onNavigate} />
      </div>
    </div>
  );
}