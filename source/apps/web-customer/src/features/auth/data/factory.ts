// Auth feature data factory

import { USE_MOCK_API } from '@/lib/constants';
import { IAuthStrategy } from './types';
import { MockAuthStrategy } from './strategies/MockAuthStrategy';
import { RealAuthStrategy } from './strategies/RealAuthStrategy';

/**
 * Feature-owned factory for auth data strategies
 */
export class AuthDataFactory {
  private static instance: IAuthStrategy;

  static getStrategy(): IAuthStrategy {
    if (!this.instance) {
      this.instance = USE_MOCK_API ? new MockAuthStrategy() : new RealAuthStrategy();
    }
    return this.instance;
  }

  static reset(): void {
    delete (this as any).instance;
  }
}
