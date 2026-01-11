// Feature-owned QR handler controller - Logic extracted from /t/[qrToken]/page.tsx

'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { USE_MOCK_API } from '@/lib/constants';
import { TableDataFactory } from '../data';
import type { SessionInfo } from '../data';
import { setStoredSession } from '../utils/sessionStorage';

interface UseQRHandlerProps {
  qrToken: string;
}

export function useQRHandler({ qrToken }: UseQRHandlerProps) {
  const router = useRouter();

  useEffect(() => {
    // Validate token exists
    if (!qrToken) {
      if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
        console.error('[QR] Missing QR token parameter');
      }
      window.location.href = '/invalid-qr?reason=missing-token';
      return;
    }

    if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
      console.log('[QR] Processing QR token:', qrToken);
    }

    // MOCK mode: Handle QR validation client-side
    if (USE_MOCK_API) {
      handleMockQR(qrToken, router);
      return;
    }

    // REAL mode: Redirect to backend endpoint
    // Backend will validate, create session, set cookie, and redirect to /menu
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/t/${qrToken}`;
    
    if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
      console.log('[QR] Redirecting to backend (REAL mode):', backendUrl);
    }
    
    // Use window.location.href to allow backend 302 redirect
    // This ensures cookie is properly set before final navigation
    window.location.href = backendUrl;
  }, [qrToken, router]);
}

/**
 * Handle QR validation in MOCK mode (client-side)
 */
async function handleMockQR(token: string, router: ReturnType<typeof useRouter>) {
  try {
    const strategy = TableDataFactory.getStrategy();
    const result = await strategy.validateQRToken(token);

    if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
      console.log('[QR] MOCK validation result:', result);
    }

    if (!result.success) {
      if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
        console.error('[QR] MOCK validation failed:', result.message);
      }
      router.push('/invalid-qr?reason=invalid-token');
      return;
    }

    // Validation succeeded; create session with token-specific data
    const session: SessionInfo = {
      sessionId: `mock-session-${Date.now()}`,
      tableId: result.data.table.id,
      tableNumber: result.data.table.number,
      restaurantName: result.data.restaurant.name || 'The Golden Spoon',
      tenantId: result.data.restaurant.id || 'mock-tenant',
      active: true,
      createdAt: new Date().toISOString(),
    };

    if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
      console.log('[QR] MOCK session created:', session);
    }

    // Persist session to localStorage so useSession can retrieve it
    setStoredSession(session);

    if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
      console.log('[QR] MOCK session stored; navigating to /');
    }

    // Navigate to landing (app entry point after session created)
    router.push('/');
  } catch (err) {
    if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
      console.error('[QR] MOCK QR handling error:', err);
    }
    router.push('/invalid-qr?reason=error');
  }
}
