/**
 * LEGACY SHIM - DO NOT USE IN NEW CODE
 * 
 * This hook now delegates to features/orders/hooks for backward compatibility
 * during the refactor phase. All order data access should use the feature hooks.
 * 
 * Will be removed after Batch 2 migration is complete.
 * 
 * @deprecated Use `features/orders/hooks` instead
 */

import { useState, useEffect } from 'react'
import { useOrders as useOrdersFeature, useOrder as useOrderFeature } from '@/features/orders/hooks/queries';
import type { Order } from '@/types/order'

interface UseOrdersResult {
  orders: Order[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * @deprecated Use `features/orders/hooks/queries/useOrders` instead
 */
export function useOrders(customerId?: string): UseOrdersResult {
  return useOrdersFeature(customerId);
}

interface UseOrderResult {
  order: Order | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * @deprecated Use `features/orders/hooks/queries/useOrder` instead
 */
export function useOrder(orderId: string): UseOrderResult {
  return useOrderFeature(orderId);
}

interface UseCurrentSessionResult {
  currentOrder: Order | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Hook to fetch current session's order
 * @deprecated Legacy hook - to be refactored
 */
export function useCurrentSessionOrder(): UseCurrentSessionResult {
  // This hook was incomplete in original; maintaining signature only
  return {
    currentOrder: null,
    isLoading: false,
    error: null,
    refetch: async () => {},
  }
}

/**
 * Hook to fetch current session order (active order at table)
 * TODO: Implement getCurrentSession in OrderService when backend is ready
 */
export function useCurrentSession(tableId?: string): UseCurrentSessionResult {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCurrentSession = async () => {
    if (!tableId) {
      setCurrentOrder(null)
      setIsLoading(false)
      return
    }

    // TODO: Implement when OrderService.getCurrentSession is available
    // For now, return empty state
    setIsLoading(false)
    setCurrentOrder(null)
  }

  useEffect(() => {
    fetchCurrentSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId])

  return {
    currentOrder,
    isLoading,
    error,
    refetch: fetchCurrentSession,
  }
}
