/**
 * @deprecated Legacy shim - prefer features/tables/data
 * 
 * This service delegates to the feature-owned table data layer.
 * Use TableDataFactory directly from @/features/tables/data for new code.
 */

import { TableDataFactory } from '@/features/tables/data';
import type { SessionInfo } from '@/features/tables/data';
import { ApiResponse, Table, Restaurant } from '@/types';

// Re-export SessionInfo for backward compatibility
export type { SessionInfo };

export const TableService = {
  /**
   * @deprecated Use TableDataFactory.getStrategy().validateQRToken() instead
   */
  async validateQRToken(token: string): Promise<ApiResponse<{
    table: Table;
    restaurant: Restaurant;
  }>> {
    const strategy = TableDataFactory.getStrategy();
    return strategy.validateQRToken(token);
  },
  
  /**
   * @deprecated Use TableDataFactory.getStrategy().getCurrentSession() instead
   */
  async getCurrentSession(): Promise<SessionInfo> {
    const strategy = TableDataFactory.getStrategy();
    return strategy.getCurrentSession();
  },
  
  /**
   * @deprecated Use TableDataFactory.getStrategy().getTableInfo() instead
   */
  async getTableInfo(tableId: string): Promise<ApiResponse<Table>> {
    const strategy = TableDataFactory.getStrategy();
    return strategy.getTableInfo(tableId);
  },
};
