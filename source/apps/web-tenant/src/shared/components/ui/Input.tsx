import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-gray-900">
          {label}
        </label>
      )}
      <input
        className={`px-4 py-3 border rounded-xl bg-white text-gray-900 transition-all duration-200 
          ${error ? 'border-red-500' : 'border-gray-300'} 
          focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}`}
        {...props}
      />
      {error && (
        <span className="text-red-500" style={{ fontSize: '13px' }}>{error}</span>
      )}
      {helperText && !error && (
        <span className="text-gray-600" style={{ fontSize: '13px' }}>{helperText}</span>
      )}
    </div>
  );
}
