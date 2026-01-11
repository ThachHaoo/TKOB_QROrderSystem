/**
 * LEGACY SHIM - DO NOT USE IN NEW CODE
 * 
 * This service now delegates to features/menu/data for backward compatibility
 * during the refactor phase. All menu data access should go through the feature.
 * 
 * Will be removed after Batch 2 migration is complete.
 * 
 * @deprecated Use `features/menu/data/factory.ts` or `features/menu/hooks` instead
 */

import { ApiResponse, MenuItem } from '@/types';
import { MenuDataFactory } from '@/features/menu/data';

export const MenuService = {
  /**
   * Get public menu (session-based, no token needed)
   * @deprecated Use `features/menu/hooks/useMenu()` instead
   */
  async getPublicMenu(
    tenantId?: string,
    options?: {
      chefRecommended?: boolean;
      sortBy?: 'displayOrder' | 'popularity' | 'price' | 'name';
      sortOrder?: 'asc' | 'desc';
      search?: string;
      categoryId?: string;
    }
  ): Promise<ApiResponse<{
    items: MenuItem[];
    categories: string[];
  }>> {
    const strategy = MenuDataFactory.getStrategy();
    return strategy.getPublicMenu();
  },

  /**
   * Get single menu item by ID
   * @deprecated Use `features/menu/hooks/useMenuItem()` instead
   */
  async getMenuItem(id: string): Promise<ApiResponse<MenuItem>> {
    const strategy = MenuDataFactory.getStrategy();
    return strategy.getMenuItem(id);
  },

  /**
   * Search menu items
   * @deprecated Use feature data layer directly
   */
  async searchMenuItems(query: string): Promise<ApiResponse<MenuItem[]>> {
    const strategy = MenuDataFactory.getStrategy();
    return strategy.searchMenuItems(query);
  },
};
