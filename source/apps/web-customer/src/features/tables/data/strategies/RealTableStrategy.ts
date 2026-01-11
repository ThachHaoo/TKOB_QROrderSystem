// Real table strategy - wraps existing RealTableStrategy from api/strategies

import { RealTableStrategy as OriginalRealTableStrategy } from '@/api/strategies/real';
import type { ITableStrategy } from '../types';

/**
 * Feature-owned real table strategy
 * Wraps the existing RealTableStrategy to keep implementation minimal diff
 */
export class RealTableStrategy implements ITableStrategy {
  private delegate: OriginalRealTableStrategy;

  constructor() {
    this.delegate = new OriginalRealTableStrategy();
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
