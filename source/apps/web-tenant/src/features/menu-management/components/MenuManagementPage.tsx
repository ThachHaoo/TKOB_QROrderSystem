'use client';

import React, { useState } from 'react';
import { Card, Badge, Toast } from '@/shared/components/ui';
 import { MenuTabs } from './MenuTabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  X, 
  Image as ImageIcon, 
  Search,
  Leaf,
  Flame,
  Milk,
  ChevronDown,
  Star
} from 'lucide-react';

// React Query
import { useQueryClient } from '@tanstack/react-query';

// API Hooks - Categories
import {
  useMenuCategoryControllerFindAll,
  useMenuCategoryControllerCreate,
  useMenuCategoryControllerDelete,
} from '@/services/generated/menu-categories/menu-categories';

// API Hooks - Menu Items
import {
  useMenuItemsControllerFindAll,
  useMenuItemsControllerCreate,
  useMenuItemsControllerUpdate,
  useMenuItemsControllerDelete,
} from '@/services/generated/menu-items/menu-items';

// API Hooks - Modifier Groups
import {
  useModifierGroupControllerFindAll,
} from '@/services/generated/menu-modifiers/menu-modifiers';

// API Hooks - Photos
import {
  useMenuPhotoControllerUploadPhoto,
} from '@/services/generated/menu-photos/menu-photos';

