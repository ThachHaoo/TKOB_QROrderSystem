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
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MenuItemStatus } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';

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

export class MenuItemFiltersDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ enum: MenuItemStatus })
  @IsEnum(MenuItemStatus)
  @IsOptional()
  status?: MenuItemStatus;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  available?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
}

export class UpdateMenuItemDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  allergens?: string[];

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  available?: boolean;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  modifierGroupIds?: string[];
}

export class PublishMenuItemDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  publish: boolean;
}

export class ToggleAvailabilityDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  available: boolean;
}
