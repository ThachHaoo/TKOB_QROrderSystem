/**
 * Tables Adapter Factory
 * Chooses between Mock and Real API adapter based on config
 */

import { config } from '@/lib/config';
import type { ITablesAdapter } from './types';
import { TablesMockAdapter } from './mock';
import { TablesApiAdapter } from './api';

/**
 * Get the appropriate tables adapter based on configuration
 */
export const getTablesAdapter = (): ITablesAdapter => {
  if (config.useMockData) {
    return new TablesMockAdapter();
  }
  return new TablesApiAdapter();
};

/**
 * Singleton instance
 */
export const tablesAdapter = getTablesAdapter();
