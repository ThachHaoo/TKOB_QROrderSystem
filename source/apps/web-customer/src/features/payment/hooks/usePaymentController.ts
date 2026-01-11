"use client"

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/features/tables/hooks/useSession'
import type { Order } from '@/types'
import { debugLog, debugError } from '@/lib/debug'
import type { PaymentController, PaymentStatus } from '../model'
import { PaymentDataFactory } from '../data'

interface UsePaymentControllerProps {
  total: number
  itemCount: number
  orderId?: string
  existingOrder?: Order | null
  onPaymentSuccess?: () => void
  onPaymentFailure?: () => void
}

export function usePaymentController({
  total,
  itemCount,
  orderId,
  existingOrder,
  onPaymentSuccess,
  onPaymentFailure,
}: UsePaymentControllerProps): PaymentController {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { session } = useSession()
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('waiting')
  const [error, setError] = useState<string | null>(null)
  const didStartRef = useRef(false)
  const timerRef = useRef<number | null>(null)

  // Explicit payment starter (idempotent / StrictMode-safe)
  const startPayment = async () => {
    if (didStartRef.current) {
      if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
        console.log('[Payment Controller] Payment already started, skipping duplicate call');
      }
      return;
    }
    didStartRef.current = true;

    // Guard: Ensure orderId exists before starting payment
    const finalOrderId = orderId || existingOrder?.id;
    if (!finalOrderId) {
      if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
        console.warn('[Payment Controller] Cannot start payment: orderId is missing');
      }
      debugError('Payment', 'start_missing_order_id')
      setPaymentStatus('failed');
      setError('Invalid order. Please create an order first.');
      return;
    }

    if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
      console.log('[Payment Controller] Starting payment process', {
        orderId: finalOrderId,
        amount: total,
        itemCount,
      });
    }

    debugLog('Payment', 'start', {
      orderId: finalOrderId,
      amount: total,
      itemCount,
    })

    try {
      const strategy = PaymentDataFactory.getStrategy();
      const response = await strategy.processCardPayment({
        orderId: finalOrderId,
        amount: total,
        sessionId: session?.tableId,
      });

      if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
        console.log('[Payment Controller] Payment response received:', {
          success: response.success,
          status: response.data?.status,
          message: response.message,
        });
      }

      if (response.success && response.data?.status === 'completed') {
        if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
          console.log('[Payment Controller] Payment completed successfully for order:', finalOrderId);
        }
        debugLog('Payment', 'success', { orderId: finalOrderId })
        setPaymentStatus('success');
        
        // Invalidate queries to refresh order data
        queryClient.invalidateQueries({ queryKey: ['order', finalOrderId] });
        if (session?.tableId) {
          queryClient.invalidateQueries({ queryKey: ['orders', session.tableId] });
        }
        
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
          console.log('[Payment Controller] Payment failed:', response.message);
        }
        debugLog('Payment', 'failure', {
          orderId: finalOrderId,
          reason: response.message,
        })
        setPaymentStatus('failed');
        setError(response.message || 'Payment processing failed');
        if (onPaymentFailure) {
          onPaymentFailure();
        }
      }
    } catch (err) {
      if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
        console.error('[Payment Controller] Payment error:', err);
      }
      debugError('Payment', 'error', err)
      console.error('[usePaymentController] Payment error:', err);
      setPaymentStatus('failed');
      setError(err instanceof Error ? err.message : 'Payment processing error');
      if (onPaymentFailure) {
        onPaymentFailure();
      }
    }
  }

  // MOCK payment is now fully manual - no auto-start
  // User must click "Simulate payment success" button

  const state = useMemo(
    () => ({
      paymentStatus,
      error,
      total,
      itemCount,
      existingOrder,
    }),
    [paymentStatus, error, total, itemCount, existingOrder]
  )

  const goBack = () => {
    router.back()
  }

  const handlePaymentSuccess = () => {
    if (onPaymentSuccess) {
      onPaymentSuccess()
    }
  }

  const handlePaymentFailure = () => {
    if (onPaymentFailure) {
      onPaymentFailure()
    }
  }

  const handleViewOrderStatus = () => {
    if (paymentStatus === 'success') {
      if (onPaymentSuccess) {
        onPaymentSuccess()
      }
    }
  }

  const retryPayment = () => {
    setPaymentStatus('waiting')
    setError(null)
    didStartRef.current = false
  }

  return {
    state,
    actions: {
      goBack,
      handlePaymentSuccess,
      handlePaymentFailure,
      handleViewOrderStatus,
      startPayment,
      retryPayment,
    },
  }
}
