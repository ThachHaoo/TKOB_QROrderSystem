import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantOwnershipGuard } from '../tenant/guards/tenant-ownership.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SubscriptionService } from './subscription.service';
import { SubscriptionPaymentService } from './subscription-payment.service';
import { UpgradeSubscriptionDto } from './dto/upgrade-subscription.dto';
import { 
  CreateSubscriptionPaymentDto, 
  SubscriptionPaymentResponseDto,
  SubscriptionPaymentStatusDto,
} from './dto/subscription-payment.dto';

interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
}

@ApiTags('Subscription')
@Controller('admin/subscription')
@UseGuards(JwtAuthGuard, TenantOwnershipGuard)
@ApiBearerAuth()
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly subscriptionPaymentService: SubscriptionPaymentService,
  ) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get all available subscription plans' })
  @ApiResponse({ status: 200, description: 'List of subscription plans' })
  async getPlans() {
    return this.subscriptionService.getPlans();
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current tenant subscription' })
  @ApiResponse({ status: 200, description: 'Current subscription details' })
  async getCurrentSubscription(@CurrentUser() user: JwtPayload) {
    const subscription = await this.subscriptionService.getTenantSubscription(user.tenantId);
    const usage = await this.subscriptionService.getUsage(user.tenantId);
    const limits = await this.subscriptionService.getLimits(user.tenantId);

    return {
      subscription,
      usage,
      limits,
    };
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get current usage statistics' })
  @ApiResponse({ status: 200, description: 'Usage stats for tenant' })
  async getUsage(@CurrentUser() user: JwtPayload) {
    const [usage, limits] = await Promise.all([
      this.subscriptionService.getUsage(user.tenantId),
      this.subscriptionService.getLimits(user.tenantId),
    ]);

    return {
      usage,
      limits,
      percentages: {
        tables: limits.maxTables === -1 ? 0 : Math.round((usage.tablesUsed / limits.maxTables) * 100),
        menuItems: limits.maxMenuItems === -1 ? 0 : Math.round((usage.menuItemsUsed / limits.maxMenuItems) * 100),
        orders: limits.maxOrdersMonth === -1 ? 0 : Math.round((usage.ordersThisMonth / limits.maxOrdersMonth) * 100),
        staff: limits.maxStaff === -1 ? 0 : Math.round((usage.staffUsed / limits.maxStaff) * 100),
      },
    };
  }

  @Post('check-limit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if an action is allowed based on limits' })
  @ApiResponse({ status: 200, description: 'Limit check result' })
  async checkLimit(
    @CurrentUser() user: JwtPayload,
    @Body() body: { action: 'createTable' | 'createMenuItem' | 'createOrder' | 'inviteStaff' },
  ) {
    return this.subscriptionService.canPerformAction(user.tenantId, body.action);
  }

  @Post('upgrade')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Create subscription upgrade payment',
    description: 'Creates a SePay payment intent for subscription upgrade. Returns QR code for payment.',
  })
  @ApiResponse({ status: 200, description: 'Payment intent created', type: SubscriptionPaymentResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid upgrade request' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async createUpgradePayment(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateSubscriptionPaymentDto,
  ): Promise<SubscriptionPaymentResponseDto> {
    return this.subscriptionPaymentService.createUpgradePayment(
      user.tenantId,
      dto,
    );
  }

  @Get('upgrade/:paymentId/status')
  @ApiOperation({ 
    summary: 'Check subscription upgrade payment status',
    description: 'Polls SePay to check if payment was completed. If paid, automatically upgrades subscription.',
  })
  @ApiResponse({ status: 200, description: 'Payment status', type: SubscriptionPaymentStatusDto })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async checkUpgradePaymentStatus(
    @CurrentUser() user: JwtPayload,
    @Param('paymentId') paymentId: string,
  ): Promise<SubscriptionPaymentStatusDto> {
    return this.subscriptionPaymentService.checkUpgradePaymentStatus(
      user.tenantId,
      paymentId,
    );
  }
}
