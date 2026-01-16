/**
 * Menu Data Factory
 * Selects mock or real API adapter based on feature flags
 * 
 * Architecture (Refactored with Orval):
 * - Real API: Uses Orval-generated functions (type-safe, auto-sync with backend)
 * - Mock API: Legacy adapter for development without backend
 * 
 * Migration Strategy:
 * - Phase 1: Real API uses generated functions (DONE)
 * - Phase 2: Controllers use factory (CURRENT)
 * - Phase 3: Gradually adopt useQuery hooks directly (FUTURE)
 */

import { USE_MOCK_API } from '@/shared/config';
import { log } from '@/shared/logging/logger';
import type { IMenuAdapter } from './adapter.interface';
import { MockMenuAdapter } from './mocks/menu.adapter';
import { menuApi } from './api/menuApi';

const USE_LOGGING = process.env.NEXT_PUBLIC_USE_LOGGING === 'true';

function createMenuAdapter(): IMenuAdapter {
  const useMock = USE_MOCK_API;
  
  if (USE_LOGGING) {
    log(
      'data',
      'Menu adapter mode selected',
      {
        mode: useMock ? 'MOCK' : 'REAL_API',
        implementation: useMock ? 'MockMenuAdapter' : 'menuApi (Orval-generated)',
      },
      { feature: 'menu' },
    );
  }
  
  if (useMock) {
    return new MockMenuAdapter();
  }
  
  // Real API uses Orval-generated functions
  return menuApi;
}

/**
 * Singleton instance
 * Use this for all menu data operations
 */
export const menuAdapter = createMenuAdapter();

/**
 * Legacy class-based factory (deprecated)
 * Kept for backward compatibility with existing controllers
 * TODO: Migrate controllers to use menuAdapter directly
 */
export class MenuDataFactory {
  private static instance: IMenuAdapter = menuAdapter;

  static getStrategy(): IMenuAdapter {
    return this.instance;
  }

  static reset(): void {
    // No-op for generated adapters (stateless)
  }
}
