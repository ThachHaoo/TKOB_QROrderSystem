/**
 * LEGACY SHIM - DO NOT USE IN NEW CODE
 * 
 * This service now delegates to features/orders/data for backward compatibility
 * during the refactor phase. All order data access should go through the feature.
 * 
 * Will be removed after Batch 2 migration is complete.
 * 
 * @deprecated Use `features/orders/data/factory.ts` instead
 */

import { OrdersDataFactory } from '@/features/orders/data';
import { ApiResponse, Order, CartItem } from '@/types';

export const OrderService = {
  /**
   * Create new order
   * @deprecated Use feature data layer directly
   */
  async createOrder(data: {
    tableId: string;
    items: CartItem[];
    customerName?: string;
    notes?: string;
    paymentMethod: 'card' | 'counter';
  }): Promise<ApiResponse<Order>> {
    const strategy = OrdersDataFactory.getStrategy();
    return strategy.createOrder(data);
  },

  /**
   * Get order by ID
   * @deprecated Use feature data layer directly
   */
  async getOrder(id: string): Promise<ApiResponse<Order>> {
    const strategy = OrdersDataFactory.getStrategy();
    return strategy.getOrder(id);
  },

  /**
   * Get order history for user
   * @deprecated Use feature data layer directly
   */
  async getOrderHistory(userId: string): Promise<ApiResponse<Order[]>> {
    const strategy = OrdersDataFactory.getStrategy();
    return strategy.getOrderHistory(userId);
  },

  /**
   * Update order status (for testing/admin)
   * @deprecated Use feature data layer directly
   */
  async updateOrderStatus(
    orderId: string,
    status: Order['status']
  ): Promise<ApiResponse<Order>> {
    const strategy = OrdersDataFactory.getStrategy();
    return strategy.updateOrderStatus(orderId, status);
  },
};
