// Menu feature data factory - selector for mock vs real strategy

import { USE_MOCK_API } from '@/lib/constants';
import { IMenuStrategy } from './types';
import { MockMenuStrategy } from './strategies/MockMenuStrategy';
import { RealMenuStrategy } from './strategies/RealMenuStrategy';

/**
 * Feature-owned factory for menu data strategies
 * Selects between mock and real implementations based on API_MODE
 * 
 * This lives in the feature to make data access transparent to consumers.
 * All menu data fetching flows through this factory.
 */
export class MenuDataFactory {
  private static instance: IMenuStrategy;

  static getStrategy(): IMenuStrategy {
    if (!this.instance) {
      this.instance = USE_MOCK_API ? new MockMenuStrategy() : new RealMenuStrategy();
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
