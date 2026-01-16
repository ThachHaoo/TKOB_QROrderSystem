/**
 * Payment Polling Hook
 * Polls SePay API to verify payment confirmation
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '@/shared/utils/logger';
import { paymentAdapter } from '../data/factory';

export type PaymentPollingStatus = 
  | 'idle'
  | 'polling'
  | 'confirmed'
  | 'timeout'
  | 'error';

interface UsePaymentPollingOptions {
  /**
   * Payment ID to poll
   */
  paymentId: string | null;
  /**
   * Enable polling
   */
  enabled?: boolean;
  /**
   * Polling interval in milliseconds
   * @default 2000 (2 seconds)
   */
  interval?: number;
  /**
   * Maximum polling attempts
   * @default 30 (1 minute with 2s interval)
   */
  maxAttempts?: number;
  /**
   * Callback on success
   */
  onSuccess?: () => void;
  /**
   * Callback on timeout
   */
  onTimeout?: () => void;
  /**
   * Callback on error
   */
  onError?: (error: Error) => void;
}

interface UsePaymentPollingReturn {
  /**
   * Current polling status
   */
  status: PaymentPollingStatus;
  /**
   * Current attempt number
   */
  attempt: number;
  /**
   * Maximum attempts
   */
  maxAttempts: number;
  /**
   * Progress percentage (0-100)
   */
  progress: number;
  /**
   * Start polling
   */
  startPolling: () => void;
  /**
   * Stop polling
   */
  stopPolling: () => void;
  /**
   * Reset to initial state
   */
  reset: () => void;
}

/**
 * Hook for polling payment confirmation
 * 
 * @example
 * ```tsx
 * const { status, progress, startPolling } = usePaymentPolling({
 *   paymentId: payment.id,
 *   onSuccess: () => {
 *     toast.success('Payment confirmed!');
 *     router.push('/subscription');
 *   },
 *   onTimeout: () => {
 *     toast.error('Payment verification timeout');
 *   },
 * });
 * 
 * // Start polling when user clicks "I have paid"
 * <button onClick={startPolling}>I have paid</button>
 * ```
 */
export function usePaymentPolling({
  paymentId,
  enabled = true,
  interval = 2000,
  maxAttempts = 30,
  onSuccess,
  onTimeout,
  onError,
}: UsePaymentPollingOptions): UsePaymentPollingReturn {
  const [status, setStatus] = useState<PaymentPollingStatus>('idle');
  const [attempt, setAttempt] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const attemptRef = useRef(0);
  
  // Keep callbacks in ref to avoid re-creating interval
  const callbacksRef = useRef({ onSuccess, onTimeout, onError });
  useEffect(() => {
    callbacksRef.current = { onSuccess, onTimeout, onError };
  }, [onSuccess, onTimeout, onError]);

  /**
   * Stop polling and cleanup
   */
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Poll once
   */
  const pollOnce = useCallback(async () => {
    if (!paymentId) {
      logger.warn('[polling] No payment ID provided');
      return false;
    }

    attemptRef.current += 1;
    setAttempt(attemptRef.current);

    logger.debug('[polling] CHECK_PAYMENT', {
      paymentId,
      attempt: attemptRef.current,
      maxAttempts,
    });

    try {
      const result = await paymentAdapter.checkPayment(paymentId);

      if (result.confirmed) {
        logger.info('[polling] PAYMENT_CONFIRMED', {
          paymentId,
          attempt: attemptRef.current,
        });
        
        stopPolling();
        setStatus('confirmed');
        callbacksRef.current.onSuccess?.();
        return true;
      }

      // Check timeout
      if (attemptRef.current >= maxAttempts) {
        logger.warn('[polling] PAYMENT_TIMEOUT', {
          paymentId,
          attempts: attemptRef.current,
        });
        
        stopPolling();
        setStatus('timeout');
        callbacksRef.current.onTimeout?.();
        return true;
      }

      return false;
    } catch (error) {
      logger.error('[polling] PAYMENT_CHECK_ERROR', {
        paymentId,
        attempt: attemptRef.current,
        message: error instanceof Error ? error.message : 'Unknown error',
      });

      // Don't stop on error - keep trying
      // Only stop on max attempts
      if (attemptRef.current >= maxAttempts) {
        stopPolling();
        setStatus('error');
        callbacksRef.current.onError?.(
          error instanceof Error ? error : new Error('Payment check failed')
        );
        return true;
      }

      return false;
    }
  }, [paymentId, maxAttempts, stopPolling]);

  /**
   * Start polling
   */
  const startPolling = useCallback(() => {
    if (!paymentId || !enabled) {
      logger.warn('[polling] Cannot start polling', { 
        hasPaymentId: !!paymentId, 
        enabled 
      });
      return;
    }

    if (intervalRef.current) {
      logger.warn('[polling] Polling already active');
      return;
    }

    logger.info('[polling] START_POLLING', {
      paymentId,
      interval,
      maxAttempts,
    });

    // Reset state
    attemptRef.current = 0;
    setAttempt(0);
    setStatus('polling');

    // Poll immediately
    pollOnce();

    // Then poll at interval
    intervalRef.current = setInterval(() => {
      pollOnce();
    }, interval);
  }, [paymentId, enabled, interval, maxAttempts, pollOnce]);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    stopPolling();
    setStatus('idle');
    setAttempt(0);
    attemptRef.current = 0;
  }, [stopPolling]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  /**
   * Calculate progress percentage
   */
  const progress = maxAttempts > 0 ? Math.round((attempt / maxAttempts) * 100) : 0;

  return {
    status,
    attempt,
    maxAttempts,
    progress,
    startPolling,
    stopPolling,
    reset,
  };
}
