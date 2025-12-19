/**
 * Tables Service
 * Public API for tables operations
 * Uses adapter pattern to switch between Mock and Real API
 */

import { tablesAdapter } from '@/features/tables/adapters';
import type {
  CreateTableDto,
  UpdateTableDto,
  TableResponseDto,
  TableControllerFindAllParams,
} from '@/services/generated/models';

class TablesService {
  /**
   * Get all tables with optional filters
   */
  async listTables(params?: TableControllerFindAllParams): Promise<TableResponseDto[]> {
    return tablesAdapter.listTables(params);
  }

  /**
   * Get table by ID
   */
  async getTableById(id: string): Promise<TableResponseDto> {
    return tablesAdapter.getTableById(id);
  }

  /**
   * Create new table
   */
  async createTable(data: CreateTableDto): Promise<TableResponseDto> {
    return tablesAdapter.createTable(data);
  }

  /**
   * Update table
   */
  async updateTable(id: string, data: UpdateTableDto): Promise<TableResponseDto> {
    return tablesAdapter.updateTable(id, data);
  }

  /**
   * Delete table (soft delete)
   */
  async deleteTable(id: string): Promise<void> {
    return tablesAdapter.deleteTable(id);
  }

  /**
   * Update table status only
   */
  async updateTableStatus(
    id: string,
    status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'INACTIVE'
  ): Promise<TableResponseDto> {
    return tablesAdapter.updateTableStatus(id, status);
  }

  /**
   * Regenerate QR code for table
   */
  async regenerateQR(id: string): Promise<{
    tableId: string;
    qrToken: string;
    qrCodeUrl: string;
    generatedAt: string;
  }> {
    return tablesAdapter.regenerateQR(id);
  }

  /**
   * Get distinct locations for filter dropdown
   */
  async getLocations(): Promise<string[]> {
    return tablesAdapter.getLocations();
  }
}

export const tablesService = new TablesService();
export default tablesService;
