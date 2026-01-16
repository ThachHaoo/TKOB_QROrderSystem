import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod, OrderStatus } from '@prisma/client';

export class PaymentStatusResponseDto {
  @ApiProperty({
    description: 'Payment ID',
    example: 'f1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c',
  })
  paymentId: string;

  @ApiProperty({
    description: 'Order ID',
    example: 'e8f9a0b1-2c3d-4e5f-6a7b-8c9d0e1f2a3b',
  })
  orderId: string;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.SEPAY_QR,
  })
  method: PaymentMethod;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
  })
  status: PaymentStatus;

  @ApiProperty({
    description: 'Payment amount',
    example: 250000,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency',
    example: 'VND',
  })
  currency: string;

  @ApiProperty({
    description: 'Transaction ID from provider',
    example: 'TXN123456789',
    required: false,
  })
  transactionId?: string;

  @ApiProperty({
    description: 'Payment completion time',
    example: '2026-01-11T05:50:00.000Z',
    required: false,
  })
  paidAt?: Date;

  @ApiProperty({
    description: 'Failure reason if payment failed',
    example: 'Insufficient funds',
    required: false,
  })
  failureReason?: string;

  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.RECEIVED,
  })
  orderStatus: OrderStatus;

  @ApiProperty({
    description: 'Payment expiration time',
    example: '2026-01-11T06:00:00.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Payment creation time',
    example: '2026-01-11T05:45:00.000Z',
  })
  createdAt: Date;
}
