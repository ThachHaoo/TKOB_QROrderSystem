import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { SessionGuard } from '@/modules/table/guards/session.guard';
import { Public } from '@/common/decorators/public.decorator';
import { Session } from '@/common/decorators/session.decorator';
import { CartResponseDto } from '../dtos/cart.dto';
import { SessionData } from '@/modules/table/services/table-session.service';

@ApiTags('Orders - Cart')
@Controller('cart')
@UseGuards(SessionGuard)
@Public()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiCookieAuth('table_session_id')
  @ApiOperation({ summary: 'Get cart for current session' })
  @ApiResponse({ status: 200, type: CartResponseDto })
  async getCart(@Session() session: SessionData): Promise<CartResponseDto> {
    const cart = await this.cartService.getCart(session.sessionId);
    return this.cartService['toResponseDto'](cart);
  }
}
