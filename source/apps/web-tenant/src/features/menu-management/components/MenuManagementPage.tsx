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

// Full featured Menu Management matching Admin-screens-v3 design
export function MenuManagementPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [sortOption, setSortOption] = useState('Sort by: Newest');
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategories, setNewCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Add/Edit Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState<'add' | 'edit'>('add');
  const [currentEditItemId, setCurrentEditItemId] = useState<string | null>(null);
  const [itemFormData, setItemFormData] = useState({
    name: '',
    category: 'starters',
    description: '',
    price: '',
    status: 'available' as 'available' | 'unavailable' | 'sold_out',
    image: null as File | null,
    dietary: [] as string[],
    chefRecommended: false,
  });

  const baseCategories = [
    { id: 'starters', name: 'Starters' },
    { id: 'mains', name: 'Main Courses' },
    { id: 'desserts', name: 'Desserts' },
    { id: 'drinks', name: 'Drinks' },
  ];

  const categories = [...baseCategories, ...newCategories];

  const initialMenuItems = [
    { id: '1', name: 'Caesar Salad', price: '$12.50', status: 'available', description: 'Fresh romaine with parmesan', category: 'starters', dietary: ['vegetarian'], chefRecommended: true },
    { id: '2', name: 'Bruschetta', price: '$9.00', status: 'available', description: 'Toasted bread with tomatoes', category: 'starters', dietary: ['vegan'], chefRecommended: false },
    { id: '3', name: 'Spring Rolls', price: '$8.50', status: 'unavailable', description: 'Crispy vegetable rolls', category: 'starters', dietary: ['vegan'], chefRecommended: false },
    { id: '4', name: 'Garlic Bread', price: '$6.00', status: 'available', description: 'Toasted with garlic butter', category: 'starters', dietary: ['vegetarian'], chefRecommended: false },
    { id: '5', name: 'Buffalo Wings', price: '$11.50', status: 'sold_out', description: 'Spicy chicken wings', category: 'starters', dietary: ['spicy'], chefRecommended: false },
    { id: '6', name: 'Grilled Chicken', price: '$24.00', status: 'available', description: 'Herb-marinated chicken breast', category: 'mains', dietary: [], chefRecommended: false },
    { id: '7', name: 'Spaghetti Carbonara', price: '$18.50', status: 'available', description: 'Classic Italian pasta', category: 'mains', dietary: [], chefRecommended: true },
    { id: '8', name: 'Steak & Fries', price: '$32.00', status: 'available', description: 'Premium ribeye', category: 'mains', dietary: [], chefRecommended: false },
    { id: '9', name: 'Salmon Fillet', price: '$28.00', status: 'unavailable', description: 'Pan-seared salmon', category: 'mains', dietary: [], chefRecommended: false },
    { id: '10', name: 'Vegetarian Curry', price: '$16.50', status: 'available', description: 'Creamy coconut curry', category: 'mains', dietary: ['vegetarian', 'spicy'], chefRecommended: false },
    { id: '11', name: 'Chocolate Cake', price: '$8.50', status: 'available', description: 'Rich chocolate layer cake', category: 'desserts', dietary: ['vegetarian'], chefRecommended: false },
    { id: '12', name: 'Tiramisu', price: '$9.50', status: 'available', description: 'Classic Italian dessert', category: 'desserts', dietary: ['vegetarian'], chefRecommended: true },
    { id: '13', name: 'Cheesecake', price: '$8.00', status: 'sold_out', description: 'New York style', category: 'desserts', dietary: ['vegetarian'], chefRecommended: false },
    { id: '14', name: 'Ice Cream', price: '$6.00', status: 'available', description: 'Vanilla, chocolate, or strawberry', category: 'desserts', dietary: ['vegetarian'], chefRecommended: false },
    { id: '15', name: 'Coca-Cola', price: '$3.50', status: 'available', description: 'Chilled Coca-Cola', category: 'drinks', dietary: ['vegan'], chefRecommended: false },
    { id: '16', name: 'Orange Juice', price: '$4.50', status: 'available', description: 'Freshly squeezed', category: 'drinks', dietary: ['vegan'], chefRecommended: false },
    { id: '17', name: 'Lemonade', price: '$3.50', status: 'available', description: 'Homemade lemonade', category: 'drinks', dietary: ['vegan'], chefRecommended: false },
  ];

  const [menuItems, setMenuItems] = useState(initialMenuItems);

  const getCategoryItemCount = (categoryId: string) => {
    return menuItems.filter(
      (item) => item.category === categoryId && !deletedItemIds.includes(item.id)
    ).length;
  };

  const visibleMenuItems = menuItems
    .filter((item) => !deletedItemIds.includes(item.id))
    .filter((item) => {
      if (selectedCategory === 'all') return true;
      return item.category === selectedCategory;
    })
    .filter((item) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    })
    .filter((item) => {
      if (selectedStatus === 'All Status') return true;
      if (selectedStatus === 'Available') return item.status === 'available';
      if (selectedStatus === 'Unavailable') return item.status === 'unavailable';
      if (selectedStatus === 'Sold Out') return item.status === 'sold_out';
      return true;
    })
    .sort((a, b) => {
      if (sortOption === 'Sort by: Price (Low)') {
        return parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', ''));
      }
      if (sortOption === 'Sort by: Price (High)') {
        return parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', ''));
      }
      // Default: Newest (reverse ID order)
      return b.id.localeCompare(a.id);
    });

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
        name: newCategoryName,
      };
      setNewCategories([...newCategories, newCategory]);
      setSelectedCategory(newCategory.id);
      setIsAddCategoryModalOpen(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
      
      setToastMessage(`Category "${newCategoryName}" created successfully`);
      setShowSuccessToast(true);
    }
  };

  const handleOpenAddItemModal = () => {
    setItemModalMode('add');
    setItemFormData({
      name: '',
      category: selectedCategory === 'all' ? 'starters' : selectedCategory,
      description: '',
      price: '',
      status: 'available',
      image: null,
      dietary: [],
      chefRecommended: false,
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItemModal = (e: React.MouseEvent, item: { id: string; name: string; category: string; description: string; price: string; status: string; dietary?: string[]; chefRecommended?: boolean }) => {
    e.stopPropagation();
    setItemModalMode('edit');
    setCurrentEditItemId(item.id);
    setItemFormData({
      name: item.name,
      category: item.category || selectedCategory,
      description: item.description,
      price: item.price.replace('$', ''),
      status: item.status as 'available' | 'unavailable' | 'sold_out',
      image: null,
      dietary: item.dietary || [],
      chefRecommended: item.chefRecommended || false,
    });
    setIsItemModalOpen(true);
  };

  const handleCloseItemModal = () => {
    setIsItemModalOpen(false);
    setCurrentEditItemId(null);
    setItemFormData({
      name: '',
      category: 'starters',
      description: '',
      price: '',
      status: 'available',
      image: null,
      dietary: [],
      chefRecommended: false,
    });
  };

  const handleSaveItem = () => {
    if (itemFormData.name.trim() && itemFormData.price.trim()) {
      if (itemModalMode === 'add') {
        const newItem = {
          id: `new-${Date.now()}`,
          name: itemFormData.name,
          price: `$${parseFloat(itemFormData.price).toFixed(2)}`,
          status: itemFormData.status,
          description: itemFormData.description || 'No description',
          category: itemFormData.category,
          dietary: itemFormData.dietary,
          chefRecommended: itemFormData.chefRecommended,
        };
        setMenuItems([...menuItems, newItem]);
        setToastMessage(`Item "${itemFormData.name}" created successfully`);
      } else {
        const updatedItems = menuItems.map(item => {
          if (item.id === currentEditItemId) {
            return {
              ...item,
              name: itemFormData.name,
              price: `$${parseFloat(itemFormData.price).toFixed(2)}`,
              status: itemFormData.status,
              description: itemFormData.description || item.description,
              category: itemFormData.category,
              dietary: itemFormData.dietary,
              chefRecommended: itemFormData.chefRecommended,
            };
          }
          return item;
        });
        setMenuItems(updatedItems);
        setToastMessage(`Item "${itemFormData.name}" updated successfully`);
      }
      
      setShowSuccessToast(true);
      handleCloseItemModal();
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

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setDeletedItemIds([...deletedItemIds, itemToDelete.id]);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setToastMessage(`Item "${itemToDelete.name}" deleted successfully`);
      setShowSuccessToast(true);
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
                        {menuItems.filter(item => !deletedItemIds.includes(item.id)).length}
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

                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2 border border-gray-300 bg-white text-gray-700 cursor-pointer rounded-xl text-sm font-medium min-w-40 h-10"
                    >
                      <option>Sort by: Newest</option>
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
                      {visibleMenuItems.map((item) => (
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
