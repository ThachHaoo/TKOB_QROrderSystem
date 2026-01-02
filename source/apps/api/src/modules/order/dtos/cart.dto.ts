import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CartModifierDto {
  @ApiProperty({ example: 'mod_123' })
  @IsString()
  groupId: string;

  @ApiProperty({ example: 'Size' })
  @IsString()
  groupName: string;

  @ApiProperty({ example: 'opt_456' })
  @IsString()
  optionId: string;

  @ApiProperty({ example: 'Large' })
  @IsString()
  optionName: string;

  @ApiProperty({ example: 10000 })
  @IsOptional()
  @IsNumber()
  priceDelta: number;
}

export class AddToCartDto {
  @ApiProperty({ example: 'item_123' })
  @IsString()
  menuItemId: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ type: [CartModifierDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CartModifierDto)
  modifiers?: CartModifierDto[];

  @ApiPropertyOptional({ example: 'No ice please' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateCartItemDto {
  @ApiProperty({ example: 1, minimum: 0 })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ example: 'No ice please' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CartItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  menuItemId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  modifiers: CartModifierDto[];

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  itemTotal: number; // (price + sum(modifiers)) * quantity
}

export class CartResponseDto {
  @ApiProperty({ type: [CartItemResponseDto] })
  items: CartItemResponseDto[];

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  tax: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  itemCount: number;
}
