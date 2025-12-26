'use client';

import React from 'react';
import Image from 'next/image';
import { Card, Badge } from '@/shared/components/ui';
import { ImageIcon, Edit, Trash2, Star, Leaf, Flame, Milk, Plus } from './icons';
import { getImageUrl } from '../utils/getImageUrl';
import { CURRENCY_CONFIG } from '@/config/currency';

type MenuItemsGridProps = {
  items: any[];
  searchQuery: string;
  onEditItem: (e: React.MouseEvent, item: any) => void;
  onDeleteItem: (e: React.MouseEvent, item: any) => void;
  onAddItem: () => void;
};

function getDietaryIcon(tag: string) {
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
}

export function MenuItemsGrid({
  items,
  searchQuery,
  onEditItem,
  onDeleteItem,
  onAddItem,
}: MenuItemsGridProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-5">
        {items.length === 0 ? (
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
                onClick={onAddItem}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold"
              >
                <Plus className="w-5 h-5 inline-block mr-2" />
                Add Item
              </button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item: any) => (
              <Card key={item.id} className="p-0 overflow-hidden hover:shadow-lg transition-all">
                {/* Image */}
                <div className="w-full aspect-video bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden relative">
                  {item.imageUrl ? (
                    <Image
                      src={getImageUrl(item.imageUrl) || ''}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-3">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={item.available ? 'success' : 'neutral'}>
                        {item.available ? 'Available' : 'Unavailable'}
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

                  {item.allergens && item.allergens.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {item.allergens.map((allergen: string) => (
                        <div
                          key={allergen}
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"
                        >
                          <span className="capitalize">{allergen}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-xl font-bold text-emerald-600">{CURRENCY_CONFIG.format(item.price)}</span>
                    <div className="flex gap-2">
                      <button
                        className="w-9 h-9 bg-gray-100 hover:bg-emerald-50 rounded-lg flex items-center justify-center"
                        onClick={(e) => onEditItem(e, item)}
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        className="w-9 h-9 bg-gray-100 hover:bg-red-50 rounded-lg flex items-center justify-center"
                        onClick={(e) => onDeleteItem(e, item)}
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
  );
}
