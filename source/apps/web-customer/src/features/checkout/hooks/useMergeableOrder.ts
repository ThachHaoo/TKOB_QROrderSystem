/**
 * Hook for checking if there's a mergeable order
 * When customer has an unpaid BILL_TO_TABLE order, new items can be appended to it
 */

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { useSession } from '@/features/tables/hooks/useSession';

export interface MergeableOrderInfo {
  hasMergeableOrder: boolean;
  existingOrder?: {
    id: string;
    orderNumber: string;
    total: number;
    itemCount: number;
    createdAt: string;
  };
  message: string;
}

export function useMergeableOrder() {
  const { session } = useSession();

  return useQuery<MergeableOrderInfo>({
    queryKey: ['mergeable-order', session?.tableId],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: MergeableOrderInfo }>('/orders/mergeable');
      return response.data.data;
    },
    enabled: !!session?.tableId,
    staleTime: 5000, // 5 seconds - check relatively frequently
    refetchOnWindowFocus: true,
  });
}

/**
 * API function to append items to existing order
 * @param orderId - ID of the order to append items to
 * @returns Updated order response
 */
export async function appendItemsToOrder(orderId: string): Promise<any> {
  const response = await apiClient.post(`/orders/${orderId}/append-items`);
  return response.data.data;
}
