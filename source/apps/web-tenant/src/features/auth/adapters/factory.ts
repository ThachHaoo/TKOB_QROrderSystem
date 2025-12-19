/**
 * Auth Adapter Factory
 * Chooses between Mock and Real API adapter based on config
 */

import { config } from '@/lib/config';
import type { IAuthAdapter } from './types';
import { AuthMockAdapter } from './mock';
import { AuthApiAdapter } from './api';

/**
 * Get the appropriate auth adapter based on configuration
 */
export const getAuthAdapter = (): IAuthAdapter => {
  if (config.useMockData) {
    return new AuthMockAdapter();
  }
  return new AuthApiAdapter();
};

/**
 * Singleton instance
 */
export const authAdapter = getAuthAdapter();
