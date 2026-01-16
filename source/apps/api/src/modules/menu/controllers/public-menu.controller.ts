import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MenuItemsService } from '../services/menu-item.service';
import { PublicMenuResponseDto } from '../dto/menu-response.dto';
import { PublicMenuFiltersDto } from '../dto/menu-publish.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Session } from '../../../common/decorators/session.decorator';
import type { AuthenticatedUser } from '../../../common/interfaces/auth.interface';

@ApiTags('Menu - Public')
@Controller('menu/public')
@ApiBearerAuth()
@ApiCookieAuth('table_session_id')
export class PublicMenuController {
  constructor(private readonly itemService: MenuItemsService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get published menu (for customers)',
    description:
      'Public endpoint - can be accessed with JWT auth, session cookie, or tenantId query parameter. Priority: JWT user > Session cookie > Query param.',
  })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: 'Tenant ID (required if not authenticated and no session)',
    type: String,
  })
  @ApiResponse({ status: 200, type: PublicMenuResponseDto })
  async getPublicMenu(
    @Query('tenantId') queryTenantId?: string,
    @Query() filters?: PublicMenuFiltersDto,
    @CurrentUser() user?: AuthenticatedUser,
    @Session() session?: { tenantId: string },
  ) {
    // Priority: Authenticated user > Session cookie > Query param
    const tenantId = user?.tenantId || session?.tenantId || queryTenantId;

    if (!tenantId) {
      throw new BadRequestException(
        'Missing tenantId. Please authenticate, provide session cookie, or pass tenantId query parameter (?tenantId=xxx)',
      );
    }

    return this.itemService.getPublicMenu(tenantId, filters);
  }
}
