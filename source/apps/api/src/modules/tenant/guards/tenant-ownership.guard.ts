import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Tenant Ownership Guard
 * 
 * Purpose: Verify that the authenticated user has permission to access the tenant resource
 * 
 * Logic:
 * 1. Extract tenantId from route params (e.g., /tenants/:id)
 * 2. Compare with tenantId from JWT (req.user.tenantId)
 * 3. Block request if they don't match (user trying to access another tenant's data)
 * 
 * Usage: Apply to tenant-specific routes
 * @UseGuards(JwtAuthGuard, TenantOwnershipGuard)
 */

@Injectable()
export class TenantOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(TenantOwnershipGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    // Check if route has tenantId parameter
    if (!params.id) {
      this.logger.warn('TenantOwnershipGuard applied but no :id param found');
      return true; // Skip validation if no tenant ID in route
    }

    // Check if user context exists
    if (!user || !user.tenantId) {
      throw new ForbiddenException('User context not found');
    }

    // Verify ownership
    const requestedTenantId = params.id;
    const userTenantId = user.tenantId;

    if (requestedTenantId !== userTenantId) {
      this.logger.warn(
        `Tenant ownership violation: User ${user.userId} (tenant: ${userTenantId}) ` +
        `attempted to access tenant ${requestedTenantId}`,
      );
      throw new ForbiddenException('You do not have permission to access this tenant');
    }

    this.logger.debug(`Tenant ownership verified: ${userTenantId}`);
    return true;
  }
}