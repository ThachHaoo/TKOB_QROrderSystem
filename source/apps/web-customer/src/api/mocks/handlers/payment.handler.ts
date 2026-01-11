// Mock handlers for payment-related API calls

import { ApiResponse } from '@/types';
import { delay, createSuccessResponse, createErrorResponse } from '../utils';
import { loadOrdersFromStorage, saveOrdersToStorage } from '../data';

export const paymentHandlers = {
  /**
   * Update order payment status after successful payment
   */
  async updateOrderPaymentStatus(
    orderId: string, 
    sessionId?: string
  ): Promise<ApiResponse<void>> {
    await delay(100);
    
    // Load orders from storage
    const orders = loadOrdersFromStorage(sessionId);
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return createErrorResponse('Order not found');
    }
    
    // Update payment status
    orders[orderIndex].paymentStatus = 'Paid';
    
    // Save back to storage
    saveOrdersToStorage(orders, sessionId);
    
    if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
      console.log('[Payment Handler] Updated order payment status:', orderId, '-> Paid');
    }
    
    return createSuccessResponse(undefined, 'Payment status updated');
  },

  /**
   * Process card payment
   */
  async processCardPayment(data: {
    orderId: string;
    amount: number;
    sessionId?: string;
  }): Promise<ApiResponse<{
    transactionId: string;
    status: 'completed' | 'failed';
  }>> {
    // Simulate payment processing time
    await delay(2000);
    
    // Simulate random failure (10% chance)
    if (Math.random() < 0.1) {
      return createErrorResponse('Payment failed. Please try again.');
    }
    
    // Update order payment status after successful payment
    await this.updateOrderPaymentStatus(data.orderId, data.sessionId);
    
    return createSuccessResponse({
      transactionId: `txn-${Date.now()}`,
      status: 'completed',
    }, 'Payment processed successfully');
  },
  
  /**
   * Verify payment status
   */
  async verifyPayment(transactionId: string): Promise<ApiResponse<{
    status: 'completed' | 'pending' | 'failed';
  }>> {
    await delay(300);
    
    return createSuccessResponse({
      status: 'completed',
    });
  },
};
