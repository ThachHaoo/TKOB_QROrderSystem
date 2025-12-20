// Table service - handles table session and QR validation

import { USE_MOCK_API } from '@/lib/constants';
import { tableHandlers } from '@/api/mocks';
import apiClient from '@/api/client';
import { ApiResponse, Table, Restaurant } from '@/types';

export const TableService = {
  /**
   * Validate QR token and get table session
   */
  async validateQRToken(token: string): Promise<ApiResponse<{
    table: Table;
    restaurant: Restaurant;
  }>> {
    if (USE_MOCK_API) {
      return tableHandlers.validateQRToken(token);
    }
    
    const response = await apiClient.post('/api/table/validate-qr', { token });
    return response.data;
  },
  
  /**
   * Get table information
   */
  async getTableInfo(tableId: string): Promise<ApiResponse<Table>> {
    if (USE_MOCK_API) {
      return tableHandlers.getTableInfo(tableId);
    }
    
    const response = await apiClient.get(`/api/table/${tableId}`);
    return response.data;
  },
};
