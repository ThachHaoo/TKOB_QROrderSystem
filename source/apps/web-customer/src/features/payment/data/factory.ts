// Payment feature data factory - selector for mock vs real strategy

import { USE_MOCK_API } from '@/lib/constants';
import type { IPaymentStrategy } from './types';
import { MockPaymentStrategy } from './strategies/MockPaymentStrategy';
import { RealPaymentStrategy } from './strategies/RealPaymentStrategy';

/**
 * Feature-owned factory for payment data strategies
 * Selects between mock and real implementations based on API_MODE
 * 
 * This lives in the feature to make data access transparent to consumers.
 * All payment data operations flow through this factory.
 */
export class PaymentDataFactory {
  private static instance: IPaymentStrategy;

  static getStrategy(): IPaymentStrategy {
    if (!this.instance) {
      this.instance = USE_MOCK_API ? new MockPaymentStrategy() : new RealPaymentStrategy();
    }
    return this.instance;
  }

  /**
   * Reset strategy (useful for testing/switching API modes)
   */
  static reset(): void {
    delete (this as any).instance;
  }
}
