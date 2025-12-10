import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MenuCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class MenuItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  price: number;

  @ApiPropertyOptional()
  imageUrl?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  available: boolean;

  @ApiPropertyOptional()
  tags?: string[];

  @ApiPropertyOptional()
  allergens?: string[];

  @ApiProperty()
  displayOrder: number;

  @ApiPropertyOptional({ type: MenuCategoryResponseDto })
  category?: MenuCategoryResponseDto;

  // @ApiPropertyOptional({ type: [ModifierGroupResponseDto] })
  // modifierGroups?: ModifierGroupResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  publishedAt?: Date;
}
