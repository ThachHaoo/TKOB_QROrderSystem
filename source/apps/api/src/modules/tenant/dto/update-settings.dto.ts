import { IsString, IsObject, IsOptional, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class TaxSettingsDto {
  @ApiPropertyOptional({ example: true, description: 'Enable tax calculation' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ example: 10, description: 'Tax percentage (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  rate?: number;

  @ApiPropertyOptional({ example: 'VAT', description: 'Tax type label' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ example: true, description: 'Include tax in displayed prices' })
  @IsOptional()
  @IsBoolean()
  includedInPrice?: boolean;
}

export class ServiceChargeSettingsDto {
  @ApiPropertyOptional({ example: false, description: 'Enable service charge' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ example: 5, description: 'Service charge percentage (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  rate?: number;

  @ApiPropertyOptional({ example: 'Service Charge', description: 'Service charge label' })
  @IsOptional()
  @IsString()
  label?: string;
}

export class TipSettingsDto {
  @ApiPropertyOptional({ example: true, description: 'Enable tip suggestions' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ example: [10, 15, 20], description: 'Suggested tip percentages' })
  @IsOptional()
  @IsNumber({}, { each: true })
  suggestions?: number[];

  @ApiPropertyOptional({ example: true, description: 'Allow custom tip amount' })
  @IsOptional()
  @IsBoolean()
  allowCustom?: boolean;
}

export class UpdateSettingsDto {
  @ApiProperty({ example: 'vi' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ example: 'Asia/Ho_Chi_Minh' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: 'USD', description: 'Primary currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ type: TaxSettingsDto, description: 'Tax configuration' })
  @IsOptional()
  @Type(() => TaxSettingsDto)
  tax?: TaxSettingsDto;

  @ApiPropertyOptional({ type: ServiceChargeSettingsDto, description: 'Service charge configuration' })
  @IsOptional()
  @Type(() => ServiceChargeSettingsDto)
  serviceCharge?: ServiceChargeSettingsDto;

  @ApiPropertyOptional({ type: TipSettingsDto, description: 'Tip configuration' })
  @IsOptional()
  @Type(() => TipSettingsDto)
  tip?: TipSettingsDto;
}
