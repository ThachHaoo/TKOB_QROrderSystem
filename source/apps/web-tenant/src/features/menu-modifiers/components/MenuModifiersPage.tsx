'use client';

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Toast } from '@/shared/components/ui/Toast';
import { MenuTabs } from '@/features/menu-management/components/MenuTabs';
import { Search, Plus, Edit, Trash2, Filter, XCircle, X, AlertTriangle } from 'lucide-react';

interface ModifierGroup {
  id: string;
  name: string;
  description?: string;
  options: { id: string; name: string; price: number }[];
  linkedItems: number;
  type: 'single' | 'multiple';
  required: boolean;
  active: boolean;
}

export function MenuModifiersPage() {
  // Filter state
  const [selectedType, setSelectedType] = useState<'all' | 'single' | 'multiple'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Form states
  const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<ModifierGroup | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<'single' | 'multiple'>('single');
  const [formActive, setFormActive] = useState(true);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Mock data
  const [groups, setGroups] = useState<ModifierGroup[]>([
    {
      id: '1',
      name: 'Size Options',
      description: 'Choose your preferred size',
      options: [
        { id: 'o1', name: 'Small', price: 0 },
        { id: 'o2', name: 'Medium', price: 2 },
        { id: 'o3', name: 'Large', price: 4 },
      ],
      linkedItems: 8,
      type: 'single',
      required: true,
      active: true,
    },
    {
      id: '2',
      name: 'Pizza Toppings',
      description: 'Select additional toppings',
      options: [
        { id: 'o4', name: 'Pepperoni', price: 1.5 },
        { id: 'o5', name: 'Mushrooms', price: 1 },
        { id: 'o6', name: 'Olives', price: 1 },
        { id: 'o7', name: 'Extra Cheese', price: 2 },
      ],
      linkedItems: 3,
      type: 'multiple',
      required: false,
      active: true,
    },
    {
      id: '3',
      name: 'Sauce Choice',
      description: 'Pick your sauce',
      options: [
        { id: 'o8', name: 'Tomato', price: 0 },
        { id: 'o9', name: 'BBQ', price: 0.5 },
        { id: 'o10', name: 'Ranch', price: 0.5 },
      ],
      linkedItems: 12,
      type: 'single',
      required: true,
      active: true,
    },
    {
      id: '4',
      name: 'Protein Options',
      description: 'Add protein to your meal',
      options: [
        { id: 'o11', name: 'Chicken', price: 3 },
        { id: 'o12', name: 'Beef', price: 3.5 },
        { id: 'o13', name: 'Tofu', price: 2.5 },
      ],
      linkedItems: 5,
      type: 'multiple',
      required: false,
      active: true,
    },
  ]);

  // Filter logic
  const visibleGroups = groups.filter((group) => {
    const matchesType = selectedType === 'all' || group.type === selectedType;
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Reset form
  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormType('single');
    setFormActive(true);
  };

  // New group
  const handleNewGroup = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Create group
  const handleCreateGroup = () => {
    if (!formName.trim()) {
      setToast({ message: 'Group name is required', type: 'error' });
      return;
    }

    const newGroup: ModifierGroup = {
      id: `${groups.length + 1}`,
      name: formName,
      description: formDescription,
      options: [],
      linkedItems: 0,
      type: formType,
      required: false,
      active: formActive,
    };

    setGroups([...groups, newGroup]);
    setShowCreateModal(false);
    setToast({ message: 'Modifier group created successfully', type: 'success' });
    resetForm();
  };

  // Edit group
  const handleEditGroup = (group: ModifierGroup) => {
    setEditingGroup(group);
    setFormName(group.name);
    setFormDescription(group.description || '');
    setFormType(group.type);
    setFormActive(group.active);
    setShowEditModal(true);
  };

  // Update group
  const handleUpdateGroup = () => {
    if (!formName.trim() || !editingGroup) {
      setToast({ message: 'Group name is required', type: 'error' });
      return;
    }

    setGroups(groups.map(g =>
      g.id === editingGroup.id
        ? { ...g, name: formName, description: formDescription, type: formType, active: formActive }
        : g
    ));

    setShowEditModal(false);
    setEditingGroup(null);
    setToast({ message: 'Modifier group updated successfully', type: 'success' });
    resetForm();
  };

  // Delete group
  const handleDeleteGroup = (group: ModifierGroup) => {
    setDeletingGroup(group);
    setShowDeleteDialog(true);
  };

  // Confirm delete
  const confirmDeleteGroup = () => {
    if (!deletingGroup) return;

    setGroups(groups.filter(g => g.id !== deletingGroup.id));
    setShowDeleteDialog(false);
    setDeletingGroup(null);
    setToast({ message: 'Modifier group deleted successfully', type: 'success' });
  };

  // Filter counts
  const getSingleCount = () => groups.filter(g => g.type === 'single').length;
  const getMultiCount = () => groups.filter(g => g.type === 'multiple').length;

  return (
    <>
      {/* Main container */}
      <div className="flex flex-col bg-gray-50 h-full overflow-hidden">
        {/* Header - sticky */}
        <div className="shrink-0 px-6 pt-3 pb-2 bg-white sticky top-0 z-10 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ fontSize: '26px', lineHeight: '32px', fontWeight: 600, color: '#1F2937', marginBottom: '4px' }}>
                Modifier Groups
              </h2>
              <p style={{ fontSize: '14px', lineHeight: '20px', color: '#6B7280' }}>
                Manage sizes, toppings, and other options for menu items
              </p>
            </div>
            <MenuTabs />
          </div>
        </div>

        {/* Content area - scrollable */}
        <div className="flex-1 px-6 pt-6 overflow-y-auto bg-gray-50">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Title with count text */}
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                All Groups
              </h3>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full" style={{ fontSize: '13px', fontWeight: 600 }}>
                {visibleGroups.length} {visibleGroups.length === 1 ? 'group' : 'groups'}
              </span>
              
              {/* Clear filter button */}
              {(selectedType !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedType('all');
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Clear filter
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Filter button */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filter
                  {selectedType !== 'all' && (
                    <Badge variant="primary">{selectedType === 'single' ? 'Single' : 'Multi'}</Badge>
                  )}
                </button>

                {/* Filter dropdown */}
                {showFilterDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">Filter by Type</h4>
                        <button
                          onClick={() => setShowFilterDropdown(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="type-filter"
                              checked={selectedType === 'all'}
                              onChange={() => setSelectedType('all')}
                              className="w-4 h-4 text-emerald-600"
                            />
                            <span className="text-sm text-gray-700">All Types</span>
                          </div>
                          <span className="text-xs text-gray-500">{groups.length}</span>
                        </label>

                        <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="type-filter"
                              checked={selectedType === 'single'}
                              onChange={() => setSelectedType('single')}
                              className="w-4 h-4 text-emerald-600"
                            />
                            <span className="text-sm text-gray-700">Single Choice</span>
                          </div>
                          <span className="text-xs text-gray-500">{getSingleCount()}</span>
                        </label>

                        <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="type-filter"
                              checked={selectedType === 'multiple'}
                              onChange={() => setSelectedType('multiple')}
                              className="w-4 h-4 text-emerald-600"
                            />
                            <span className="text-sm text-gray-700">Multiple Choice</span>
                          </div>
                          <span className="text-xs text-gray-500">{getMultiCount()}</span>
                        </label>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedType('all');
                            setShowFilterDropdown(false);
                          }}
                          className="flex-1 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => setShowFilterDropdown(false)}
                          className="flex-1 px-3 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* New Group button */}
              <button
                onClick={handleNewGroup}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Group
              </button>
            </div>
          </div>

          {/* Groups grid */}
          {visibleGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
              {visibleGroups.map((group) => (
                <Card key={group.id} className="p-6 hover:shadow-xl transition-all border-2 border-gray-100 hover:border-emerald-300">
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-gray-900 mb-1" style={{ fontSize: '17px', fontWeight: 700 }}>
                          {group.name}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge variant={group.type === 'single' ? 'success' : 'neutral'}>
                            {group.type === 'single' ? 'Choose 1' : 'Multi-select'}
                          </Badge>
                          {!group.active && (
                            <Badge variant="neutral">Inactive</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {group.description && (
                      <p className="text-gray-600 line-clamp-2" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                        {group.description}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600" style={{ fontSize: '12px', fontWeight: 600 }}>
                        Options:
                      </span>
                      <span className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full" style={{ fontSize: '11px', fontWeight: 700 }}>
                        {group.options.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600" style={{ fontSize: '12px', fontWeight: 600 }}>
                        Items:
                      </span>
                      <span className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded-full" style={{ fontSize: '11px', fontWeight: 700 }}>
                        {group.linkedItems}
                      </span>
                    </div>
                  </div>

                  {/* Sample Options Preview */}
                  <div className="mb-4">
                    <div className="text-gray-700 mb-2" style={{ fontSize: '12px', fontWeight: 700 }}>
                      Options Preview
                    </div>
                    <div className="flex flex-col gap-1">
                      {group.options.slice(0, 3).map((option) => (
                        <div key={option.id} className="flex items-center justify-between text-gray-600" style={{ fontSize: '12px' }}>
                          <span>{option.name}</span>
                          <span className="text-emerald-600" style={{ fontWeight: 600 }}>+${option.price.toFixed(2)}</span>
                        </div>
                      ))}
                      {group.options.length > 3 && (
                        <span className="text-gray-500" style={{ fontSize: '11px' }}>
                          +{group.options.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditGroup(group)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all border border-emerald-200 hover:border-emerald-300"
                      style={{ fontSize: '13px', fontWeight: 600 }}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group)}
                      className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-red-50 rounded-lg transition-all border border-gray-200 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No groups found</h3>
              <p className="text-sm text-gray-600 mb-6">
                {searchQuery || selectedType !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'Get started by creating your first modifier group'}
              </p>
              {!searchQuery && selectedType === 'all' && (
                <button
                  onClick={handleNewGroup}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Group
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create Modifier Group</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Size Options, Pizza Toppings"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief description of this modifier group"
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selection Type <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="single"
                      checked={formType === 'single'}
                      onChange={() => setFormType('single')}
                      className="mt-0.5 w-4 h-4 text-emerald-600"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Single Choice</div>
                      <div className="text-xs text-gray-500">Customer can select only one option</div>
                    </div>
                  </label>

                  <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="multiple"
                      checked={formType === 'multiple'}
                      onChange={() => setFormType('multiple')}
                      className="mt-0.5 w-4 h-4 text-emerald-600"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Multiple Choice</div>
                      <div className="text-xs text-gray-500">Customer can select multiple options</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Active</div>
                    <div className="text-xs text-gray-500">This group is available for use</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit Modifier Group</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingGroup(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Size Options, Pizza Toppings"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief description of this modifier group"
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selection Type <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="type-edit"
                      value="single"
                      checked={formType === 'single'}
                      onChange={() => setFormType('single')}
                      className="mt-0.5 w-4 h-4 text-emerald-600"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Single Choice</div>
                      <div className="text-xs text-gray-500">Customer can select only one option</div>
                    </div>
                  </label>

                  <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="type-edit"
                      value="multiple"
                      checked={formType === 'multiple'}
                      onChange={() => setFormType('multiple')}
                      className="mt-0.5 w-4 h-4 text-emerald-600"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Multiple Choice</div>
                      <div className="text-xs text-gray-500">Customer can select multiple options</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Active</div>
                    <div className="text-xs text-gray-500">This group is available for use</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingGroup(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateGroup}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Update Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && deletingGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scaleIn">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Modifier Group?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">{deletingGroup.name}</span>?
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setDeletingGroup(null);
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteGroup}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
