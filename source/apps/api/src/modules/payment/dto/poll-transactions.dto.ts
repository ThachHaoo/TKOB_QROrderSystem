import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for polling SePay transactions
 */
export class PollTransactionsDto {
  @ApiPropertyOptional({
    description: 'Transfer content to search for (e.g., DH{orderId})',
    example: 'DH123456',
  })
  @IsOptional()
  @IsString()
  transferContent?: string;

  @ApiPropertyOptional({
    description: 'Number of recent transactions to fetch (default 20, max 100)',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}

/**
 * Single transaction from SePay API
 */
export class SepayTransactionDto {
  @ApiProperty({ description: 'Transaction ID from SePay' })
  id: string;

  @ApiProperty({ description: 'Transaction amount' })
  amount: number;

  @ApiProperty({ description: 'Bank account number' })
  accountNumber: string;

  @ApiProperty({ description: 'Transfer content/description' })
  transferContent: string;

  @ApiProperty({ description: 'Transaction time' })
  transactionTime: Date;

  @ApiProperty({ description: 'Bank code' })
  bankCode: string;

  @ApiProperty({ description: 'Sender account number', required: false })
  senderAccountNumber?: string;

  @ApiProperty({ description: 'Sender name', required: false })
  senderName?: string;
}

/**
 * Response from polling transactions
 */
export class PollTransactionsResponseDto {
  @ApiProperty({ description: 'Whether polling was successful' })
  success: boolean;

  @ApiProperty({ description: 'List of transactions found', type: [SepayTransactionDto] })
  transactions: SepayTransactionDto[];

  @ApiProperty({ description: 'Message if any specific transaction matched', required: false })
  matchedTransaction?: SepayTransactionDto;

  @ApiProperty({ description: 'Whether payment was found and processed', required: false })
  paymentProcessed?: boolean;

  @ApiProperty({ description: 'Timestamp of poll' })
  polledAt: Date;
}

/**
 * DTO for checking payment by transfer content
 */
export class CheckPaymentDto {
  @ApiProperty({
    description: 'Payment ID to check',
    example: 'f1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c',
  })
  @IsString()
  paymentId: string;
}

export class CheckPaymentResponseDto {
  @ApiProperty({ description: 'Payment found status' })
  found: boolean;

  @ApiProperty({ description: 'Payment status', required: false })
  status?: string;

  @ApiProperty({ description: 'Whether payment is completed' })
  completed: boolean;

  @ApiProperty({ description: 'Transaction details if found', required: false })
  transaction?: SepayTransactionDto;

  @ApiProperty({ description: 'Message' })
  message: string;
}
