'use client';

import React from 'react';
import { Search, ChevronDown, Plus } from './icons';

type ItemsToolbarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  tempSelectedArchiveStatus: 'all' | 'archived';
  onArchiveStatusChange: (status: 'all' | 'archived') => void;
  onApplyArchiveFilter: () => void;
  sortOption: string;
  onSortChange: (sort: string) => void;
  onAddItem: () => void;
};

export function ItemsToolbar({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  tempSelectedArchiveStatus,
  onArchiveStatusChange,
  onApplyArchiveFilter,
  sortOption,
  onSortChange,
  onAddItem,
}: ItemsToolbarProps) {
  return (
    <div className="px-5 py-2 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="relative w-full max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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
              onChange={(e) => onStatusChange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-300 bg-white text-gray-700 cursor-pointer rounded-xl text-sm font-medium min-w-32 h-10"
            >
              <option>All Status</option>
              <option>Draft</option>
              <option>Published</option>
              <option>Archived</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Archive Status */}
          <div className="relative">
            <select
              value={tempSelectedArchiveStatus}
              onChange={(e) => onArchiveStatusChange(e.target.value as 'all' | 'archived')}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-300 bg-white text-gray-700 cursor-pointer rounded-xl text-sm font-medium min-w-32 h-10"
            >
              <option value="all">Active Items</option>
              <option value="archived">Archived Items</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Apply Filter Button */}
          <button
            onClick={onApplyArchiveFilter}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors h-10"
          >
            Apply
          </button>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-300 bg-white text-gray-700 cursor-pointer rounded-xl text-sm font-medium min-w-40 h-10"
            >
              <option>Sort by: Newest</option>
              <option>Sort by: Popularity</option>
              <option>Sort by: Price (Low)</option>
              <option>Sort by: Price (High)</option>
              <option>Sort by: Name (A-Z)</option>
              <option>Sort by: Name (Z-A)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Add Item Button */}
          <button
            onClick={onAddItem}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white transition-all rounded-xl text-sm font-semibold h-10"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
}
