import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

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
  priceDelta: number;
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
