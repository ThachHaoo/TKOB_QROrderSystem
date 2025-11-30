import React from 'react';
import { Card } from './Card';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function KPICard({ title, value, icon: Icon, trend }: KPICardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-gray-600" style={{ fontSize: '13px' }}>{title}</span>
          <span className="text-gray-900" style={{ fontSize: '28px', fontWeight: 700 }}>{value}</span>
          {trend && (
            <span 
              className={trend.isPositive ? 'text-emerald-600' : 'text-red-500'}
              style={{ fontSize: '13px', fontWeight: 500 }}
            >
              {trend.value}
            </span>
          )}
        </div>
        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-emerald-500" />
        </div>
      </div>
    </Card>
  );
}
