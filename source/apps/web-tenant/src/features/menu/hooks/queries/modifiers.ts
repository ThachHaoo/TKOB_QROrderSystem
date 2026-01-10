/**
 * Modifiers Hooks
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuAdapter } from '../../data';

const MODIFIERS_QUERY_KEY = ['menu', 'modifiers'] as const;

export const useModifiers = (_params?: { activeOnly?: boolean }) => {
  return useQuery({
    queryKey: ['menu', 'modifiers'],
    queryFn: () => menuAdapter.modifiers.findAll(),
    select: (data) => {
      // Clone data to ensure new array/object references on every query
      // This allows memoized selectors in controller to re-compute when data changes in-place
      return (data ?? []).map((g: any) => ({
        ...g,
        options: (g.options ?? []).map((o: any) => ({ ...o })),
      }));
    },
  });
};

export const useCreateModifier = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => menuAdapter.modifiers.create(data),
    onSuccess: (data) => {
      console.log('[useCreateModifier] onSuccess, calling controller callback first');
      // Call controller callback first to handle cache update
      options?.mutation?.onSuccess?.(data);
      // Background sync after callback completes
      queryClient.invalidateQueries({ queryKey: MODIFIERS_QUERY_KEY });
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useUpdateModifier = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      menuAdapter.modifiers.update(id, data),
    onSuccess: (data) => {
      // Call controller callback first
      options?.mutation?.onSuccess?.(data);
      // Background sync
      queryClient.invalidateQueries({ queryKey: MODIFIERS_QUERY_KEY });
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useDeleteModifier = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuAdapter.modifiers.delete(id),
    onSuccess: (data, groupId: string) => {
      // Call controller callback first with group id
      options?.mutation?.onSuccess?.(data, groupId);
      // Background sync
      queryClient.invalidateQueries({ queryKey: MODIFIERS_QUERY_KEY });
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};
