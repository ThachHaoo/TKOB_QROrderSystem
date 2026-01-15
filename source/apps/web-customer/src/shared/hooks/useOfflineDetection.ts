/**
 * Offline Detection Hook
 * Tracks network connectivity status
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UseOfflineDetectionReturn {
  isOffline: boolean;
  isOnline: boolean;
  lastOnlineAt: Date | null;
}

export function useOfflineDetection(): UseOfflineDetectionReturn {
  const [isOffline, setIsOffline] = useState(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null);

  const handleOnline = useCallback(() => {
    setIsOffline(false);
    setLastOnlineAt(new Date());
  }, []);

  const handleOffline = useCallback(() => {
    setIsOffline(true);
  }, []);

  useEffect(() => {
    // Check initial state
    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine);
      if (navigator.onLine) {
        setLastOnlineAt(new Date());
      }
    }

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return {
    isOffline,
    isOnline: !isOffline,
    lastOnlineAt,
  };
}
