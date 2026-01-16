/**
 * Subscription Controller Hook
 * Orchestrates subscription management logic
 */

'use client';

import { useCallback } from 'react';
import { logger } from '@/shared/utils/logger';
import {
  usePublicPlans,
  useFeatureComparison,
  useCurrentSubscription,
  useUsage,
  useUpgradePlan,
  useInvalidateSubscription,
} from './queries/subscription';
import { usePaymentPolling } from './usePaymentPolling';
import type { CreateSubscriptionPaymentDto } from '@/services/generated/models';

export interface UseSubscriptionControllerReturn {
  // Queries
  publicPlans: ReturnType<typeof usePublicPlans>;
  features: ReturnType<typeof useFeatureComparison>;
  currentSubscription: ReturnType<typeof useCurrentSubscription>;
  usage: ReturnType<typeof useUsage>;
  
  // Mutations
  upgradeMutation: ReturnType<typeof useUpgradePlan>;
  
  // Helpers
  invalidateSubscription: () => void;
  
  // Actions
  initiateUpgrade: (targetPlan: string) => Promise<{ paymentId: string } | null>;
}

/**
 * Main controller for subscription operations
 */
export function useSubscriptionController(): UseSubscriptionControllerReturn {
  const publicPlans = usePublicPlans();
  const features = useFeatureComparison();
  const currentSubscription = useCurrentSubscription();
  const usage = useUsage();
  const upgradeMutation = useUpgradePlan();
  const invalidateSubscription = useInvalidateSubscription();

  /**
   * Initiate plan upgrade
   */
  const initiateUpgrade = useCallback(async (targetPlan: string) => {
    logger.info('[subscription] INITIATE_UPGRADE', { targetPlan });

    try {
      const data: CreateSubscriptionPaymentDto = {
        targetTier: targetPlan as any, // FREE | BASIC | PREMIUM
      };

      const result = await upgradeMutation.mutateAsync(data);

      logger.info('[subscription] UPGRADE_INITIATED', {
        paymentId: result.paymentId,
        amountVND: result.amountVND,
        qrCodeUrl: result.qrCodeUrl,
      });

      return {
        paymentId: result.paymentId,
        qrCodeUrl: result.qrCodeUrl, // VietQR image URL
        accountNumber: result.accountNumber,
        accountName: result.accountName,
        amount: result.amountVND, // Use amountVND from API
        content: result.transferContent,
      };
    } catch (error) {
      logger.error('[subscription] UPGRADE_FAILED', {
        targetPlan,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }, [upgradeMutation]);

  return {
    publicPlans,
    features,
    currentSubscription,
    usage,
    upgradeMutation,
    invalidateSubscription,
    initiateUpgrade,
  };
}
