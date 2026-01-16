/**
 * Settings Data Factory
 * Creates adapter instance (mock vs API) based on feature flags
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { apiSettingsAdapter } from './api/api-settings.adapter';
import { mockSettingsAdapter } from './mocks/mock-settings.adapter';
import { subscriptionApiAdapter, paymentApiAdapter } from './api/subscription.adapter';
import type { SettingsAdapter, ISubscriptionAdapter, IPaymentAdapter } from './adapter.interface';

function createSettingsAdapter(): SettingsAdapter {
  const useMock = isMockEnabled('settings');
  return useMock ? mockSettingsAdapter : apiSettingsAdapter;
}

/**
 * Singleton instances
 */
export const settingsAdapter = createSettingsAdapter();
export const subscriptionAdapter: ISubscriptionAdapter = subscriptionApiAdapter;
export const paymentAdapter: IPaymentAdapter = paymentApiAdapter;
