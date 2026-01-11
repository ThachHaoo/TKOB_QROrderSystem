// Cart store - manages shopping cart state

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, MenuItem } from '@/types';
import { generateId } from '@/lib/utils';
import { debugLog } from '@/lib/debug';

interface CartStore {
  items: CartItem[];
  addItem: (data: {
    menuItem: MenuItem;
    selectedSize?: string;
    selectedToppings: string[];
    specialInstructions?: string;
    quantity: number;
  }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, data: Partial<CartItem>) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (data) => {
        const cartItem: CartItem = {
          id: generateId('cart'),
          menuItem: data.menuItem,
          selectedSize: data.selectedSize,
          selectedToppings: data.selectedToppings,
          specialInstructions: data.specialInstructions,
          quantity: data.quantity,
        };
        
        debugLog('Cart', 'add', {
          itemId: cartItem.id,
          name: data.menuItem.name,
          quantity: data.quantity,
          size: data.selectedSize,
        });
        
        set((state) => ({
          items: [...state.items, cartItem],
        }));
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          debugLog('Cart', 'remove', { itemId: id });
          get().removeItem(id);
          return;
        }
        
        debugLog('Cart', 'update_qty', { itemId: id, newQuantity: quantity });
        
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },
      
      removeItem: (id) => {
        debugLog('Cart', 'remove', { itemId: id });
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      updateItem: (id, data) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...data } : item
          ),
        }));
      },
      
      clearCart: () => {
        debugLog('Cart', 'clear');
        set({ items: [] });
      },
      
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
