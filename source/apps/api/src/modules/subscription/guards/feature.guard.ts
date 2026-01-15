import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionService, SubscriptionLimits } from '../subscription.service';

// Feature keys
export type FeatureKey = keyof SubscriptionLimits['features'];

// Decorator to specify which feature to check
export const FEATURE_KEY = 'requiredFeature';
export const RequireFeature = (feature: FeatureKey) => SetMetadata(FEATURE_KEY, feature);

/**
 * Guard to check if tenant has access to a specific feature
 *
 * Usage:
 * @UseGuards(FeatureGuard)
 * @RequireFeature('analytics')
 * async getAnalytics() { ... }
 */
@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get the feature to check from decorator
    const feature = this.reflector.get<FeatureKey>(FEATURE_KEY, context.getHandler());

    if (!feature) {
      // No feature check required for this route
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    // Check if feature is available
    const hasFeature = await this.subscriptionService.hasFeature(user.tenantId, feature);

    if (!hasFeature) {
      throw new ForbiddenException({
        message: `The ${feature} feature is not available on your current plan. Please upgrade to access this feature.`,
        code: 'FEATURE_NOT_AVAILABLE',
        feature,
        upgradeRequired: true,
      });
    }

    return true;
  }
}
