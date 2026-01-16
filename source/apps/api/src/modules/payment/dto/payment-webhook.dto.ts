import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class PaymentWebhookDto {
  @ApiProperty({
    description: 'SePay transaction ID',
    example: 'TXN123456789',
  })
  @IsString()
  transactionId: string;

  @ApiProperty({
    description: 'Transfer content that matches order',
    example: 'DH123456',
  })
  @IsString()
  transferContent: string;

  @ApiProperty({
    description: 'Amount received',
    example: 250000,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Bank code',
    example: 'VCB',
  })
  @IsString()
  bankCode: string;

  @ApiProperty({
    description: 'Account number that received payment',
    example: '1234567890',
  })
  @IsString()
  accountNumber: string;

  @ApiProperty({
    description: 'Transaction status',
    example: 'success',
  })
  @IsIn(['success', 'failed'])
  status: 'success' | 'failed';

  @ApiProperty({
    description: 'Transaction timestamp',
    example: '2026-01-11T05:50:00.000Z',
  })
  @IsString()
  transactionTime: string;

  @ApiProperty({
    description: 'Webhook signature for verification',
    example: 'a1b2c3d4e5f6...',
  })
  @IsString()
  signature: string;

  @ApiProperty({
    description: 'Additional data from SePay',
    required: false,
  })
  @IsOptional()
  metadata?: any;
}
