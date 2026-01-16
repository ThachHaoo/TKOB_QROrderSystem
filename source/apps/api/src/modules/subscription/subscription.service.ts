import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubscriptionTier, SubscriptionStatus, Prisma } from '@prisma/client';

// Types for subscription limits
export interface SubscriptionLimits {
  maxTables: number;
  maxMenuItems: number;
  maxOrdersMonth: number;
  maxStaff: number;
  features: {
    analytics: boolean;
    promotions: boolean;
    customBranding: boolean;
    prioritySupport: boolean;
  };
}

export interface UsageStats {
  tablesUsed: number;
  menuItemsUsed: number;
  ordersThisMonth: number;
  staffUsed: number;
}

export interface SubscriptionWithPlan {
  id: string;
  tenantId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date | null;
  ordersThisMonth: number;
  plan: {
    id: string;
    tier: SubscriptionTier;
    name: string;
    priceUSD: number;
    priceVND: number;
    maxTables: number;
    maxMenuItems: number;
    maxOrdersMonth: number;
    maxStaff: number;
    features: Record<string, boolean>;
  };
}

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all available subscription plans
   */
  async getPlans() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceUSD: 'asc' },
    });

    return plans.map((plan) => ({
      id: plan.id,
      tier: plan.tier,
      name: plan.name,
      description: plan.description,
      priceUSD: Number(plan.priceUSD),
      priceVND: Number(plan.priceVND),
      maxTables: plan.maxTables,
      maxMenuItems: plan.maxMenuItems,
      maxOrdersMonth: plan.maxOrdersMonth,
      maxStaff: plan.maxStaff,
      features: plan.features as Record<string, boolean>,
    }));
  }

  /**
   * Get tenant's current subscription
   */
  async getTenantSubscription(tenantId: string): Promise<SubscriptionWithPlan | null> {
    const subscription = await this.prisma.tenantSubscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription) {
      return null;
    }

    return {
      id: subscription.id,
      tenantId: subscription.tenantId,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      ordersThisMonth: subscription.ordersThisMonth,
      plan: {
        id: subscription.plan.id,
        tier: subscription.plan.tier,
        name: subscription.plan.name,
        priceUSD: Number(subscription.plan.priceUSD),
        priceVND: Number(subscription.plan.priceVND),
        maxTables: subscription.plan.maxTables,
        maxMenuItems: subscription.plan.maxMenuItems,
        maxOrdersMonth: subscription.plan.maxOrdersMonth,
        maxStaff: subscription.plan.maxStaff,
        features: subscription.plan.features as Record<string, boolean>,
      },
    };
  }

  /**
   * Get subscription limits for a tenant
   */
  async getLimits(tenantId: string): Promise<SubscriptionLimits> {
    const subscription = await this.getTenantSubscription(tenantId);

    if (!subscription) {
      // Return FREE tier defaults if no subscription
      return this.getFreeTierLimits();
    }

    const features = subscription.plan.features || {};

    return {
      maxTables: subscription.plan.maxTables,
      maxMenuItems: subscription.plan.maxMenuItems,
      maxOrdersMonth: subscription.plan.maxOrdersMonth,
      maxStaff: subscription.plan.maxStaff,
      features: {
        analytics: features.analytics ?? false,
        promotions: features.promotions ?? false,
        customBranding: features.customBranding ?? false,
        prioritySupport: features.prioritySupport ?? false,
      },
    };
  }

  /**
   * Get current usage stats for a tenant
   */
  async getUsage(tenantId: string): Promise<UsageStats> {
    const [tablesCount, menuItemsCount, staffCount, subscription] = await Promise.all([
      this.prisma.table.count({ where: { tenantId, status: { not: 'INACTIVE' } } }),
      this.prisma.menuItem.count({ where: { tenantId, status: { not: 'ARCHIVED' } } }),
      this.prisma.user.count({ where: { tenantId, status: 'ACTIVE' } }),
      this.prisma.tenantSubscription.findUnique({ where: { tenantId } }),
    ]);

    return {
      tablesUsed: tablesCount,
      menuItemsUsed: menuItemsCount,
      ordersThisMonth: subscription?.ordersThisMonth ?? 0,
      staffUsed: staffCount,
    };
  }

  /**
   * Check if tenant can perform an action based on limits
   */
  async canPerformAction(
    tenantId: string,
    action: 'createTable' | 'createMenuItem' | 'createOrder' | 'inviteStaff',
  ): Promise<{ allowed: boolean; reason?: string; currentUsage?: number; limit?: number }> {
    const [limits, usage] = await Promise.all([
      this.getLimits(tenantId),
      this.getUsage(tenantId),
    ]);

    switch (action) {
      case 'createTable':
        if (limits.maxTables !== -1 && usage.tablesUsed >= limits.maxTables) {
          return {
            allowed: false,
            reason: `You have reached the maximum number of tables (${limits.maxTables}) for your plan. Please upgrade to add more tables.`,
            currentUsage: usage.tablesUsed,
            limit: limits.maxTables,
          };
        }
        break;

      case 'createMenuItem':
        if (limits.maxMenuItems !== -1 && usage.menuItemsUsed >= limits.maxMenuItems) {
          return {
            allowed: false,
            reason: `You have reached the maximum number of menu items (${limits.maxMenuItems}) for your plan. Please upgrade to add more items.`,
            currentUsage: usage.menuItemsUsed,
            limit: limits.maxMenuItems,
          };
        }
        break;

      case 'createOrder':
        if (limits.maxOrdersMonth !== -1 && usage.ordersThisMonth >= limits.maxOrdersMonth) {
          return {
            allowed: false,
            reason: `You have reached the maximum number of orders (${limits.maxOrdersMonth}/month) for your plan. Please upgrade to continue receiving orders.`,
            currentUsage: usage.ordersThisMonth,
            limit: limits.maxOrdersMonth,
          };
        }
        break;

      case 'inviteStaff':
        if (limits.maxStaff !== -1 && usage.staffUsed >= limits.maxStaff) {
          return {
            allowed: false,
            reason: `You have reached the maximum number of staff members (${limits.maxStaff}) for your plan. Please upgrade to invite more staff.`,
            currentUsage: usage.staffUsed,
            limit: limits.maxStaff,
          };
        }
        break;
    }

    return { allowed: true };
  }

  /**
   * Increment order count for the month
   */
  async incrementOrderCount(tenantId: string): Promise<void> {
    // First, check if we need to reset the monthly count
    const subscription = await this.prisma.tenantSubscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      this.logger.warn(`No subscription found for tenant ${tenantId}`);
      return;
    }

    const now = new Date();
    const resetDate = new Date(subscription.usageResetAt);
    const daysSinceReset = Math.floor(
      (now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Reset if more than 30 days since last reset
    if (daysSinceReset >= 30) {
      await this.prisma.tenantSubscription.update({
        where: { tenantId },
        data: {
          ordersThisMonth: 1,
          usageResetAt: now,
        },
      });
    } else {
      await this.prisma.tenantSubscription.update({
        where: { tenantId },
        data: {
          ordersThisMonth: { increment: 1 },
        },
      });
    }
  }

  /**
   * Create FREE subscription for new tenant
   */
  async createFreeSubscription(tenantId: string): Promise<void> {
    // Get FREE plan
    const freePlan = await this.prisma.subscriptionPlan.findUnique({
      where: { tier: SubscriptionTier.FREE },
    });

    if (!freePlan) {
      this.logger.error('FREE plan not found in database. Run seed script first.');
      throw new NotFoundException('FREE plan not configured');
    }

    // Create subscription
    await this.prisma.tenantSubscription.create({
      data: {
        tenantId,
        planId: freePlan.id,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: null, // FREE never expires
        ordersThisMonth: 0,
        usageResetAt: new Date(),
      },
    });

    this.logger.log(`Created FREE subscription for tenant ${tenantId}`);
  }

  /**
   * Upgrade tenant to a new plan
   */
  async upgradePlan(
    tenantId: string,
    newTier: SubscriptionTier,
    paymentId?: string,
  ): Promise<SubscriptionWithPlan> {
    // Get new plan
    const newPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { tier: newTier },
    });

    if (!newPlan) {
      throw new NotFoundException(`Plan ${newTier} not found`);
    }

    // Get current subscription
    const currentSub = await this.prisma.tenantSubscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!currentSub) {
      throw new NotFoundException('No subscription found for tenant');
    }

    // Prevent downgrade via this method (use different flow)
    if (newPlan.priceUSD < currentSub.plan.priceUSD) {
      throw new BadRequestException('Use downgrade flow for plan downgrades');
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 30); // 30 days from now

    // Update subscription
    const updated = await this.prisma.tenantSubscription.update({
      where: { tenantId },
      data: {
        planId: newPlan.id,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: now,
        currentPeriodEnd: newTier === SubscriptionTier.FREE ? null : periodEnd,
        lastPaymentId: paymentId,
      },
      include: { plan: true },
    });

    this.logger.log(`Tenant ${tenantId} upgraded to ${newTier} plan`);

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      status: updated.status,
      currentPeriodStart: updated.currentPeriodStart,
      currentPeriodEnd: updated.currentPeriodEnd,
      ordersThisMonth: updated.ordersThisMonth,
      plan: {
        id: updated.plan.id,
        tier: updated.plan.tier,
        name: updated.plan.name,
        priceUSD: Number(updated.plan.priceUSD),
        priceVND: Number(updated.plan.priceVND),
        maxTables: updated.plan.maxTables,
        maxMenuItems: updated.plan.maxMenuItems,
        maxOrdersMonth: updated.plan.maxOrdersMonth,
        maxStaff: updated.plan.maxStaff,
        features: updated.plan.features as Record<string, boolean>,
      },
    };
  }

  /**
   * Check if tenant has access to a feature
   */
  async hasFeature(tenantId: string, feature: keyof SubscriptionLimits['features']): Promise<boolean> {
    const limits = await this.getLimits(tenantId);
    return limits.features[feature] ?? false;
  }

  /**
   * Get FREE tier default limits
   */
  private getFreeTierLimits(): SubscriptionLimits {
    return {
      maxTables: 1,
      maxMenuItems: 10,
      maxOrdersMonth: 100,
      maxStaff: 1,
      features: {
        analytics: false,
        promotions: false,
        customBranding: false,
        prioritySupport: false,
      },
    };
  }
}
