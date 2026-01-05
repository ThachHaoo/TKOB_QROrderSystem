'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, Button, Input } from '@/shared/components';
import { ArrowLeft, Plus, GripVertical, Trash2 } from 'lucide-react';
import { useAppRouter } from '@/shared/hooks/useAppRouter';
import { useSearchParams } from 'next/navigation';
import { ROUTES } from '@/shared/config';
import { useMenuItems, useModifiers } from '../hooks';
import type { MenuItem } from '../model/types';

interface SizeOption {
  id: string;
  name: string;
  price: string;
}

interface Topping {
  id: string;
  name: string;
  price: string;
  available: boolean;
}

export function MenuItemModifiersPage() {
  const { goTo } = useAppRouter();
  const search = useSearchParams();
  const itemId = search.get('itemId') || 'unknown';
  
  // Fetch data using DI pattern hooks
  const { data: menuItems = [] } = useMenuItems();
  const { data: modifiers = [] } = useModifiers();
  
  const [activeTab, setActiveTab] = useState<'details' | 'modifiers' | 'availability'>('details');
  const [sizeOptions, setSizeOptions] = useState<SizeOption[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [allowSpecialInstructions, setAllowSpecialInstructions] = useState<boolean>(true);

  // Find current menu item
  const item = useMemo(() => {
    return menuItems.find((m) => m.id === itemId) || null;
  }, [menuItems, itemId]);

  useEffect(() => {
    // Initialize modifiers data (mock data for now)
    // TODO: Link with actual modifier data from backend
    setSizeOptions([]);
    setToppings([]);
    setAllowSpecialInstructions(true);
  }, [itemId]);

  const handleAddSize = () => {
    const newSize: SizeOption = {
      id: Date.now().toString(),
      name: '',
      price: '+$0.00',
    };
    setSizeOptions([...sizeOptions, newSize]);
  };

  const handleDeleteSize = (id: string) => {
    setSizeOptions(sizeOptions.filter(size => size.id !== id));
  };

  const handleUpdateSize = (id: string, field: 'name' | 'price', value: string) => {
    setSizeOptions(sizeOptions.map(size =>
      size.id === id ? { ...size, [field]: value } : size
    ));
  };

  const handleAddTopping = () => {
    const newTopping: Topping = {
      id: Date.now().toString(),
      name: '',
      price: '+$0.00',
      available: true,
    };
    setToppings([...toppings, newTopping]);
  };

  const handleDeleteTopping = (id: string) => {
    setToppings(toppings.filter(topping => topping.id !== id));
  };

  const handleUpdateTopping = (id: string, field: 'name' | 'price', value: string) => {
    setToppings(toppings.map(topping =>
      topping.id === id ? { ...topping, [field]: value } : topping
    ));
  };

  const handleToggleToppingAvailability = (id: string) => {
    setToppings(toppings.map(topping =>
      topping.id === id ? { ...topping, available: !topping.available } : topping
    ));
  };

  const handleSave = () => {
    // TODO: Implement save modifiers via mutation hook
    // For now, just navigate back
    console.log('Saving modifiers:', { itemId, sizeOptions, toppings, allowSpecialInstructions });
    goTo(ROUTES.menu);
  };

  const handleCancel = () => {
    goTo(ROUTES.menu);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-text-primary">{item ? `${item.name} - Modifiers` : 'Unknown item'}</h2>
          {item && (
            <p className="text-sm text-text-secondary">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-2">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 rounded-lg transition-all text-[14px] font-medium ${
              activeTab === 'details'
                ? 'bg-accent-50 text-accent-500'
                : 'bg-white text-text-secondary hover:bg-elevated'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('modifiers')}
            className={`px-6 py-3 rounded-lg transition-all text-[14px] font-medium ${
              activeTab === 'modifiers'
                ? 'bg-accent-50 text-accent-500'
                : 'bg-white text-text-secondary hover:bg-elevated'
            }`}
          >
            Modifiers
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`px-6 py-3 rounded-lg transition-all text-[14px] font-medium ${
              activeTab === 'availability'
                ? 'bg-accent-50 text-accent-500'
                : 'bg-white text-text-secondary hover:bg-elevated'
            }`}
          >
            Availability
          </button>
        </div>
      </Card>

      {/* Size Modifier Group */}
      <Card className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-text-primary">Size Options</h3>
              <p className="text-sm text-text-secondary">
                Customers can choose one size
              </p>
            </div>
            <Button variant="secondary" onClick={handleAddSize}>
              <Plus className="w-4 h-4" />
              Add Size
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {sizeOptions.map((size) => (
              <div key={size.id} className="flex items-center gap-4 p-4 bg-elevated rounded-lg">
                <button className="cursor-grab hover:bg-primary p-2 rounded-lg transition-colors">
                  <GripVertical className="w-4 h-4 text-text-tertiary" />
                </button>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Size name"
                    value={size.name}
                    onChange={(e) => handleUpdateSize(size.id, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Price adjustment"
                    value={size.price}
                    onChange={(e) => handleUpdateSize(size.id, 'price', e.target.value)}
                  />
                </div>
                <button
                  onClick={() => handleDeleteSize(size.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-text-tertiary hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Toppings Modifier Group */}
      <Card className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-text-primary">Toppings</h3>
              <p className="text-sm text-text-secondary">
                Customers can select multiple toppings
              </p>
            </div>
            <Button variant="secondary" onClick={handleAddTopping}>
              <Plus className="w-4 h-4" />
              Add Topping
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {toppings.map((topping) => (
              <div key={topping.id} className="flex items-center gap-4 p-4 bg-elevated rounded-lg">
                <button className="cursor-grab hover:bg-primary p-2 rounded-lg transition-colors">
                  <GripVertical className="w-4 h-4 text-text-tertiary" />
                </button>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Topping name"
                    value={topping.name}
                    onChange={(e) => handleUpdateTopping(topping.id, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Price adjustment"
                    value={topping.price}
                    onChange={(e) => handleUpdateTopping(topping.id, 'price', e.target.value)}
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={topping.available}
                    onChange={() => handleToggleToppingAvailability(topping.id)}
                    className="w-4 h-4 text-accent-500 border-default rounded focus:ring-accent-500"
                  />
                  <span className="text-[13px] text-text-secondary">Available</span>
                </label>
                <button
                  onClick={() => handleDeleteTopping(topping.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-text-tertiary hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Special Instructions */}
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-base font-semibold text-text-primary">Special Instructions</h3>
            <p className="text-sm text-text-secondary">
              Allow customers to add custom notes
            </p>
          </div>
          <label className="flex items-center justify-between p-4 bg-elevated rounded-lg cursor-pointer">
            <div className="flex flex-col">
              <span className="text-[14px] font-medium text-text-primary">
                Enable special instructions
              </span>
              <span className="text-[13px] text-text-secondary">
                Customers can add notes to their order
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={allowSpecialInstructions}
                onChange={(e) => setAllowSpecialInstructions(e.target.checked)}
              />
              <div className={`w-11 h-6 rounded-full relative transition-colors ${
                allowSpecialInstructions ? 'bg-accent-500' : 'bg-elevated'
              }`}>
                <div className={`absolute top-0.5 left-0.5 bg-white border border-default rounded-full h-5 w-5 transition-transform ${
                  allowSpecialInstructions ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </label>
          </label>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end pb-6">
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Modifiers</Button>
      </div>
    </div>
  );
}
