import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MenuCategoryService } from '../services/menu-category.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { TenantOwnershipGuard } from 'src/modules/tenant/guards/tenant-ownership.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateMenuCategoryDto, UpdateMenuCategoryDto } from '../dto/menu-category.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { MenuCategoryResponseDto } from '../dto/menu-response.dto';
import type { AuthenticatedUser } from 'src/common/interfaces/auth.interface';
import { SkipTransform } from 'src/common/interceptors/transform.interceptor';

@ApiTags('Menu - Categories')
@Controller('menu/categories')
@UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
export class MenuCategoryController {
  constructor(private readonly menuCategoryService: MenuCategoryService) {}

  // CRUD
  // C: api create new category
  @Post()
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create menu category' })
  @ApiResponse({ status: 201, type: MenuCategoryResponseDto })
  @ApiResponse({
    status: 409,
    description: 'Category name already exists for this tenant',
  })
  // Param: user -> lấy người dùng hiện tại để lấy tenant_id gắn vào quert
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateMenuCategoryDto) {
    // SQL: INSERT INTO MENU_CATEGORY(...tenant_id...) VALUE(...tenant_id...)
    return this.menuCategoryService.create(user.tenantId, dto);
  }

  // R: api find all categories
  @Get()
  @Roles(UserRole.OWNER, UserRole.STAFF, UserRole.KITCHEN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all menu categories' })
  @ApiResponse({ status: 200, type: [MenuCategoryResponseDto] })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  async findAll(@CurrentUser() user: AuthenticatedUser, @Query('activeOnly') activeOnly?: boolean) {
    return this.menuCategoryService.findAll(user.tenantId, activeOnly);
  }

  // R: api find one category
  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.STAFF, UserRole.KITCHEN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, type: MenuCategoryResponseDto })
  async findOne(@Param('id') id: string) {
    return this.menuCategoryService.findById(id);
  }

  // U: api update one category
  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update menu category' })
  @ApiResponse({ status: 200, type: MenuCategoryResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateMenuCategoryDto) {
    return this.menuCategoryService.update(id, dto);
  }

  // D: api delete one category (soft delete)
  @Delete(':id')
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @SkipTransform()
  @ApiOperation({
    summary: 'Archive menu category',
    description: 'Soft delete: Sets active = false',
  })
  @ApiResponse({ status: 204 })
  async delete(@Param('id') id: string) {
    await this.menuCategoryService.delete(id);
  }

  @Patch('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SkipTransform()
  @ApiOperation({
    summary: 'Reorder menu categories',
    description: 'Update display order of multiple categories at once',
  })
  @ApiResponse({ status: 204, description: 'Categories reordered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid order data' })
  async reorder(
    @Body() dto: { categories: Array<{ id: string; displayOrder: number }> },
  ) {
    // Update display order for each category
    await Promise.all(
      dto.categories.map((cat) =>
        this.menuCategoryService.update(cat.id, { displayOrder: cat.displayOrder }),
      ),
    );
  }
}
