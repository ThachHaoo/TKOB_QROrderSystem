/**
 * Settings Data Adapter Interface
 * Defines the contract for fetching and saving settings
 */

import type { AccountSettingsState, TenantFullProfileState } from '../model/types';
import type {
  PublicSubscriptionControllerGetPublicPlans200Item,
  PublicSubscriptionControllerGetFeatureComparison200,
  SubscriptionControllerGetCurrent200,
  SubscriptionControllerGetUsage200,
  UpgradeSubscriptionDto,
  PaymentIntentResponseDto,
  PaymentStatusResponseDto,
} from '@/services/generated/models';

export interface SettingsAdapter {
  // Account settings queries
  getAccountSettings(): Promise<AccountSettingsState>;
  
  // Account settings mutations
  saveAccountProfile(payload: { displayName: string; avatarColor: string }): Promise<void>;
  changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void>;
  setAccount2FA(payload: { enabled: boolean; verificationCode?: string }): Promise<void>;

  // Tenant profile queries
  getTenantProfileSettings(): Promise<TenantFullProfileState>;
  
  // Tenant profile mutations
  saveTenantProfile(payload: Partial<TenantFullProfileState>): Promise<void>;
  saveOpeningHours(payload: TenantFullProfileState['openingHours']): Promise<void>;
  savePayments(payload: { stripeEnabled: boolean; paypalEnabled: boolean; cashEnabled: boolean }): Promise<void>;
  saveNotifications(payload: {
    emailNotifications: boolean;
    orderNotifications: boolean;
    lowStockAlerts: boolean;
    staffNotifications: boolean;
  }): Promise<void>;
  saveTenantSecurity(payload: { twoFactorEnabled: boolean; sessionTimeout: number }): Promise<void>;
}

/**
 * Subscription operations
 */
export interface ISubscriptionAdapter {
  getPublicPlans(): Promise<PublicSubscriptionControllerGetPublicPlans200Item[]>;
  getFeatureComparison(): Promise<PublicSubscriptionControllerGetFeatureComparison200>;
  getCurrentSubscription(): Promise<SubscriptionControllerGetCurrent200>;
  getUsage(): Promise<SubscriptionControllerGetUsage200>;
  upgradePlan(data: UpgradeSubscriptionDto): Promise<PaymentIntentResponseDto>;
}

/**
 * Payment verification operations
 */
export interface IPaymentAdapter {
  getPaymentStatus(paymentId: string): Promise<PaymentStatusResponseDto>;
  checkPayment(paymentId: string): Promise<{ confirmed: boolean; status: string }>;
}

export type { SettingsAdapter as ISettingsAdapter };
