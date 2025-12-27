import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MenuItemsService } from '../services/menu-item.service';
import { PublicMenuResponseDto } from '../dto/menu-response.dto';
import { PublicMenuFiltersDto } from '../dto/menu-publish.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/interfaces/auth.interface';

@ApiTags('Menu - Public')
@Controller('menu/public')
@ApiBearerAuth()
export class PublicMenuController {
  constructor(private readonly itemService: MenuItemsService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get published menu (for customers)',
    description:
      'Public endpoint - can be accessed with or without authentication. If not authenticated, tenantId must be provided via query parameter.',
  })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: 'Tenant ID (required if not authenticated)',
    type: String,
  })
  @ApiResponse({ status: 200, type: PublicMenuResponseDto })
  async getPublicMenu(
    @Query('tenantId') queryTenantId?: string,
    @Query() filters?: PublicMenuFiltersDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    // Priority: Authenticated user > Query param
    const tenantId = user?.tenantId || queryTenantId;

    if (!tenantId) {
      throw new BadRequestException(
        'Missing tenantId. Please provide tenantId via query parameter (?tenantId=xxx)',
      );
    }

    return this.itemService.getPublicMenu(tenantId, filters);
  }
}
