import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { AnalyticsService } from './analytics.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { TenantOwnershipGuard } from '../tenant/guards/tenant-ownership.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from '@prisma/client'

interface JwtPayload {
  sub: string
  tenantId: string
  role: string
}

@ApiTags('Analytics')
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get dashboard overview stats' })
  async getOverview(@CurrentUser() user: JwtPayload) {
    return this.analyticsService.getOverview(user.tenantId)
  }

  @Get('revenue')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get revenue by date range' })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['day', 'week', 'month'] })
  async getRevenue(
    @CurrentUser() user: JwtPayload,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'day',
  ) {
    return this.analyticsService.getRevenue(user.tenantId, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      groupBy,
    })
  }

  @Get('orders')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get orders statistics' })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  async getOrderStats(
    @CurrentUser() user: JwtPayload,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getOrderStats(user.tenantId, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    })
  }

  @Get('popular-items')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get top selling menu items' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items (default 10)' })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  async getPopularItems(
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit: number = 10,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getPopularItems(user.tenantId, {
      limit: Number(limit),
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    })
  }

  @Get('hourly-distribution')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get orders distribution by hour of day' })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  async getHourlyDistribution(
    @CurrentUser() user: JwtPayload,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getHourlyDistribution(user.tenantId, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    })
  }

  @Get('table-performance')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get performance metrics per table' })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  async getTablePerformance(
    @CurrentUser() user: JwtPayload,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getTablePerformance(user.tenantId, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    })
  }
}
