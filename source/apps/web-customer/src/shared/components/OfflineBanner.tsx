/**
 * Offline Banner Component
 * Displays when user loses network connectivity
 */

'use client';

import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useOfflineDetection } from '../hooks/useOfflineDetection';

export function OfflineBanner() {
  const { isOffline, lastOnlineAt } = useOfflineDetection();

  if (!isOffline) return null;

  const formatLastOnline = () => {
    if (!lastOnlineAt) return '';
    const minutes = Math.floor((Date.now() - lastOnlineAt.getTime()) / 60000);
    if (minutes < 1) return 'vừa mới';
    if (minutes < 60) return `${minutes} phút trước`;
    return `${Math.floor(minutes / 60)} giờ trước`;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white px-4 py-3 flex items-center justify-center gap-3 animate-slide-down">
      <WifiOff className="w-5 h-5 text-amber-400" />
      <div className="flex-1">
        <p className="font-medium">Không có kết nối mạng</p>
        <p className="text-sm text-gray-300">
          Kết nối cuối: {formatLastOnline()}
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
}
