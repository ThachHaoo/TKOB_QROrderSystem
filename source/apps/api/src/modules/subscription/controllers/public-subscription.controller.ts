import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { SubscriptionService } from '../subscription.service';
import { SubscriptionTier } from '@prisma/client';

/**
 * Public Subscription Controller
 * 
 * Provides public access to subscription plans for:
 * - Landing page pricing section
 * - Marketing materials
 * - Plan comparison pages
 * 
 * No authentication required for these endpoints.
 */
@ApiTags('Subscription - Public')
@Controller('subscription')
export class PublicSubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  @Public()
  @ApiOperation({ 
    summary: 'Get all available subscription plans (Public)',
    description: 'Public endpoint for landing page, pricing page, marketing materials. No authentication required.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of subscription plans with pricing and features',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          tier: { type: 'string', enum: ['FREE', 'BASIC', 'PREMIUM'] },
          name: { type: 'string' },
          description: { type: 'string' },
          priceUSD: { type: 'number' },
          priceVND: { type: 'number' },
          maxTables: { type: 'number', description: '-1 means unlimited' },
          maxMenuItems: { type: 'number', description: '-1 means unlimited' },
          maxOrdersMonth: { type: 'number', description: '-1 means unlimited' },
          maxStaff: { type: 'number', description: '-1 means unlimited' },
          features: { 
            type: 'object',
            description: 'Feature flags for this plan',
            additionalProperties: { type: 'boolean' }
          },
        },
      },
    },
  })
  async getPublicPlans() {
    return this.subscriptionService.getPlans();
  }

  @Get('plans/:tier')
  @Public()
  @ApiOperation({
    summary: 'Get a specific subscription plan by tier',
    description: 'Get detailed information about a specific plan. Useful for upgrade/compare flows.',
  })
  @ApiParam({
    name: 'tier',
    enum: ['FREE', 'BASIC', 'PREMIUM'],
    description: 'Subscription tier',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        tier: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        priceUSD: { type: 'number' },
        priceVND: { type: 'number' },
        maxTables: { type: 'number' },
        maxMenuItems: { type: 'number' },
        maxOrdersMonth: { type: 'number' },
        maxStaff: { type: 'number' },
        features: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async getPlanByTier(@Param('tier') tier: string) {
    // Validate tier
    const validTiers = Object.values(SubscriptionTier);
    const upperTier = tier.toUpperCase() as SubscriptionTier;
    
    if (!validTiers.includes(upperTier)) {
      throw new NotFoundException(`Plan tier '${tier}' not found. Valid tiers: ${validTiers.join(', ')}`);
    }

    const plans = await this.subscriptionService.getPlans();
    const plan = plans.find(p => p.tier === upperTier);
    
    if (!plan) {
      throw new NotFoundException(`Plan '${tier}' is not available`);
    }
    
    return plan;
  }

  @Get('features')
  @Public()
  @ApiOperation({
    summary: 'Get feature comparison matrix',
    description: 'Returns a comparison of features across all plans. Useful for pricing tables.',
  })
  @ApiResponse({
    status: 200,
    description: 'Feature comparison matrix',
    schema: {
      type: 'object',
      properties: {
        features: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              FREE: { type: 'boolean' },
              BASIC: { type: 'boolean' },
              PREMIUM: { type: 'boolean' },
            },
          },
        },
        limits: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              FREE: { type: 'string' },
              BASIC: { type: 'string' },
              PREMIUM: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getFeatureComparison() {
    const plans = await this.subscriptionService.getPlans();
    
    // Build feature comparison
    const featureKeys = ['analytics', 'promotions', 'customBranding', 'prioritySupport'];
    const featureDescriptions: Record<string, string> = {
      analytics: 'Advanced analytics and reporting',
      promotions: 'Create and manage promotion codes',
      customBranding: 'Custom branding and white-label',
      prioritySupport: '24/7 Priority support',
    };

    const features = featureKeys.map(key => {
      const result: Record<string, any> = {
        name: key,
        description: featureDescriptions[key] || key,
      };
      
      plans.forEach(plan => {
        result[plan.tier] = plan.features?.[key] ?? false;
      });
      
      return result;
    });

    // Build limits comparison
    const limitKeys = ['maxTables', 'maxMenuItems', 'maxOrdersMonth', 'maxStaff'];
    const limitLabels: Record<string, string> = {
      maxTables: 'Tables',
      maxMenuItems: 'Menu Items',
      maxOrdersMonth: 'Orders/Month',
      maxStaff: 'Staff Members',
    };

    const limits = limitKeys.map(key => {
      const result: Record<string, any> = {
        name: limitLabels[key] || key,
      };
      
      plans.forEach(plan => {
        const value = (plan as any)[key];
        result[plan.tier] = value === -1 ? 'Unlimited' : value.toString();
      });
      
      return result;
    });

    return {
      features,
      limits,
      plans: plans.map(p => ({
        tier: p.tier,
        name: p.name,
        priceUSD: p.priceUSD,
        priceVND: p.priceVND,
        description: p.description,
      })),
    };
  }
}
