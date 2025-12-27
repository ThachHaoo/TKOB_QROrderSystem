import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const variantClasses = {
    success: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    warning: 'bg-amber-100 text-amber-600 border-amber-200',
    error: 'bg-red-100 text-red-600 border-red-200',
    info: 'bg-blue-100 text-blue-600 border-blue-200',
    neutral: 'bg-gray-100 text-gray-600 border-gray-200'
  };
  
  return (
    <span 
      className={`inline-flex items-center px-3 py-1 rounded-full border ${variantClasses[variant]} ${className}`}
      style={{ fontSize: '13px', fontWeight: 500 }}
    >
      {children}
    </span>
  );
}
