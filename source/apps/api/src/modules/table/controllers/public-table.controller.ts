import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { QrService } from '../services/qr.service';
import { PublicMenuResponseDto } from '../../menu/dto/menu-response.dto';
import { MenuItemsService } from '../../menu/services/menu-item.service';

@ApiTags('Tables - Public')
@Controller('menu')
export class PublicTableController {
  constructor(
    private readonly qrService: QrService,
    private readonly menuService: MenuItemsService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get menu via QR token (for customers)',
    description: 'Validates QR token and returns published menu for the table',
  })
  @ApiQuery({ name: 'qr_token', required: true, description: 'QR token from scanned code' })
  @ApiResponse({ status: 200, type: PublicMenuResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid QR token' })
  @ApiResponse({ status: 410, description: 'QR code has been regenerated' })
  async getMenuByQr(@Query('qr_token') qrToken: string) {
    if (!qrToken) {
      throw new BadRequestException('QR token is required');
    }

    // Validate QR token and get tenant info
    const { tableId, tenantId } = await this.qrService.validateToken(qrToken);

    // Get published menu for the tenant
    return this.menuService.getPublicMenu(tenantId);
  }
}
