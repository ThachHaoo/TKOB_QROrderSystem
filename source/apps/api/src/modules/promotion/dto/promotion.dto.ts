import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PromotionType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreatePromotionDto {
  @ApiProperty({ description: 'Promotion code (e.g., SUMMER20)', maxLength: 50 })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ description: 'Description of the promotion' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({ enum: PromotionType, description: 'Type: PERCENTAGE or FIXED' })
  @IsEnum(PromotionType)
  type: PromotionType;

  @ApiProperty({
    description: 'Value: percentage (0-100) or fixed amount in VND',
    example: 20,
  })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({
    description: 'Minimum order value to apply promo (VND)',
    example: 100000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @ApiPropertyOptional({
    description: 'Maximum discount cap for percentage type (VND)',
    example: 50000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of times this promo can be used',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiProperty({ description: 'Start date of promotion', example: '2025-01-01T00:00:00Z' })
  @IsDateString()
  startsAt: string;

  @ApiProperty({ description: 'Expiry date of promotion', example: '2025-12-31T23:59:59Z' })
  @IsDateString()
  expiresAt: string;

  @ApiPropertyOptional({ description: 'Is promotion active', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdatePromotionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class PromotionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  code: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: PromotionType })
  type: PromotionType;

  @ApiProperty()
  value: number;

  @ApiPropertyOptional()
  minOrderValue?: number;

  @ApiPropertyOptional()
  maxDiscount?: number;

  @ApiPropertyOptional()
  usageLimit?: number;

  @ApiProperty()
  usageCount: number;

  @ApiProperty()
  startsAt: Date;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Is currently valid (active + within date range + not exceeded)' })
  isValid?: boolean;
}

export class ValidatePromoDto {
  @ApiProperty({ description: 'Promotion code to validate' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Order subtotal to check minimum requirement' })
  @IsNumber()
  @Min(0)
  orderSubtotal: number;
}

export class ValidatePromoResponseDto {
  @ApiProperty()
  valid: boolean;

  @ApiPropertyOptional()
  error?: string;

  @ApiPropertyOptional({ description: 'Calculated discount amount (VND)' })
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Promotion details if valid' })
  promotion?: {
    code: string;
    type: PromotionType;
    value: number;
    description?: string;
  };
}

export class PromotionListQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  active?: boolean;

  @ApiPropertyOptional({ description: 'Include expired promotions' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeExpired?: boolean;
}
