/**
 * Menu API Adapter
 * Real API implementation using orval-generated hooks
 */

import type { IMenuAdapter } from './types';
import {
  menuCategoryControllerFindAll,
  menuCategoryControllerFindOne,
  menuCategoryControllerCreate,
  menuCategoryControllerUpdate,
  menuCategoryControllerDelete,
} from '@/services/generated/menu-categories/menu-categories';
import {
  menuItemsControllerFindAll,
  menuItemsControllerFindOne,
  menuItemsControllerCreate,
  menuItemsControllerUpdate,
  menuItemsControllerDelete,
  menuItemsControllerTogglePublish,
} from '@/services/generated/menu-items/menu-items';
import {
  modifierGroupControllerFindAll,
  modifierGroupControllerFindOne,
  modifierGroupControllerCreate,
  modifierGroupControllerUpdate,
  modifierGroupControllerDelete,
} from '@/services/generated/menu-modifiers/menu-modifiers';

export class MenuApiAdapter implements IMenuAdapter {
  /**
   * Transform menu item response to flatten nested modifierGroups structure
   * Maps: modifierGroups[].modifierGroup → modifierGroups[]
   */
  private transformMenuItemResponse(item: any): any {
    if (!item) return item;

    return {
      ...item,
      modifierGroups: item.modifierGroups
        ? item.modifierGroups.map((mm: any) => ({
            id: mm.modifierGroup.id,
            name: mm.modifierGroup.name,
            description: mm.modifierGroup.description,
            type: mm.modifierGroup.type,
            required: mm.modifierGroup.required,
            minChoices: mm.modifierGroup.minChoices,
            maxChoices: mm.modifierGroup.maxChoices,
            displayOrder: mm.modifierGroup.displayOrder,
            active: mm.modifierGroup.active,
            options: mm.modifierGroup.options || [],
          }))
        : [],
    };
  }

  // Categories
  async listCategories(params?: { activeOnly?: boolean }) {
    const data = await menuCategoryControllerFindAll(params);
    // Wrap array response into expected format
    if (Array.isArray(data)) {
      return {
        data,
        meta: {
          total: data.length,
          page: 1,
          limit: 100,
          totalPages: 1,
        },
      };
    }
    // If already wrapped (shouldn't happen), return as-is
    return data;
  }

  async getCategoryById(id: string) {
    return menuCategoryControllerFindOne(id);
  }

  async createCategory(data: any) {
    return menuCategoryControllerCreate(data);
  }

  async updateCategory(id: string, data: any) {
    return menuCategoryControllerUpdate(id, data);
  }

  async deleteCategory(id: string) {
    await menuCategoryControllerDelete(id);
  }

  // Menu Items
  async listMenuItems() {
    const data = await menuItemsControllerFindAll();
    // Wrap array response into expected format
    if (Array.isArray(data)) {
      return {
        data: data.map(item => this.transformMenuItemResponse(item)),
        meta: {
          total: data.length,
          page: 1,
          limit: 100,
          totalPages: 1,
        },
      };
    }
    // If already wrapped, transform data array
    if (data?.data) {
      data.data = data.data.map((item: any) => this.transformMenuItemResponse(item));
    }
    return data;
  }

  async getMenuItemById(id: string) {
    const item = await menuItemsControllerFindOne(id);
    return this.transformMenuItemResponse(item);
  }

  async createMenuItem(data: any) {
    return menuItemsControllerCreate(data);
  }

  async updateMenuItem(id: string, data: any) {
    return menuItemsControllerUpdate(id, data);
  }

  async deleteMenuItem(id: string) {
    await menuItemsControllerDelete(id);
  }

  async publishMenuItem(id: string, status: 'DRAFT' | 'PUBLISHED') {
    const publish = status === 'PUBLISHED';
    return menuItemsControllerTogglePublish(id, { publish });
  }

  // Modifier Groups
  async listModifierGroups(params?: { activeOnly?: boolean }) {
    const data = await modifierGroupControllerFindAll(params ?? {});
    // Wrap array response into expected format
    if (Array.isArray(data)) {
      return {
        data,
        meta: {
          total: data.length,
          page: 1,
          limit: 100,
          totalPages: 1,
        },
      };
    }
    // If already wrapped, return as-is
    return data;
  }

  async getModifierGroupById(id: string) {
    return modifierGroupControllerFindOne(id);
  }

  async createModifierGroup(data: any) {
    return modifierGroupControllerCreate(data);
  }

  async updateModifierGroup(id: string, data: any) {
    return modifierGroupControllerUpdate(id, data);
  }

  async deleteModifierGroup(id: string) {
    return modifierGroupControllerDelete(id);
  }
}