// Full featured Menu Management matching Admin-screens-v3 design
export function MenuManagementPage() {
  // React Query
  const queryClient = useQueryClient();

  // UI State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [sortOption, setSortOption] = useState('Sort by: Newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Archive filter state - Applied filters
  const [selectedArchiveStatus, setSelectedArchiveStatus] = useState<'all' | 'archived'>('all');
  // Temporary archive filter (used in dropdown before Apply)
  const [tempSelectedArchiveStatus, setTempSelectedArchiveStatus] = useState<'all' | 'archived'>('all');

  // Fetch Categories from API
  const { data: categoriesResponse, isLoading: _categoriesLoading } = useMenuCategoryControllerFindAll();
  // axios.ts already unwraps {success, data} → categoriesResponse is the array directly
  const categories = categoriesResponse || [];

  // Fetch Menu Items from API
  const { data: itemsResponse, isLoading: _itemsLoading } = useMenuItemsControllerFindAll();
  // Backend returns paginated response: { data: MenuItemResponseDto[], meta: {...} }
  // Axios unwraps outer { success, data } → menuItemsResponse = { data: [], meta: {} }
  const menuItems = Array.isArray(itemsResponse) 
    ? itemsResponse 
    : (itemsResponse as any)?.data || [];

  // Fetch Modifier Groups for selection
  const { data: modifierGroupsResponse } = useModifierGroupControllerFindAll({ activeOnly: false });
  const modifierGroups = modifierGroupsResponse || [];

  // Category Mutations
  const createCategoryMutation = useMenuCategoryControllerCreate({
    mutation: {
      onSuccess: (response) => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/categories'] });
        setNewCategoryName('');
        setNewCategoryDescription('');
        setIsAddCategoryModalOpen(false);
        // response is already the category object, no need for .data
        setToastMessage(`Category "${response.name}" created successfully`);
        setShowSuccessToast(true);
      },
    }
  });

  const _deleteCategoryMutation = useMenuCategoryControllerDelete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/categories'] });
      },
      onError: (error) => {
        console.error('Error deleting category:', error);
        setToastMessage('Có lỗi khi xóa danh mục');
        setShowSuccessToast(true);
      }
    }
  });

  // Menu Item Mutations
  const createItemMutation = useMenuItemsControllerCreate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/item'] });
        setToastMessage('Menu item created successfully');
        setShowSuccessToast(true);
      },
      onError: (error) => {
        console.error('Error creating item:', error);
        setToastMessage('Failed to create menu item');
        setShowSuccessToast(true);
      }
    }
  });

  const updateItemMutation = useMenuItemsControllerUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/item'] });
      },
      onError: (error) => {
        console.error('Error updating item:', error);
        setToastMessage('Có lỗi khi cập nhật món ăn');
        setShowSuccessToast(true);
      }
    }
  });

  const deleteItemMutation = useMenuItemsControllerDelete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/item'] });
      },
      onError: (error) => {
        console.error('Error deleting item:', error);
        setToastMessage('Có lỗi khi xóa món ăn');
        setShowSuccessToast(true);
      }
    }
  });

  // Photo Upload Mutation
  const uploadPhotoMutation = useMenuPhotoControllerUploadPhoto({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/item'] });
      },
      onError: (error) => {
        console.error('Error uploading photo:', error);
      }
    }
  });
  
  // Add/Edit Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState<'add' | 'edit'>('add');
  const [currentEditItemId, setCurrentEditItemId] = useState<string | null>(null);
  const [itemFormData, setItemFormData] = useState({
    name: '',
    category: selectedCategory,
    description: '',
    price: '',
    status: 'available' as 'available' | 'unavailable' | 'sold_out',
    image: null as File | null,
    dietary: [] as string[],
    chefRecommended: false,
    modifierGroupIds: [] as string[], // Add modifier groups selection
  });

  // Mock data đã được thay thế bằng API calls ở trên

  const getCategoryItemCount = (categoryId: string) => {
    return menuItems.filter(
      (item: any) => item.categoryId === categoryId
    ).length;
  };

  const visibleMenuItems = menuItems
    .filter((item: any) => {
      if (selectedCategory === 'all') return true;
      return item.categoryId === selectedCategory;
    })
    .filter((item: any) => {
      // Archive status filter
      if (selectedArchiveStatus === 'archived') {
        return item.status === 'ARCHIVED';
      } else { // 'all' - show only active (non-archived)
        return item.status !== 'ARCHIVED';
      }
    })
    .filter((item: any) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        (item.description || '').toLowerCase().includes(query)
      );
    })
    .filter((item: any) => {
      if (selectedStatus === 'All Status') return true;
      // Map backend status to frontend
      if (selectedStatus === 'Available') return item.isAvailable && item.status !== 'SOLD_OUT';
      if (selectedStatus === 'Unavailable') return !item.isAvailable;
      if (selectedStatus === 'Sold Out') return item.status === 'SOLD_OUT';
      return true;
    })
    .sort((a: any, b: any) => {
      if (sortOption === 'Sort by: Popularity') {
        return (b.popularity || 0) - (a.popularity || 0); // Higher popularity first
      }
      if (sortOption === 'Sort by: Price (Low)') {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortOption === 'Sort by: Price (High)') {
        return (b.price || 0) - (a.price || 0);
      }
      // Default: Newest (by createdAt)
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const result = await createCategoryMutation.mutateAsync({
        data: {
          name: newCategoryName,
          description: newCategoryDescription || undefined,
        }
      });

      // result is the category object directly
      if (result?.id) {
        setSelectedCategory(result.id);
      }
      
      setIsAddCategoryModalOpen(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setToastMessage(`Danh mục "${newCategoryName}" đã được tạo`);
      setShowSuccessToast(true);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleOpenAddItemModal = () => {
    setItemModalMode('add');
    // Use first available category from API, not hardcoded 'starters'
    const defaultCategory = selectedCategory === 'all' 
      ? (categories[0]?.id || '') 
      : selectedCategory;
    
    setItemFormData({
      name: '',
      category: defaultCategory,
      description: '',
      price: '',
      status: 'available',
      image: null,
      dietary: [],
      chefRecommended: false,
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItemModal = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setItemModalMode('edit');
    setCurrentEditItemId(item.id);
    setItemFormData({
      name: item.name,
      category: item.categoryId || selectedCategory,
      description: item.description || '',
      price: String(item.price || ''),
      status: item.status === 'SOLD_OUT' ? 'sold_out' : (!item.isAvailable ? 'unavailable' : 'available'),
      image: null,
      dietary: item.dietary || [],
      chefRecommended: item.chefRecommended || false,
      modifierGroupIds: item.modifierGroups?.map((mg: any) => mg.id) || [], // Load existing modifiers
    });
    setIsItemModalOpen(true);
  };

  const handleOpenNewItemModal = () => {
    setItemModalMode('add');
    setCurrentEditItemId(null);
    setItemFormData({
      name: '',
      category: selectedCategory,
      description: '',
      price: '',
      status: 'available',
      image: null,
      dietary: [],
      chefRecommended: false,
      modifierGroupIds: [], // Add modifierGroupIds
    });
    setIsItemModalOpen(true);
  };

  const handleCloseItemModal = () => {
    setIsItemModalOpen(false);
    setCurrentEditItemId(null);
    setItemFormData({
      name: '',
      category: selectedCategory,
      description: '',
      price: '',
      status: 'available',
      image: null,
      dietary: [],
      chefRecommended: false,
      modifierGroupIds: [], // Reset modifiers
    });
  };

  const handleSaveItem = async () => {
    if (!itemFormData.name.trim() || !itemFormData.price.trim()) return;

    try {
      if (itemModalMode === 'add') {
        const result = await createItemMutation.mutateAsync({
          data: {
            name: itemFormData.name,
            categoryId: itemFormData.category,
            description: itemFormData.description || undefined,
            price: parseFloat(itemFormData.price),
            modifierGroupIds: itemFormData.modifierGroupIds, // Include modifier groups
            // Note: CreateMenuItemDto không có available field
            // Backend sẽ tự set available = true và status = DRAFT by default
          }
        });

        // Upload photo nếu có
        if (itemFormData.image && result?.id) {
          await uploadPhotoMutation.mutateAsync({
            itemId: result.id,
            data: { file: itemFormData.image }
          });
        }

        setToastMessage(`Món "${itemFormData.name}" đã được tạo`);
      } else if (currentEditItemId) {
        await updateItemMutation.mutateAsync({
          id: currentEditItemId,
          data: {
            name: itemFormData.name,
            categoryId: itemFormData.category,
            description: itemFormData.description || undefined,
            price: parseFloat(itemFormData.price),
            available: itemFormData.status === 'available',  // 'available' not 'isAvailable'
            modifierGroupIds: itemFormData.modifierGroupIds, // Include modifier groups
          }
        });

        // Upload photo nếu có
        if (itemFormData.image) {
          await uploadPhotoMutation.mutateAsync({
            itemId: currentEditItemId,
            data: { file: itemFormData.image }
          });
        }

        setToastMessage(`Món "${itemFormData.name}" đã được cập nhật`);
      }

      setShowSuccessToast(true);
      handleCloseItemModal();
    } catch (error) {
      // Error đã được xử lý trong mutation
      console.error('Error in handleSaveItem:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setItemFormData({ ...itemFormData, image: e.target.files[0] });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, item: { id: string; name: string }) => {
    e.stopPropagation();
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteItemMutation.mutateAsync({ id: itemToDelete.id });

      setToastMessage(`Món "${itemToDelete.name}" đã được xóa`);
      setShowSuccessToast(true);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      // Error đã được xử lý trong mutation
      console.error('Error in handleConfirmDelete:', error);
    }
  };

  const toggleDietary = (tag: string) => {
    if (itemFormData.dietary.includes(tag)) {
      setItemFormData({
        ...itemFormData,
        dietary: itemFormData.dietary.filter((t) => t !== tag),
      });
    } else {
      setItemFormData({
        ...itemFormData,
        dietary: [...itemFormData.dietary, tag],
      });
    }
  };

  const getDietaryIcon = (tag: string) => {
    switch (tag) {
      case 'vegan':
        return <Leaf className="w-3 h-3" />;
      case 'spicy':
        return <Flame className="w-3 h-3" />;
      case 'vegetarian':
        return <Milk className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Modals */}
      {isAddCategoryModalOpen && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(16px)',
            }}
            onClick={() => {
              setIsAddCategoryModalOpen(false);
              setNewCategoryName('');
              setNewCategoryDescription('');
            }}
          >
            <div 
              className="bg-white w-full max-w-md mx-4 rounded-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Add Category</h3>
                <button
                  onClick={() => {
                    setIsAddCategoryModalOpen(false);
                    setNewCategoryName('');
                    setNewCategoryDescription('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Category name *</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Specials"
                    className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Description (optional)</label>
                  <textarea
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Add a brief description..."
                    className="px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-emerald-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsAddCategoryModalOpen(false);
                    setNewCategoryName('');
                    setNewCategoryDescription('');
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 disabled:bg-gray-300"
                >
                  Create Category
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Item Modal */}
        {isItemModalOpen && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(16px)',
            }}
            onClick={handleCloseItemModal}
          >
            <div 
              className="bg-white w-full mx-4 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              style={{ maxWidth: '560px', maxHeight: 'calc(100vh - 80px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  {itemModalMode === 'add' ? 'Add Menu Item' : 'Edit Menu Item'}
                </h3>
                <button onClick={handleCloseItemModal} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-5 overflow-y-auto">
                {/* Image Upload */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Item Image</label>
                  
                  {itemFormData.image ? (
                    <div className="border-2 border-emerald-500 rounded-xl p-6 flex flex-col items-center gap-3 bg-emerald-50">
                      <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-emerald-500" />
                      </div>
                      <p className="text-sm font-semibold text-emerald-700">{itemFormData.image.name}</p>
                      <p className="text-xs text-emerald-600">{(itemFormData.image.size / 1024).toFixed(1)} KB</p>
                      <button
                        onClick={() => setItemFormData({ ...itemFormData, image: null })}
                        className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        Remove image
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-emerald-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">Drop image or click to upload</p>
                      <p className="text-xs text-gray-500">PNG, JPG or WEBP (max. 5MB)</p>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Item Name *</label>
                  <input
                    type="text"
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                    placeholder="e.g., Caesar Salad"
                    className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Category *</label>
                  <select
                    value={itemFormData.category}
                    onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value })}
                    className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Description</label>
                  <textarea
                    value={itemFormData.description}
                    onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                    placeholder="Describe your dish..."
                    className="px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-emerald-500"
                    rows={3}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">$</span>
                    <input
                      type="number"
                      value={itemFormData.price}
                      onChange={(e) => setItemFormData({ ...itemFormData, price: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Status *</label>
                  <select
                    value={itemFormData.status}
                    onChange={(e) => setItemFormData({ ...itemFormData, status: e.target.value as 'available' | 'unavailable' | 'sold_out' })}
                    className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="sold_out">Sold Out</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Dietary Tags</label>
                  <div className="flex gap-2">
                    {['vegan', 'vegetarian', 'spicy'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleDietary(tag)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium capitalize ${
                          itemFormData.dietary.includes(tag)
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-white border-gray-300 text-gray-700'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">Mark as Chef&apos;s recommendation</span>
                    <span className="text-xs text-gray-500">Highlight this item to customers</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemFormData.chefRecommended}
                      onChange={(e) => setItemFormData({ ...itemFormData, chefRecommended: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full relative transition-colors ${
                      itemFormData.chefRecommended ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}>
                      <div className={`absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                        itemFormData.chefRecommended ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                  </label>
                </div>

                {/* Modifier Groups Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Modifier Groups (Optional)
                  </label>
                  <div className="border border-gray-300 rounded-xl p-3 max-h-48 overflow-y-auto bg-gray-50">
                    {modifierGroups.filter((g: any) => g.active).length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No active modifier groups</p>
                    ) : (
                      <div className="space-y-2">
                        {modifierGroups.filter((g: any) => g.active).map((group: any) => (
                          <label
                            key={group.id}
                            className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={(itemFormData.modifierGroupIds || []).includes(group.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setItemFormData({
                                    ...itemFormData,
                                    modifierGroupIds: [...(itemFormData.modifierGroupIds || []), group.id]
                                  });
                                } else {
                                  setItemFormData({
                                    ...itemFormData,
                                    modifierGroupIds: (itemFormData.modifierGroupIds || []).filter(id => id !== group.id)
                                  });
                                }
                              }}
                              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">{group.name}</span>
                              <span className="ml-2 text-xs text-gray-500">
                                ({group.type === 'single' ? 'Single' : 'Multiple'})
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Select modifier groups for this item (e.g., Size, Toppings, Extras)
                  </p>
                </div>

              </div>

              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleCloseItemModal}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveItem}
                  disabled={!itemFormData.name.trim() || !itemFormData.price.trim()}
                  className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 disabled:bg-gray-300"
                >
                  {itemModalMode === 'add' ? 'Add Item' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && itemToDelete && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(16px)',
            }}
            onClick={() => {
              setIsDeleteModalOpen(false);
              setItemToDelete(null);
            }}
          >
            <div 
              className="bg-white w-full max-w-md mx-4 rounded-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Delete Menu Item?</h3>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{itemToDelete.name}</span> will be removed from your menu.
                </p>
              </div>

              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600"
                >
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Main Layout */}
      <div 
        className="flex flex-col bg-gray-50 h-full overflow-hidden"
      >
        {/* Page Header */}
        <div className="shrink-0 px-6 pt-3 pb-2 border-b border-gray-200 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-bold text-gray-900">Menu Management</h2>
              <p className="text-sm text-gray-600">Manage your menu items, categories, and pricing</p>
            </div>
            
            <MenuTabs />
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT PANEL - Categories - Full Height */}
          <div className="w-44 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900 mb-3">Categories</h3>
              <button
                onClick={() => setIsAddCategoryModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all rounded-xl text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>

        <div className="flex-1 p-2">
              <div className="flex flex-col gap-1">
                {/* All Items */}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`flex items-center justify-between px-3 py-2.5 transition-all rounded-xl text-sm font-medium ${
                    selectedCategory === 'all'
                      ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                      <span className={selectedCategory === 'all' ? 'font-bold' : ''}>All Items</span>
                      <span 
                        className={`px-1.5 py-0.5 rounded-full text-xs font-bold min-w-6 text-center ${
                          selectedCategory === 'all'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {menuItems.length}
                      </span>
                    </button>

                {/* Category List */}
                {categories.map((category) => {
                  const count = getCategoryItemCount(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center justify-between px-3 py-2.5 transition-all rounded-xl text-sm font-medium ${
                        selectedCategory === category.id
                          ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500'
                          : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                      }`}
                    >
                          <span className={selectedCategory === category.id ? 'font-bold' : ''}>{category.name}</span>
                          <span 
                            className={`px-1.5 py-0.5 rounded-full text-xs font-bold min-w-6 text-center ${
                              selectedCategory === category.id
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

          {/* RIGHT PANEL - Items Grid */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="px-5 py-2 bg-white border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                {/* Search */}
                <div className="relative w-full max-w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search menu items..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 rounded-xl text-sm h-10"
                      />
                    </div>

                {/* Status + Sort + Add Item */}
                <div className="flex items-center gap-2 shrink-0 ml-auto">
                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2 border border-gray-300 bg-white text-gray-700 cursor-pointer rounded-xl text-sm font-medium min-w-32 h-10"
                    >
                      <option>All Status</option>
                      <option>Available</option>
                      <option>Unavailable</option>
                      <option>Sold Out</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Archive Status */}
                  <div className="relative">
                    <select
                      value={tempSelectedArchiveStatus}
                      onChange={(e) => setTempSelectedArchiveStatus(e.target.value as 'all' | 'archived')}
                      className="appearance-none pl-3 pr-8 py-2 border border-gray-300 bg-white text-gray-700 cursor-pointer rounded-xl text-sm font-medium min-w-32 h-10"
                    >
                      <option value="all">Active Items</option>
                      <option value="archived">Archived Items</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Apply Filter Button */}
                  <button
                    onClick={() => setSelectedArchiveStatus(tempSelectedArchiveStatus)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors h-10"
                  >
                    Apply
                  </button>

                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2 border border-gray-300 bg-white text-gray-700 cursor-pointer rounded-xl text-sm font-medium min-w-40 h-10"
                    >
                      <option>Sort by: Newest</option>
                      <option>Sort by: Popularity</option>
                      <option>Sort by: Price (Low)</option>
                      <option>Sort by: Price (High)</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Add Item Button */}
                  <button
                    onClick={handleOpenAddItemModal}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white transition-all rounded-xl text-sm font-semibold h-10"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
              </div>
            </div>

            {/* Items Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-5">
              {visibleMenuItems.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchQuery ? 'No items found' : 'No items yet'}
                  </h4>
                  <p className="text-sm text-gray-600 mb-6">
                    {searchQuery ? 'Try adjusting your search or filters' : 'Add your first menu item'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={handleOpenAddItemModal}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold"
                    >
                      <Plus className="w-5 h-5 inline-block mr-2" />
                      Add Item
                    </button>
                  )}
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {visibleMenuItems.map((item: any) => (
                        <Card key={item.id} className="p-0 overflow-hidden hover:shadow-lg transition-all">
                          {/* Image */}
                          <div className="w-full aspect-video bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-gray-400" />
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            <div className="mb-3">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h4>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant={
                                  item.status === 'available' ? 'success' : 
                                  item.status === 'sold_out' ? 'error' : 
                                  'neutral'
                                }>
                                  {item.status === 'available' ? 'Available' : 
                                   item.status === 'sold_out' ? 'Sold out' : 
                                   'Unavailable'}
                                </Badge>
                                {item.chefRecommended && (
                                  <div className="flex items-center gap-1 px-2 py-1 border border-emerald-500 text-emerald-700 rounded-full text-xs font-medium">
                                    <Star className="w-3 h-3 fill-emerald-500" />
                                    <span>Chef&apos;s recommendation</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{item.description}</p>

                            {item.dietary && item.dietary.length > 0 && (
                              <div className="flex gap-2 mb-4">
                                {item.dietary.map((tag: string) => (
                                  <div
                                    key={tag}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                      tag === 'spicy' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                    }`}
                                  >
                                    {getDietaryIcon(tag)}
                                    <span className="capitalize">{tag}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <span className="text-xl font-bold text-emerald-600">{item.price}</span>
                              <div className="flex gap-2">
                                <button 
                                  className="w-9 h-9 bg-gray-100 hover:bg-emerald-50 rounded-lg flex items-center justify-center"
                                  onClick={(e) => handleOpenEditItemModal(e, item)}
                                >
                                  <Edit className="w-4 h-4 text-gray-600" />
                                </button>
                                <button 
                                  className="w-9 h-9 bg-gray-100 hover:bg-red-50 rounded-lg flex items-center justify-center"
                                  onClick={(e) => handleDeleteClick(e, item)}
                                >
                                  <Trash2 className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                    </Card>
                  ))}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccessToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowSuccessToast(false)}
        />
      )}

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}
