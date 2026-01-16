/**
 * Session Expiry Handler Hook
 * Monitors session validity and handles expiry
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface UseSessionExpiryReturn {
  isExpired: boolean;
  isExpiringSoon: boolean;
  minutesRemaining: number | null;
  checkSession: () => Promise<boolean>;
  extendSession: () => Promise<void>;
}

interface UseSessionExpiryOptions {
  sessionId: string | null;
  tenantId: string | null;
  warningMinutes?: number; // Show warning when < X minutes remaining
  onExpired?: () => void;
}

export function useSessionExpiry({
  sessionId,
  tenantId,
  warningMinutes = 5,
  onExpired,
}: UseSessionExpiryOptions): UseSessionExpiryReturn {
  const router = useRouter();
  const [isExpired, setIsExpired] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  // Check session validity
  const checkSession = useCallback(async (): Promise<boolean> => {
    if (!sessionId || !tenantId) return false;

    try {
      const response = await fetch(
        `/api/session/check?sessionId=${sessionId}&tenantId=${tenantId}`
      );
      
      if (!response.ok) {
        setIsExpired(true);
        return false;
      }

      const data = await response.json();
      
      if (data.expiresAt) {
        setExpiresAt(new Date(data.expiresAt));
      }
      
      if (data.isExpired) {
        setIsExpired(true);
        onExpired?.();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to check session:', error);
      return false;
    }
  }, [sessionId, tenantId, onExpired]);

  // Extend session
  const extendSession = useCallback(async (): Promise<void> => {
    if (!sessionId || !tenantId) return;

    try {
      const response = await fetch('/api/session/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, tenantId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.expiresAt) {
          setExpiresAt(new Date(data.expiresAt));
          setIsExpired(false);
        }
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
  }, [sessionId, tenantId]);

  // Calculate minutes remaining
  const minutesRemaining = expiresAt
    ? Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 60000))
    : null;

  const isExpiringSoon = minutesRemaining !== null && minutesRemaining <= warningMinutes;

  // Periodic session check
  useEffect(() => {
    if (!sessionId || !tenantId) return;

    // Check immediately
    checkSession();

    // Check every 2 minutes
    const interval = setInterval(checkSession, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [sessionId, tenantId, checkSession]);

  // Handle expiry
  useEffect(() => {
    if (isExpired) {
      onExpired?.();
    }
  }, [isExpired, onExpired]);

  return {
    isExpired,
    isExpiringSoon,
    minutesRemaining,
    checkSession,
    extendSession,
  };
}
