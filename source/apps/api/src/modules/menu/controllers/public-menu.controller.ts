import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MenuItemsService } from '../services/menu-item.service';
import { PublicMenuResponseDto } from '../dto/menu-response.dto';
import { Public } from '../../../common/decorators/public.decorator';
import type { Request } from 'express';

@ApiTags('Menu - Public')
@Controller('menu/public')
export class PublicMenuController {
  constructor(private readonly itemService: MenuItemsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get published menu (for customers)' })
  @ApiResponse({ status: 200, type: PublicMenuResponseDto })
  @ApiBearerAuth()
  async getPublicMenu(@Req() req: Request) {
    // Lấy tenantId từ middleware, header, hoặc query
    const tenantId =
      req.tenant?.id ||
      (req.headers['x-tenant-id'] as string) ||
      (req.query['tenantId'] as string) ||
      undefined;

    if (!tenantId) {
      throw new Error('Missing tenantId');
    }

    return this.itemService.getPublicMenu(tenantId);
  }
}
