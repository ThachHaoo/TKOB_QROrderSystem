import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SubscriptionTier, PaymentStatus } from '@prisma/client';

/**
 * DTO for initiating subscription upgrade with payment
 */
export class CreateSubscriptionPaymentDto {
  @ApiProperty({
    enum: SubscriptionTier,
    description: 'Target subscription tier to upgrade to',
    example: 'BASIC',
  })
  @IsNotEmpty()
  @IsEnum(SubscriptionTier)
  targetTier: SubscriptionTier;

  @ApiPropertyOptional({
    description: 'Return URL after successful payment',
    example: 'https://app.example.com/subscription/success',
  })
  @IsOptional()
  @IsString()
  returnUrl?: string;

  @ApiPropertyOptional({
    description: 'Cancel URL if payment is cancelled',
    example: 'https://app.example.com/subscription/cancel',
  })
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}

/**
 * Response for subscription payment intent
 */
export class SubscriptionPaymentResponseDto {
  @ApiProperty({ description: 'Payment ID' })
  paymentId: string;

  @ApiProperty({ description: 'Subscription upgrade request ID' })
  upgradeRequestId: string;

  @ApiProperty({ description: 'Target plan name' })
  targetPlan: string;

  @ApiProperty({ enum: SubscriptionTier, description: 'Target tier' })
  targetTier: SubscriptionTier;

  @ApiProperty({ description: 'Amount in USD' })
  amountUSD: number;

  @ApiProperty({ description: 'Amount in VND (for payment)' })
  amountVND: number;

  @ApiProperty({ description: 'VietQR code content' })
  qrContent: string;

  @ApiProperty({ description: 'QR code image URL' })
  qrCodeUrl: string;

  @ApiProperty({ description: 'Deep link to banking app', required: false })
  deepLink?: string;

  @ApiProperty({ description: 'Transfer content for bank transfer' })
  transferContent: string;

  @ApiProperty({ description: 'Bank account number to transfer to' })
  accountNumber: string;

  @ApiProperty({ description: 'Bank account name' })
  accountName: string;

  @ApiProperty({ description: 'Bank code' })
  bankCode: string;

  @ApiProperty({ enum: PaymentStatus, description: 'Payment status' })
  status: PaymentStatus;

  @ApiProperty({ description: 'Payment expiration time' })
  expiresAt: Date;

  @ApiProperty({ description: 'Payment creation time' })
  createdAt: Date;
}

/**
 * DTO for checking subscription payment status
 */
export class SubscriptionPaymentStatusDto {
  @ApiProperty({ description: 'Payment ID' })
  paymentId: string;

  @ApiProperty({ enum: PaymentStatus, description: 'Payment status' })
  status: PaymentStatus;

  @ApiProperty({ description: 'Whether subscription was upgraded' })
  subscriptionUpgraded: boolean;

  @ApiProperty({ enum: SubscriptionTier, description: 'Current tier (after upgrade if successful)', required: false })
  currentTier?: SubscriptionTier;

  @ApiProperty({ description: 'Transaction ID from provider', required: false })
  transactionId?: string;

  @ApiProperty({ description: 'Payment completion time', required: false })
  paidAt?: Date;

  @ApiProperty({ description: 'Error message if failed', required: false })
  errorMessage?: string;
}
