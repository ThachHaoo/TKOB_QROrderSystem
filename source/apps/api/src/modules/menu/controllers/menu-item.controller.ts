import { Body, Controller, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { TenantOwnershipGuard } from 'src/modules/tenant/guards/tenant-ownership.guard';
import { MenuItemsService } from '../services/menu-item.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/common/interfaces/auth.interface';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateMenuItemDto } from '../dto/menu-item.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { MenuItemResponseDto } from '../dto/menu-response.dto';

@ApiTags('Menu - Items')
@Controller('menu/item')
@UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
@ApiBearerAuth()
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  // CRUD
  // CREATE
  @Post()
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Create new menu item' })
  @ApiResponse({ status: 201, type: MenuItemResponseDto })
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateMenuItemDto) {
    return this.menuItemsService.create(user.tenantId, dto);
  }

  // // READ:
  // async findAll(
  //   @CurrentUser user: AuthenticatedUser,
  //   @Query filters: MenuItemFiltersDto,
  //   @Query pagination: PaginationDto,
  // ) {
  //   return this.menuItemsService.findFiltered(user.tenantId, filters, pagination);
  // }

  // // READ: findById(id)
  // async findOne(@Param('id') id: string) {
  //   return this.menuItemsService.findById(id);
  // }

  // // UPDATE:
  // async update((@Param('id') id: string, @Body dto: UpdateMenuItemDto) {
  //   return this.menuItemsService.update(id, dto);
  // }

  // // DELETE:
  // async delete(@Param('id') id: string) {
  //   await this.menuItemsService.delete(id);
  // }
}
