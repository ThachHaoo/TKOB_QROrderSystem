/**
 * Menu Mock Adapter
 * Mock data for development/testing
 */

import type {
  MenuCategoryResponseDto,
  MenuItemResponseDto,
  ModifierGroupResponseDto,
} from '@/services/generated/models';
import { mockCategories, mockMenuItems, mockModifierGroups } from '@/services/mocks/menu-data';

/**
 * Menu Categories Mock
 */
export const menuCategoriesMock = {
  async findAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCategories;
  },
  async create(data: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newCategory = { 
      id: Date.now().toString(), 
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockCategories.push(newCategory);
    return newCategory;
  },
  async update(id: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      mockCategories[index] = { 
        ...mockCategories[index], 
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return mockCategories[index];
    }
    return { id, ...data };
  },
  async delete(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      mockCategories.splice(index, 1);
    }
    return { success: true };
  },
};

/**
 * Menu Items Mock
 */
export const menuItemsMock = {
  async findAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMenuItems;
  },
  async create(data: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newItem = {
      id: Date.now().toString(), 
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockMenuItems.push(newItem);
    return newItem;
  },
  async update(id: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockMenuItems.findIndex(i => i.id === id);
    if (index !== -1) {
      mockMenuItems[index] = { 
        ...mockMenuItems[index], 
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return mockMenuItems[index];
    }
    return { id, ...data };
  },
  async delete(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockMenuItems.findIndex(i => i.id === id);
    if (index !== -1) {
      mockMenuItems.splice(index, 1);
    }
    return { success: true };
  },
};

/**
 * Modifiers Mock
 */
export const modifiersMock = {
  async findAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('🎭 [ModifiersMock] Returning mock modifier groups:', mockModifierGroups.length);
    return mockModifierGroups;
  },
  async create(data: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newModifier = {
      id: Date.now().toString(), 
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockModifierGroups.push(newModifier);
    return newModifier;
  },
  async update(id: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockModifierGroups.findIndex(m => m.id === id);
    if (index !== -1) {
      mockModifierGroups[index] = { 
        ...mockModifierGroups[index], 
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return mockModifierGroups[index];
    }
    return { id, ...data };
  },
  async delete(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockModifierGroups.findIndex(m => m.id === id);
    if (index !== -1) {
      mockModifierGroups.splice(index, 1);
    }
    return { success: true };
  },
};

/**
 * Menu Photos Mock
 */
export const menuPhotosMock = {
  async upload(file: File) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { url: URL.createObjectURL(file), id: Date.now().toString() };
  },
  async delete(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },
};

// Unified mock
export const menuMock = {
  categories: menuCategoriesMock,
  items: menuItemsMock,
  modifiers: modifiersMock,
  photos: menuPhotosMock,
};
