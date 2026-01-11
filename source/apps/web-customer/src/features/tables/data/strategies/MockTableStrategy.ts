// Mock table strategy - wraps existing MockTableStrategy from api/strategies

import { MockTableStrategy as OriginalMockTableStrategy } from '@/api/strategies/mock';
import type { ITableStrategy } from '../types';

/**
 * Feature-owned mock table strategy
 * Wraps the existing MockTableStrategy to keep implementation minimal diff
 */
export class MockTableStrategy implements ITableStrategy {
  private delegate: OriginalMockTableStrategy;

  constructor() {
    this.delegate = new OriginalMockTableStrategy();
  }

  async validateQRToken(token: string) {
    return this.delegate.validateQRToken(token);
  }
  
  async getCurrentSession() {
    return this.delegate.getCurrentSession();
  }
  
  async getTableInfo(tableId: string) {
    return this.delegate.getTableInfo(tableId);
  }
}
