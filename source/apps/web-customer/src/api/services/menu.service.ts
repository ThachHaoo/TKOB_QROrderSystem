// Menu service - handles menu-related API calls

import { USE_MOCK_API } from '@/lib/constants';
import { menuHandlers } from '@/api/mocks';
import apiClient from '@/api/client';
import { ApiResponse, MenuItem } from '@/types';

export const MenuService = {
  /**
   * Get public menu with QR token
   */
  async getPublicMenu(token: string): Promise<ApiResponse<{
    items: MenuItem[];
    categories: string[];
  }>> {
    if (USE_MOCK_API) {
      return menuHandlers.getPublicMenu(token);
    }
    
    const response = await apiClient.get(`/api/menu/public?token=${token}`);
    return response.data;
  },
  
  /**
   * Get single menu item by ID
   */
  async getMenuItem(id: string): Promise<ApiResponse<MenuItem>> {
    if (USE_MOCK_API) {
      return menuHandlers.getMenuItem(id);
    }
    
    const response = await apiClient.get(`/api/menu/items/${id}`);
    return response.data;
  },
  
  /**
   * Search menu items
   */
  async searchMenuItems(query: string): Promise<ApiResponse<MenuItem[]>> {
    if (USE_MOCK_API) {
      return menuHandlers.searchMenuItems(query);
    }
    
    const response = await apiClient.get(`/api/menu/search?q=${query}`);
    return response.data;
  },
  
  /**
   * Get items by category
   */
  async getItemsByCategory(category: string): Promise<ApiResponse<MenuItem[]>> {
    if (USE_MOCK_API) {
      return menuHandlers.getItemsByCategory(category);
    }
    
    const response = await apiClient.get(`/api/menu/category/${category}`);
    return response.data;
  },
};
