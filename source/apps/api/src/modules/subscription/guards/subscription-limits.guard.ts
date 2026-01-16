import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionService } from '../subscription.service';

// Define the limit check types
export type LimitAction = 'createTable' | 'createMenuItem' | 'createOrder' | 'inviteStaff';

// Decorator to specify which limit to check
export const LIMIT_ACTION_KEY = 'limitAction';
export const CheckLimit = (action: LimitAction) => SetMetadata(LIMIT_ACTION_KEY, action);

/**
 * Guard to check subscription limits before allowing certain actions
 *
 * Usage:
 * @UseGuards(SubscriptionLimitsGuard)
 * @CheckLimit('createTable')
 * async createTable() { ... }
 */
@Injectable()
export class SubscriptionLimitsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get the action to check from decorator
    const action = this.reflector.get<LimitAction>(LIMIT_ACTION_KEY, context.getHandler());

    if (!action) {
      // No limit check required for this route
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    // Check if action is allowed
    const result = await this.subscriptionService.canPerformAction(user.tenantId, action);

    if (!result.allowed) {
      throw new ForbiddenException({
        message: result.reason,
        code: 'SUBSCRIPTION_LIMIT_EXCEEDED',
        currentUsage: result.currentUsage,
        limit: result.limit,
        upgradeRequired: true,
      });
    }

    return true;
  }
}
