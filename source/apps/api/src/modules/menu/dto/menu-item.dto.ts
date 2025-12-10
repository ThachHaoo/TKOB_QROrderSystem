import {
  IsString,
  IsOptional,
  IsNumber,
  IsUrl,
  IsArray,
  IsBoolean,
  IsInt,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MenuItemStatus } from '@prisma/client';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Spring Rolls' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Fresh vegetable spring rolls with sweet chili sauce' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 'cat_1' })
  @IsString()
  categoryId: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/spring-rolls.jpg' })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: ['popular', 'vegetarian'] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: ['gluten'] })
  @IsArray()
  @IsOptional()
  allergens?: string[];

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  displayOrder?: number;

  @ApiPropertyOptional({ example: ['mod_1', 'mod_2'] })
  @IsArray()
  @IsOptional()
  modifierGroupIds?: string[];
}
