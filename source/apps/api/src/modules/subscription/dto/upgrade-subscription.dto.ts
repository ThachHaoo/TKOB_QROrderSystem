import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SubscriptionTierDto {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
}

export class UpgradeSubscriptionDto {
  @ApiProperty({
    enum: SubscriptionTierDto,
    description: 'Target subscription tier',
    example: 'BASIC',
  })
  @IsNotEmpty()
  @IsEnum(SubscriptionTierDto)
  targetTier: SubscriptionTierDto;
}
