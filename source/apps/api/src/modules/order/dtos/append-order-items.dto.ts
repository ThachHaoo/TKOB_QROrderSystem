import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { CartModifierInputDto } from './cart.dto';

/**
 * DTO for a single item to append to existing order
 */
export class AppendOrderItemDto {
  @ApiProperty({
    description: 'Menu item ID to add',
    example: 'item_123',
  })
  @IsString()
  menuItemId: string;

  @ApiProperty({
    description: 'Quantity to add',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Selected modifiers for the item',
    type: [CartModifierInputDto],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CartModifierInputDto)
  modifiers?: CartModifierInputDto[];

  @ApiPropertyOptional({
    description: 'Special instructions or notes',
    example: 'No ice please',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for appending items to existing order
 * Used when customer wants to add more items to unpaid BILL_TO_TABLE order
 */
export class AppendOrderItemsDto {
  @ApiProperty({
    description: 'List of items to append to the order',
    type: [AppendOrderItemDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one item is required' })
  @ValidateNested({ each: true })
  @Type(() => AppendOrderItemDto)
  items: AppendOrderItemDto[];
}

/**
 * Response for checking mergeable orders
 */
export class MergeableOrderResponseDto {
  @ApiProperty({
    description: 'Whether there is a mergeable order',
  })
  hasMergeableOrder: boolean;

  @ApiPropertyOptional({
    description: 'The existing order that can be merged into',
  })
  existingOrder?: {
    id: string;
    orderNumber: string;
    total: number;
    itemCount: number;
    createdAt: Date;
  };

  @ApiProperty({
    description: 'Message explaining the merge possibility',
  })
  message: string;
}
