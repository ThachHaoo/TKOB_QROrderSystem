import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePaymentConfigDto {
  @ApiPropertyOptional({ description: 'Enable SePay for this tenant' })
  @IsOptional()
  @IsBoolean()
  sepayEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'SePay API Key (will be encrypted)',
    minLength: 10,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  sepayApiKey?: string;

  @ApiPropertyOptional({ description: 'Bank account number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sepayAccountNo?: string;

  @ApiPropertyOptional({ description: 'Bank account holder name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sepayAccountName?: string;

  @ApiPropertyOptional({
    description: 'Bank code (e.g., MB, VCB, ACB)',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  sepayBankCode?: string;

  @ApiPropertyOptional({ description: 'Webhook secret for verification' })
  @IsOptional()
  @IsString()
  webhookSecret?: string;

  @ApiPropertyOptional({ description: 'Enable webhook notifications' })
  @IsOptional()
  @IsBoolean()
  webhookEnabled?: boolean;
}

export class PaymentConfigResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  sepayEnabled: boolean;

  @ApiPropertyOptional({ description: 'Masked API key (last 4 chars only)' })
  sepayApiKeyMasked?: string;

  @ApiPropertyOptional()
  sepayAccountNo?: string;

  @ApiPropertyOptional()
  sepayAccountName?: string;

  @ApiPropertyOptional()
  sepayBankCode?: string;

  @ApiProperty()
  webhookEnabled: boolean;

  @ApiPropertyOptional({ description: 'Webhook secret (masked)' })
  webhookSecretMasked?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class TestPaymentConfigDto {
  @ApiProperty({
    description: 'Amount to test with (VND)',
    example: 10000,
  })
  amount: number;
}

export class TestPaymentResultDto {
  @ApiProperty()
  success: boolean;

  @ApiPropertyOptional()
  qrCodeUrl?: string;

  @ApiPropertyOptional()
  error?: string;
}

// Bank codes reference
export const SUPPORTED_BANKS = [
  { code: 'MB', name: 'MB Bank (Quân đội)' },
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'ACB', name: 'ACB' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'VTB', name: 'VietinBank' },
  { code: 'TPB', name: 'TPBank' },
  { code: 'VPB', name: 'VPBank' },
  { code: 'SHB', name: 'SHB' },
  { code: 'MSB', name: 'MSB' },
] as const;
