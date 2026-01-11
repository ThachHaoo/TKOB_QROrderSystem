/**
 * LEGACY SHIM - DO NOT USE IN NEW CODE
 * 
 * This hook now delegates to features/menu/hooks for backward compatibility
 * during the refactor phase. All menu data access should use the feature hook.
 * 
 * Will be removed after Batch 2 migration is complete.
 * 
 * @deprecated Use `features/menu/hooks/useMenu()` instead
 */

import { useMenu as useMenuFeature, useMenuItem as useMenuItemFeature } from '@/features/menu/hooks';
import { MenuItem, ApiResponse } from '@/types'

interface UseMenuItemReturn {
  item: MenuItem | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * @deprecated Use `features/menu/hooks/useMenuItem()` instead
 */
export function useMenuItem(itemId: string): UseMenuItemReturn {
  return useMenuItemFeature(itemId);
}

interface UseMenuReturn {
  data: MenuItem[] | null
  items: MenuItem[]
  categories: string[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * @deprecated Use `features/menu/hooks/useMenu()` instead
 */
export function useMenu(tenantId?: string): UseMenuReturn {
  return useMenuFeature(tenantId);
}
