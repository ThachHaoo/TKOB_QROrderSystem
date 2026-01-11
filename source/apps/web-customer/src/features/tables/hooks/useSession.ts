// Feature-owned useSession hook - Get current table session information

import { useState, useEffect } from 'react';
import { USE_MOCK_API } from '@/lib/constants';
import { TableDataFactory } from '../data';
import type { SessionInfo } from '../data';
import { getStoredSession } from '../utils/sessionStorage';

export function useSession() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchSession() {
      try {
        setLoading(true);

        // In MOCK mode, try to read from localStorage first (client-side session)
        if (USE_MOCK_API) {
          const storedSession = getStoredSession();
          if (storedSession) {
            if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
              console.log('[useSession] MOCK session loaded from storage:', storedSession);
            }
            if (mounted) {
              setSession(storedSession);
              setError(null);
              setLoading(false);
            }
            return;
          }
        }

        // Not found in storage or REAL mode: fetch from strategy
        const strategy = TableDataFactory.getStrategy();
        const sessionData = await strategy.getCurrentSession();
        
        if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
          console.log('[useSession] Session data received:', sessionData);
        }
        
        if (mounted) {
          setSession(sessionData);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
            console.error('[useSession] Failed to get session:', err);
          }
          setSession(null);
          setError(err instanceof Error ? err : new Error('Failed to get session'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchSession();

    return () => {
      mounted = false;
    };
  }, []);

  return { session, loading, error };
}
