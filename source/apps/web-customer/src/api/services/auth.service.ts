/**
 * LEGACY SHIM - DO NOT USE IN NEW CODE
 * 
 * This service now delegates to features/auth/data for backward compatibility
 * during the refactor phase. All auth data access should go through the feature.
 * 
 * Will be removed after Batch 2 migration is complete.
 * 
 * @deprecated Use `features/auth/data/factory.ts` instead
 */

import { AuthDataFactory } from '@/features/auth/data';

export const AuthService = {
  /**
   * Get current user profile
   * @deprecated Use feature data layer directly
   */
  async getCurrentUser() {
    const strategy = AuthDataFactory.getStrategy();
    return strategy.getCurrentUser();
  },

  /**
   * Update user profile
   * @deprecated Use feature data layer directly
   */
  async updateProfile(data: { name: string }) {
    const strategy = AuthDataFactory.getStrategy();
    return strategy.updateProfile(data);
  },

  /**
   * Change password
   * @deprecated Use feature data layer directly
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }) {
    const strategy = AuthDataFactory.getStrategy();
    return strategy.changePassword(data);
  },

  /**
   * Login
   * @deprecated Use feature data layer directly
   */
  async login(data: {
    email: string;
    password: string;
  }) {
    const strategy = AuthDataFactory.getStrategy();
    return strategy.login(data);
  },

  /**
   * Logout
   * @deprecated Use feature data layer directly
   */
  async logout() {
    const strategy = AuthDataFactory.getStrategy();
    return strategy.logout();
  },
};
