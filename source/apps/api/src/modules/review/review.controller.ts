import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ReviewService } from './review.service';
import {
  CreateReviewDto,
  ReviewResponseDto,
  OrderReviewSummaryDto,
  MenuItemReviewStatsDto,
  TenantReviewStatsDto,
} from './dto/review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantOwnershipGuard } from '../tenant/guards/tenant-ownership.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetTenant } from '../../common/decorators/tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Reviews')
@Controller()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // ==================== Customer Endpoints ====================

  @Post('orders/:orderId/items/:itemId/review')
  @Public()
  @ApiOperation({ summary: 'Create or update a review for an order item' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiParam({ name: 'itemId', description: 'Order Item ID' })
  @ApiQuery({ name: 'sessionId', description: 'Customer session ID' })
  @ApiQuery({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({ status: 201, type: ReviewResponseDto })
  async createReview(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Query('sessionId') sessionId: string,
    @Query('tenantId') tenantId: string,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewService.createOrUpdateReview(
      tenantId,
      orderId,
      itemId,
      sessionId,
      dto,
    );
  }

  @Get('orders/:orderId/reviews')
  @Public()
  @ApiOperation({ summary: 'Get all reviews for an order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiQuery({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({ status: 200, type: OrderReviewSummaryDto })
  async getOrderReviews(
    @Param('orderId') orderId: string,
    @Query('tenantId') tenantId: string,
  ): Promise<OrderReviewSummaryDto> {
    return this.reviewService.getOrderReviews(tenantId, orderId);
  }

  @Get('menu-items/:menuItemId/reviews')
  @Public()
  @ApiOperation({ summary: 'Get review statistics for a menu item' })
  @ApiParam({ name: 'menuItemId', description: 'Menu Item ID' })
  @ApiQuery({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({ status: 200, type: MenuItemReviewStatsDto })
  async getMenuItemReviews(
    @Param('menuItemId') menuItemId: string,
    @Query('tenantId') tenantId: string,
  ): Promise<MenuItemReviewStatsDto> {
    return this.reviewService.getMenuItemReviewStats(tenantId, menuItemId);
  }

  // ==================== Admin Endpoints ====================

  @Get('admin/reviews/stats')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tenant-wide review statistics' })
  @ApiResponse({ status: 200, type: TenantReviewStatsDto })
  async getTenantReviewStats(
    @GetTenant() tenantId: string,
  ): Promise<TenantReviewStatsDto> {
    return this.reviewService.getTenantReviewStats(tenantId);
  }

  @Get('admin/reviews')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent reviews for tenant' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentReviews(
    @GetTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewService.getRecentReviews(
      tenantId,
      limit || 20,
      page || 1,
    );
  }
}
