// Mock orders data

import { Order } from '@/types';

// Store created orders here
export const mockOrders: Order[] = [];

// Current active order
export let mockCurrentOrder: Order | null = null;

// Helper to set current order
export function setMockCurrentOrder(order: Order | null) {
  mockCurrentOrder = order;
}

/**
 * Get localStorage key for orders based on session ID
 */
export function getOrdersStorageKey(sessionId?: string): string {
  return `tkob_mock_orders:${sessionId || 'default'}`;
}

/**
 * Load orders from localStorage for a session
 */
export function loadOrdersFromStorage(sessionId?: string): Order[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const key = getOrdersStorageKey(sessionId);
    const stored = window.localStorage.getItem(key);
    
    if (stored) {
      const orders = JSON.parse(stored) as Order[];
      if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
        console.log(`[Orders] Loaded ${orders.length} orders from localStorage (${key})`);
      }
      return orders;
    }
  } catch (err) {
    console.warn('[Orders] Failed to load orders from localStorage:', err);
  }

  return [];
}

/**
 * Save orders to localStorage for a session
 */
export function saveOrdersToStorage(orders: Order[], sessionId?: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const key = getOrdersStorageKey(sessionId);
    window.localStorage.setItem(key, JSON.stringify(orders));
    
    if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
      console.log(`[Orders] Saved ${orders.length} orders to localStorage (${key})`);
    }
  } catch (err) {
    console.warn('[Orders] Failed to save orders to localStorage:', err);
  }
}

/**
 * Clear all orders from localStorage for a session
 */
export function clearOrdersFromStorage(sessionId?: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const key = getOrdersStorageKey(sessionId);
    window.localStorage.removeItem(key);
    
    if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
      console.log(`[Orders] Cleared orders from localStorage (${key})`);
    }
  } catch (err) {
    console.warn('[Orders] Failed to clear orders from localStorage:', err);
  }
}
