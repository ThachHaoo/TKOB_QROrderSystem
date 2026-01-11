/**
 * @deprecated Legacy shim - prefer features/payment/data
 * 
 * This service delegates to the feature-owned payment data layer.
 * Use PaymentDataFactory directly from @/features/payment/data for new code.
 */

import { PaymentDataFactory } from '@/features/payment/data';
import { ApiResponse } from '@/types';

export const PaymentService = {
  /**
   * @deprecated Use PaymentDataFactory.getStrategy().processCardPayment() instead
   */
  async processCardPayment(data: {
    orderId: string;
    amount: number;
  }): Promise<ApiResponse<{
    transactionId: string;
    status: 'completed' | 'failed';
  }>> {
    const strategy = PaymentDataFactory.getStrategy();
    return strategy.processCardPayment(data);
  },
  
  /**
   * @deprecated Use PaymentDataFactory.getStrategy().verifyPayment() instead
   */
  async verifyPayment(transactionId: string): Promise<ApiResponse<{
    status: 'completed' | 'pending' | 'failed';
  }>> {
    const strategy = PaymentDataFactory.getStrategy();
    return strategy.verifyPayment(transactionId);
  },
};
