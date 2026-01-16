import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Base Payment Exception
 */
export class PaymentException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'PaymentException';
  }
}

/**
 * Payment Not Found Exception
 *
 * Thrown when payment ID doesn't exist in database
 */
export class PaymentNotFoundException extends NotFoundException {
  constructor(paymentId: string) {
    super(`Payment ${paymentId} not found`);
    this.name = 'PaymentNotFoundException';
  }
}

/**
 * Payment Expired Exception
 *
 * Thrown when payment has exceeded expiry time
 */
export class PaymentExpiredException extends BadRequestException {
  constructor(paymentId: string, expiresAt: Date) {
    super(
      `Payment ${paymentId} expired at ${expiresAt.toISOString()}. Please create a new payment.`,
    );
    this.name = 'PaymentExpiredException';
  }
}

/**
 * Payment Already Completed Exception
 *
 * Thrown when trying to modify a completed payment
 */
export class PaymentAlreadyCompletedException extends BadRequestException {
  constructor(paymentId: string) {
    super(
      `Payment ${paymentId} is already completed. Cannot modify completed payments.`,
    );
    this.name = 'PaymentAlreadyCompletedException';
  }
}

/**
 * Payment Already Failed Exception
 *
 * Thrown when trying to process a failed payment
 */
export class PaymentAlreadyFailedException extends BadRequestException {
  constructor(paymentId: string, reason?: string) {
    super(
      `Payment ${paymentId} has already failed${reason ? `: ${reason}` : ''}`,
    );
    this.name = 'PaymentAlreadyFailedException';
  }
}

/**
 * Invalid Payment Amount Exception
 *
 * Thrown when payment amount doesn't match expected
 */
export class InvalidPaymentAmountException extends BadRequestException {
  constructor(expected: number, received: number) {
    super(
      `Invalid payment amount. Expected ${expected} VND, but received ${received} VND`,
    );
    this.name = 'InvalidPaymentAmountException';
  }
}

/**
 * Payment Webhook Signature Invalid Exception
 *
 * Thrown when webhook signature verification fails
 */
export class PaymentWebhookSignatureInvalidException extends UnauthorizedException {
  constructor() {
    super('Invalid payment webhook signature');
    this.name = 'PaymentWebhookSignatureInvalidException';
  }
}

/**
 * Order Already Has Payment Exception
 *
 * Thrown when trying to create payment for order that already has one
 */
export class OrderAlreadyHasPaymentException extends BadRequestException {
  constructor(orderId: string, existingPaymentId: string) {
    super(
      `Order ${orderId} already has an active payment: ${existingPaymentId}`,
    );
    this.name = 'OrderAlreadyHasPaymentException';
  }
}

/**
 * Payment Provider Timeout Exception
 *
 * Thrown when payment provider request times out
 */
export class PaymentProviderTimeoutException extends Error {
  constructor(provider: string, operation: string) {
    super(
      `Timeout while ${operation} with payment provider ${provider}. Please try again.`,
    );
    this.name = 'PaymentProviderTimeoutException';
  }
}

/**
 * Payment Retry Exhausted Exception
 *
 * Thrown when all retry attempts have been exhausted
 */
export class PaymentRetryExhaustedException extends Error {
  constructor(operation: string, attempts: number) {
    super(
      `Failed to ${operation} after ${attempts} retry attempts. Please try again later.`,
    );
    this.name = 'PaymentRetryExhaustedException';
  }
}
