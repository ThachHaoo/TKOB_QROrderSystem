/**
 * Tables React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tablesService } from '@/services/tables';
import type {
  CreateTableDto,
  UpdateTableDto,
  TableControllerFindAllParams,
} from '@/services/generated/models';

/**
 * List tables query
 */
export const useTablesList = (params?: TableControllerFindAllParams) => {
  return useQuery({
    queryKey: ['tables', 'list', params],
    queryFn: () => tablesService.listTables(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Get table by ID query
 */
export const useTableById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['tables', 'detail', id],
    queryFn: () => tablesService.getTableById(id),
    enabled: options?.enabled ?? !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Create table mutation
 */
export const useCreateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTableDto) => tablesService.createTable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', 'list'] });
    },
  });
};

/**
 * Update table mutation
 */
export const useUpdateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTableDto }) =>
      tablesService.updateTable(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tables', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['tables', 'detail', variables.id] });
    },
  });
};

/**
 * Delete table mutation
 */
export const useDeleteTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tablesService.deleteTable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', 'list'] });
    },
  });
};

/**
 * Update table status mutation
 */
export const useUpdateTableStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'INACTIVE';
    }) => tablesService.updateTableStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tables', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['tables', 'detail', variables.id] });
    },
  });
};

/**
 * Regenerate QR code mutation
 */
export const useRegenerateQR = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tablesService.regenerateQR(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['tables', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['tables', 'detail', id] });
    },
  });
};

/**
 * Get locations query
 */
export const useLocations = () => {
  return useQuery({
    queryKey: ['tables', 'locations'],
    queryFn: () => tablesService.getLocations(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
