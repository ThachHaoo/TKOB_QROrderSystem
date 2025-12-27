import { BadRequestException, Controller, Get, Headers, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MenuItemsService } from '../services/menu-item.service';
import { PublicMenuResponseDto } from '../dto/menu-response.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/interfaces/auth.interface';

@ApiTags('Menu - Public')
@Controller('menu/public')
export class PublicMenuController {
  constructor(private readonly itemService: MenuItemsService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get published menu (for customers)',
    description:
      'Public endpoint - can be accessed with or without authentication. If not authenticated, tenantId must be provided via query parameter or header.',
  })
  @ApiResponse({ status: 200, type: PublicMenuResponseDto })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: 'Restaurant/Tenant ID (required for unauthenticated requests)',
    example: '629f5ab4-dc6a-48ca-b5ad-d18558829611',
  })
  @ApiBearerAuth()
  async getPublicMenu(
    @CurrentUser() user?: AuthenticatedUser,
    @Query('tenantId') queryTenantId?: string,
    // @Headers('x-tenant-id') headerTenantId?: string,
  ) {
    // Priority: Authenticated user > Query param > Header
    const tenantId = user?.tenantId || queryTenantId;

    if (!tenantId) {
      throw new BadRequestException(
        'Missing tenantId. Please provide tenantId via query parameter (?tenantId=xxx) or header (x-tenant-id)',
      );
    }

    return this.itemService.getPublicMenu(tenantId);
  }
}
