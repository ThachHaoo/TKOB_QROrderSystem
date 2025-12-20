// Order service - handles order creation and management

import { USE_MOCK_API } from '@/lib/constants';
import { orderHandlers } from '@/api/mocks';
import apiClient from '@/api/client';
import { ApiResponse, Order, CartItem } from '@/types';

export const OrderService = {
  /**
   * Create new order
   */
  async createOrder(data: {
    tableId: string;
    items: CartItem[];
    customerName?: string;
    notes?: string;
    paymentMethod: 'card' | 'counter';
  }): Promise<ApiResponse<Order>> {
    if (USE_MOCK_API) {
      return orderHandlers.createOrder(data);
    }
    
    const response = await apiClient.post('/api/orders', data);
    return response.data;
  },
  
  /**
   * Get order by ID
   */
  async getOrder(id: string): Promise<ApiResponse<Order>> {
    if (USE_MOCK_API) {
      return orderHandlers.getOrder(id);
    }
    
    const response = await apiClient.get(`/api/orders/${id}`);
    return response.data;
  },
  
  /**
   * Get order history for user
   */
  async getOrderHistory(userId: string): Promise<ApiResponse<Order[]>> {
    if (USE_MOCK_API) {
      return orderHandlers.getOrderHistory(userId);
    }
    
    const response = await apiClient.get(`/api/orders/history/${userId}`);
    return response.data;
  },
  
  /**
   * Update order status (for testing/admin)
   */
  async updateOrderStatus(
    orderId: string,
    status: Order['status']
  ): Promise<ApiResponse<Order>> {
    if (USE_MOCK_API) {
      return orderHandlers.updateOrderStatus(orderId, status);
    }
    
    const response = await apiClient.patch(`/api/orders/${orderId}/status`, { status });
    return response.data;
  },
};
