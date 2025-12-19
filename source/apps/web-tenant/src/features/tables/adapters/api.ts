/**
 * Tables API Adapter
 * Real API implementation using Orval generated functions
 */

import type { ITablesAdapter } from './types';
import type {
  CreateTableDto,
  UpdateTableDto,
  TableResponseDto,
  TableControllerFindAllParams,
} from '@/services/generated/models';
import {
  tableControllerCreate,
  tableControllerFindAll,
  tableControllerFindOne,
  tableControllerUpdate,
  tableControllerDelete,
  tableControllerUpdateStatus,
  tableControllerGetLocations,
  tableControllerRegenerateQr,
} from '@/services/generated/tables/tables';

export class TablesApiAdapter implements ITablesAdapter {
  async listTables(params?: TableControllerFindAllParams): Promise<TableResponseDto[]> {
    console.log('🌐 [API Adapter] Calling tableControllerFindAll with params:', params);
    try {
      const result = await tableControllerFindAll(params);
      console.log('🌐 [API Adapter] tableControllerFindAll response:', result);
      console.log('🌐 [API Adapter] Response type:', typeof result);
      console.log('🌐 [API Adapter] Is Array:', Array.isArray(result));
      return result;
    } catch (error) {
      console.error('🌐 [API Adapter] Error:', error);
      throw error;
    }
  }

  async getTableById(id: string): Promise<TableResponseDto> {
    return tableControllerFindOne(id);
  }

  async createTable(data: CreateTableDto): Promise<TableResponseDto> {
    return tableControllerCreate(data);
  }

  async updateTable(id: string, data: UpdateTableDto): Promise<TableResponseDto> {
    return tableControllerUpdate(id, data);
  }

  async deleteTable(id: string): Promise<void> {
    await tableControllerDelete(id);
  }

  async updateTableStatus(
    id: string,
    status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'INACTIVE'
  ): Promise<TableResponseDto> {
    return tableControllerUpdateStatus(id, { status });
  }

  async regenerateQR(id: string): Promise<{
    tableId: string;
    qrToken: string;
    qrCodeUrl: string;
    generatedAt: string;
  }> {
    return tableControllerRegenerateQr(id);
  }

  async getLocations(): Promise<string[]> {
    return tableControllerGetLocations();
  }
}
