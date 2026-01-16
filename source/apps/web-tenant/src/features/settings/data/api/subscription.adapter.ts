/**
 * Subscription API Adapter (Real API Implementation)
 * Uses Orval-generated React Query hooks
 */

import {
  publicSubscriptionControllerGetPublicPlans,
  publicSubscriptionControllerGetFeatureComparison,
} from '@/services/generated/subscription-public/subscription-public';

import {
  subscriptionControllerGetCurrentSubscription,
  subscriptionControllerGetUsage,
  subscriptionControllerCreateUpgradePayment,
  subscriptionControllerCheckUpgradePaymentStatus,
} from '@/services/generated/subscription/subscription';

import {
  paymentControllerGetPaymentStatus,
  paymentControllerCheckPaymentViaPoll,
} from '@/services/generated/payments/payments';

import type { ISubscriptionAdapter, IPaymentAdapter } from '../adapter.interface';

/**
 * Real API implementation for subscription
 */
export const subscriptionApiAdapter: ISubscriptionAdapter = {
  getPublicPlans: async () => {
    return await publicSubscriptionControllerGetPublicPlans();
  },

  getFeatureComparison: async () => {
    return await publicSubscriptionControllerGetFeatureComparison();
  },

  getCurrentSubscription: async () => {
    return await subscriptionControllerGetCurrentSubscription();
  },

  getUsage: async () => {
    return await subscriptionControllerGetUsage();
  },

  upgradePlan: async (data) => {
    return await subscriptionControllerCreateUpgradePayment(data);
  },
};

/**
 * Real API implementation for payment
 */
export const paymentApiAdapter: IPaymentAdapter = {
  getPaymentStatus: async (paymentId: string) => {
    return await paymentControllerGetPaymentStatus(paymentId);
  },

  checkPayment: async (paymentId: string) => {
    const result = await paymentControllerCheckPaymentViaPoll(paymentId);
    return {
      confirmed: result.completed || false,
      status: result.status || 'pending',
    };
  },
};
