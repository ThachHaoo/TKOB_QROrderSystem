/**
 * Payment Provider Interface - Strategy Pattern
 * 
 * Defines the contract for payment provider implementations (SePay, Stripe, etc).
 * This allows switching between different payment gateways without changing business logic.
 */

/**
 * Payment Intent - Data returned when creating a new payment
 */
export interface PaymentIntent {
  /** Unique payment identifier */
  paymentId: string;
  
  /** Associated order ID */
  orderId: string;
  
  /** Payment amount in smallest currency unit (e.g., VND) */
  amount: number;
  
  /** Currency code (VND, USD, etc.) */
  currency: string;
  
  /** QR code content for scanning */
  qrContent: string;
  
  /** Deep link for mobile banking apps */
  deepLink: string;
  
  /** Transfer content/description for bank transfer */
  transferContent: string;
  
  /** Recipient account number */
  accountNumber: string;
  
  /** Recipient account name */
  accountName: string;
  
  /** Bank code (CTG, VCB, etc.) */
  bankCode: string;
  
  /** Payment expiration timestamp */
  expiresAt: Date;
  
  /** Raw provider-specific data */
  providerData?: any;
}

/**
 * Webhook Payload - Data received from payment provider
 */
export interface WebhookPayload {
  /** Provider's transaction ID */
  transactionId: string;
  
  /** Transfer content/description */
  transferContent: string;
  
  /** Transaction amount */
  amount: number;
  
  /** Bank code */
  bankCode: string;
  
  /** Account number */
  accountNumber: string;
  
  /** Transaction status (success, failed, etc.) */
  status: string;
  
  /** Transaction timestamp */
  transactionTime: Date;
  
  /** Webhook signature for verification */
  signature?: string;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
  
  /** Raw provider data */
  rawData?: any;
}

/**
 * Payment Status Query Result
 */
export interface PaymentStatusResult {
  /** Payment ID */
  paymentId: string;
  
  /** Order ID */
  orderId: string;
  
  /** Current payment status */
  status: string;
  
  /** Transaction amount */
  amount: number;
  
  /** Provider's transaction ID (if paid) */
  transactionId?: string;
  
  /** Payment timestamp (if paid) */
  paidAt?: Date;
  
  /** Failure reason (if failed) */
  failureReason?: string;
  
  /** Raw provider data */
  providerData?: any;
}

/**
 * Payment Provider Interface
 * 
 * All payment providers must implement this interface to ensure consistent behavior.
 */
export interface IPaymentProvider {
  /**
   * Create a new payment intent
   * 
   * @param orderId - Order identifier
   * @param amount - Payment amount in smallest currency unit
   * @param currency - Currency code (VND, USD, etc.)
   * @param metadata - Additional metadata (customer info, etc.)
   * @returns Payment intent with QR code and payment details
   * @throws PaymentProviderException on API errors
   */
  createPaymentIntent(
    orderId: string,
    amount: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<PaymentIntent>;

  /**
   * Verify webhook signature
   * 
   * @param payload - Raw webhook payload
   * @param signature - Signature from webhook headers
   * @param secret - Webhook secret for verification
   * @returns true if signature is valid
   */
  verifyWebhookSignature(
    payload: any,
    signature: string,
    secret?: string,
  ): boolean;

  /**
   * Get payment status from provider
   * 
   * @param transactionId - Provider's transaction ID
   * @returns Payment status result
   * @throws PaymentProviderException on API errors
   */
  getPaymentStatus(transactionId: string): Promise<PaymentStatusResult>;
}

/**
 * Payment Provider Exception
 * 
 * Base exception for payment provider errors
 */
export class PaymentProviderException extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly providerResponse?: any,
  ) {
    super(message);
    this.name = 'PaymentProviderException';
  }
}

/**
 * Network/Timeout Exception
 */
export class PaymentProviderNetworkException extends PaymentProviderException {
  constructor(message: string, cause?: Error) {
    super(message, 'NETWORK_ERROR', 503);
    this.name = 'PaymentProviderNetworkException';
    this.cause = cause;
  }
}

/**
 * Rate Limit Exception
 */
export class PaymentProviderRateLimitException extends PaymentProviderException {
  constructor(
    message: string,
    public readonly retryAfter?: number,
  ) {
    super(message, 'RATE_LIMIT', 429);
    this.name = 'PaymentProviderRateLimitException';
  }
}

/**
 * Invalid Request Exception
 */
export class PaymentProviderInvalidRequestException extends PaymentProviderException {
  constructor(message: string, providerResponse?: any) {
    super(message, 'INVALID_REQUEST', 400, providerResponse);
    this.name = 'PaymentProviderInvalidRequestException';
  }
}
