'use client';

import type {
  CreateMenuCategoryDto,
  CreateMenuItemDto,
  UpdateMenuCategoryDto,
  UpdateMenuItemDto,
} from '@/services/generated/models';
import type { Category, MenuItem, MenuItemFormData } from '../model/types';
import { useCategoryModalState } from './useCategoryModalState';
import { useItemModalState } from './useItemModalState';
import { usePhotoManager } from './usePhotoManager';
import { useToasts } from './useToasts';
import { useMenuCrudMutations } from './useMenuCrudMutations';
import { useMenuDeleteState } from './useMenuDeleteState';

export function useMenuMutationsController(selectedCategory: string) {

  const {
    isCategoryModalOpen,
    categoryModalMode,
    editingCategory,
    newCategoryName,
    newCategoryDescription,
    newCategoryDisplayOrder,
    newCategoryActive,
    setNewCategoryName,
    setNewCategoryDescription,
    setNewCategoryDisplayOrder,
    setNewCategoryActive,
    openAddCategory,
    openEditCategory,
    closeCategoryModal,
  } = useCategoryModalState();

  const {
    isItemModalOpen,
    itemModalMode,
    currentEditItemId,
    itemFormData,
    setItemFormData,
    openAddItem,
    openEditItem,
    closeItemModal,
  } = useItemModalState();

  const {
    isDeleteModalOpen,
    itemToDelete,
    handleDeleteClick: _handleDeleteClick,
    closeDeleteModal,
  } = useMenuDeleteState();

  const { showSuccessToast, setShowSuccessToast, toastMessage, setToastMessage } = useToasts(3000);
  const { getOperations: getPhotoOps, executeAll: executePhotoOps } = usePhotoManager();

  const notify = (msg: string) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
  };

  const notifyError = (msg: string) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
  };

  const { menuMutations } = useMenuCrudMutations({ notify, notifyError });

  const handleOpenAddCategoryModal = () => openAddCategory();
  const handleEditCategory = (category: Category) => openEditCategory(category);
  const handleCloseCategoryModal = () => closeCategoryModal();

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) return;

    const categoryData: CreateMenuCategoryDto = {
      name: newCategoryName,
      description: newCategoryDescription || undefined,
      active: newCategoryActive,
    };

    const displayOrder = newCategoryDisplayOrder.trim();
    if (displayOrder) {
      categoryData.displayOrder = parseInt(displayOrder, 10);
    }

    try {
      if (categoryModalMode === 'edit' && editingCategory) {
        await menuMutations.categories.update({
          id: editingCategory.id,
          data: categoryData as UpdateMenuCategoryDto,
        });
      } else {
        await menuMutations.categories.create(categoryData);
      }

      closeCategoryModal();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleToggleCategoryActive = async (category: Category) => {
    await menuMutations.categories.update({
      id: category.id,
      data: { active: !category.active },
    });
    setToastMessage(`Danh mục "${category.name}" đã ${!category.active ? 'kích hoạt' : 'vô hiệu hóa'}`);
    setShowSuccessToast(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await menuMutations.categories.delete(categoryId);
  };

  const handleOpenAddItemModal = () => {
    openAddItem(selectedCategory);
  };

  const handleOpenEditItemModal = (item: MenuItem) => {
    openEditItem(item);
  };

  const handleCloseItemModal = () => {
    closeItemModal();
  };

  const handleSaveItem = async () => {
    if (!itemFormData.name.trim() || itemFormData.price <= 0 || !itemFormData.categoryId) {
      setToastMessage('Please fill in all required fields');
      setShowSuccessToast(true);
      return;
    }

    if (itemFormData.preparationTime < 0 || itemFormData.preparationTime > 240) {
      setToastMessage('Preparation time must be between 0 and 240 minutes');
      setShowSuccessToast(true);
      return;
    }

    try {
      if (itemModalMode === 'add') {
        const result = await menuMutations.items.create({
          name: itemFormData.name,
          categoryId: itemFormData.categoryId,
          description: itemFormData.description || undefined,
          price: itemFormData.price,
          status: itemFormData.status,
          preparationTime: itemFormData.preparationTime,
          available: itemFormData.available,
          allergens: itemFormData.allergens,
          tags: itemFormData.dietary,
          chefRecommended: itemFormData.chefRecommended,
          displayOrder: itemFormData.displayOrder,
          modifierGroupIds: itemFormData.modifierGroupIds,
        } as CreateMenuItemDto);

        if (result?.id) {
          const ops = getPhotoOps(result.id, itemFormData as MenuItemFormData);
          await executePhotoOps(ops);
        }

        setToastMessage(`Món "${itemFormData.name}" đã được tạo`);
      } else if (currentEditItemId) {
        const updatePromises: Promise<unknown>[] = [
          menuMutations.items.update({
            id: currentEditItemId,
            data: ({
              name: itemFormData.name,
              categoryId: itemFormData.categoryId,
              description: itemFormData.description || undefined,
              price: itemFormData.price,
              status: itemFormData.status,
              preparationTime: itemFormData.preparationTime,
              available: itemFormData.available,
              allergens: itemFormData.allergens,
              tags: itemFormData.dietary,
              chefRecommended: itemFormData.chefRecommended,
              displayOrder: itemFormData.displayOrder,
              modifierGroupIds: itemFormData.modifierGroupIds,
            }) as UpdateMenuItemDto,
          }),
        ];

        updatePromises.push(...getPhotoOps(currentEditItemId, itemFormData as MenuItemFormData));

        await Promise.all(updatePromises);

        setToastMessage(`Món "${itemFormData.name}" đã được cập nhật`);
      }

      setShowSuccessToast(true);
      handleCloseItemModal();
    } catch (error) {
      console.error('Error in handleSaveItem:', error);
    }
  };

  const handleDeleteClick = (item: MenuItem) => {
    _handleDeleteClick(item);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await menuMutations.items.delete(itemToDelete.id);
      closeDeleteModal();
    } catch (error) {
      console.error('Error in handleConfirmDelete:', error);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const newAvailable = !item.isAvailable;
      await menuMutations.items.update({
        id: item.id,
        data: ({ available: newAvailable }) as UpdateMenuItemDto,
      });
      setToastMessage(`"${item.name}" is now ${newAvailable ? 'available' : 'unavailable'}`);
      setShowSuccessToast(true);
    } catch (error) {
      console.error('Error toggling availability:', error);
      setToastMessage('Failed to update availability');
      setShowSuccessToast(true);
    }
  };

  return {
    // state
    isCategoryModalOpen,
    categoryModalMode,
    editingCategory,
    newCategoryName,
    newCategoryDescription,
    newCategoryDisplayOrder,
    newCategoryActive,
    isItemModalOpen,
    itemModalMode,
    currentEditItemId,
    itemFormData,
    isDeleteModalOpen,
    itemToDelete,
    showSuccessToast,
    toastMessage,

    // setters
    setNewCategoryName,
    setNewCategoryDescription,
    setNewCategoryDisplayOrder,
    setNewCategoryActive,
    setItemFormData,

    // handlers
    handleOpenAddCategoryModal,
    handleEditCategory,
    handleCloseCategoryModal,
    handleSaveCategory,
    handleToggleCategoryActive,
    handleDeleteCategory,
    handleOpenAddItemModal,
    handleOpenEditItemModal,
    handleCloseItemModal,
    handleSaveItem,
    handleDeleteClick,
    handleConfirmDelete,
    closeDeleteModal,
    handleToggleAvailability,
  };
}
