// Tables feature data factory - selector for mock vs real strategy

import { USE_MOCK_API } from '@/lib/constants';
import type { ITableStrategy } from './types';
import { MockTableStrategy } from './strategies/MockTableStrategy';
import { RealTableStrategy } from './strategies/RealTableStrategy';

/**
 * Feature-owned factory for table data strategies
 * Selects between mock and real implementations based on API_MODE
 * 
 * This lives in the feature to make data access transparent to consumers.
 * All table data operations flow through this factory.
 */
export class TableDataFactory {
  private static instance: ITableStrategy;

  static getStrategy(): ITableStrategy {
    if (!this.instance) {
      this.instance = USE_MOCK_API ? new MockTableStrategy() : new RealTableStrategy();
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
