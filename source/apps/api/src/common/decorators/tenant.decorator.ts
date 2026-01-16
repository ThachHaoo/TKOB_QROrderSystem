import { createParamDecorator } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from '../interfaces/auth.interface';

/**
 * Decorator to extract tenantId from authenticated user
 * 
 * This is a shorthand for accessing user.tenantId in controllers.
 * Requires JwtAuthGuard to be applied first.
 *
 * @example
 * ```typescript
 * @Get('data')
 * async getData(@GetTenant() tenantId: string) {
 *   return this.service.findByTenant(tenantId);
 * }
 * ```
 */
export const GetTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    
    if (!request.user?.tenantId) {
      throw new Error('Tenant context not found. Ensure JwtAuthGuard is applied.');
    }
    
    return request.user.tenantId;
  },
);
