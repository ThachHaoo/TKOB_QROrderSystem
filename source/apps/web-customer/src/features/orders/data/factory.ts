// Orders feature data factory

import { USE_MOCK_API } from '@/lib/constants';
import { IOrdersStrategy } from './types';
import { MockOrdersStrategy } from './strategies/MockOrdersStrategy';
import { RealOrdersStrategy } from './strategies/RealOrdersStrategy';

/**
 * Feature-owned factory for orders data strategies
 */
export class OrdersDataFactory {
  private static instance: IOrdersStrategy;

  static getStrategy(): IOrdersStrategy {
    if (!this.instance) {
      this.instance = USE_MOCK_API ? new MockOrdersStrategy() : new RealOrdersStrategy();
    }
    return this.instance;
  }

  static reset(): void {
    delete (this as any).instance;
  }
}
