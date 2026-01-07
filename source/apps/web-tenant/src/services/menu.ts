/**
 * Menu Service
 * Public API for menu operations
 * Uses adapter pattern to switch between Mock and Real API
 */

import { menuAdapter } from '@/features/menu/data';
import type {
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  CreateModifierGroupDto,
  UpdateModifierGroupDto,
} from '@/services/generated/models';

class MenuService {
  // Categories
  async listCategories(params?: { activeOnly?: boolean }) {
    // params.activeOnly currently unused in adapter; filtering can be added at callsite
    return menuAdapter.categories.findAll();
  }

  async getCategoryById(id: string) {
    return menuAdapter.categories.findOne(id);
  }

  async createCategory(data: CreateMenuCategoryDto) {
    return menuAdapter.categories.create(data);
  }

  async updateCategory(id: string, data: UpdateMenuCategoryDto) {
    return menuAdapter.categories.update(id, data);
  }

  async deleteCategory(id: string) {
    return menuAdapter.categories.delete(id);
  }

  // Menu Items
  async listMenuItems(params?: { categoryId?: string; status?: string; available?: boolean; search?: string; chefRecommended?: boolean; sortBy?: string; sortOrder?: string }) {
    return menuAdapter.items.findAll({
      categoryId: params?.categoryId,
      status: params?.status,
      availability: params?.available === undefined ? undefined : params.available ? 'available' : 'unavailable',
      chefRecommended: params?.chefRecommended,
      searchQuery: params?.search,
      sortBy: params?.sortBy,
    });
  }

  async getMenuItemById(id: string) {
    return menuAdapter.items.findOne(id);
  }

  async createMenuItem(data: CreateMenuItemDto) {
    return menuAdapter.items.create(data);
  }

  async updateMenuItem(id: string, data: UpdateMenuItemDto) {
    return menuAdapter.items.update(id, data);
  }

  async deleteMenuItem(id: string) {
    return menuAdapter.items.delete(id);
  }

  async publishMenuItem(id: string, status: 'DRAFT' | 'PUBLISHED') {
    // Map to update call
    return menuAdapter.items.update(id, { status } as any);
  }

  // Modifier Groups
  async listModifierGroups(params?: { activeOnly?: boolean }) {
    return menuAdapter.modifiers.findAll();
  }

  async getModifierGroupById(id: string) {
    const list = await menuAdapter.modifiers.findAll();
    return list.find((g: any) => g.id === id);
  }

  async createModifierGroup(data: CreateModifierGroupDto) {
    return menuAdapter.modifiers.create(data as any);
  }

  async updateModifierGroup(id: string, data: UpdateModifierGroupDto) {
    return menuAdapter.modifiers.update(id, data as any);
  }

  async deleteModifierGroup(id: string) {
    return menuAdapter.modifiers.delete(id);
  }
}

export const menuService = new MenuService();
export default menuService;
