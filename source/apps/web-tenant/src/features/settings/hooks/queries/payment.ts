/**
 * Payment Query Hooks
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { logger } from '@/shared/utils/logger';
import { paymentAdapter } from '../../data/factory';

/**
 * Get payment status
 */
export const usePaymentStatus = (paymentId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['payment', 'status', paymentId],
    queryFn: async () => {
      logger.info('[payment] STATUS_QUERY_ATTEMPT', { paymentId });
      try {
        const result = await paymentAdapter.getPaymentStatus(paymentId);
        logger.info('[payment] STATUS_QUERY_SUCCESS', { 
          status: result.status 
        });
        return result;
      } catch (error) {
        logger.error('[payment] STATUS_QUERY_ERROR', { 
          paymentId,
          message: error instanceof Error ? error.message : 'Unknown error' 
        });
        throw error;
      }
    },
    enabled: options?.enabled ?? !!paymentId,
  });
};

/**
 * Check payment confirmation (for polling)
 */
export const useCheckPayment = (paymentId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['payment', 'check', paymentId],
    queryFn: async () => {
      logger.debug('[payment] CHECK_ATTEMPT', { paymentId });
      try {
        const result = await paymentAdapter.checkPayment(paymentId);
        logger.debug('[payment] CHECK_SUCCESS', { 
          confirmed: result.confirmed,
          status: result.status 
        });
        return result;
      } catch (error) {
        logger.error('[payment] CHECK_ERROR', { 
          paymentId,
          message: error instanceof Error ? error.message : 'Unknown error' 
        });
        throw error;
      }
    },
    enabled: options?.enabled ?? false,
    refetchInterval: false, // Manual polling control
  });
};
