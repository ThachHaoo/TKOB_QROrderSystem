/**
 * Rate Limiting Guard
 * Protects endpoints from abuse using Redis-based rate limiting
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../../modules/redis/redis.service';

// Decorator to set rate limit config
export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitConfig {
  points: number; // Number of requests
  duration: number; // Time window in seconds
  keyPrefix?: string; // Custom key prefix
  errorMessage?: string;
}

export const RateLimit = (config: RateLimitConfig) =>
  SetMetadata(RATE_LIMIT_KEY, config);

// Default configs for different endpoint types
export const RATE_LIMITS = {
  // Very strict: Auth endpoints
  AUTH: { points: 5, duration: 60 }, // 5 requests per minute

  // Strict: Payment endpoints
  PAYMENT: { points: 10, duration: 60 }, // 10 per minute

  // Moderate: Order creation
  ORDER: { points: 30, duration: 60 }, // 30 per minute

  // Standard: Read endpoints
  READ: { points: 100, duration: 60 }, // 100 per minute

  // Relaxed: Public menu/info
  PUBLIC: { points: 200, duration: 60 }, // 200 per minute
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get config from decorator or use default
    const config = this.reflector.get<RateLimitConfig>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    // Skip if no rate limit configured
    if (!config) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const key = this.generateKey(request, config.keyPrefix);

    try {
      const current = await this.redisService.get(key);
      const count = current ? parseInt(current, 10) : 0;

      if (count >= config.points) {
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: config.errorMessage || 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
            error: 'Too Many Requests',
            retryAfter: config.duration,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Increment counter
      if (count === 0) {
        await this.redisService.set(key, '1', config.duration);
      } else {
        await this.redisService.incr(key);
      }

      // Set rate limit headers
      const response = context.switchToHttp().getResponse();
      response.setHeader('X-RateLimit-Limit', config.points);
      response.setHeader('X-RateLimit-Remaining', Math.max(0, config.points - count - 1));

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // On Redis error, allow request (fail open)
      console.error('Rate limit check failed:', error);
      return true;
    }
  }

  private generateKey(request: any, prefix?: string): string {
    // Use IP + User ID (if authenticated) + endpoint
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    const userId = request.user?.id || 'anon';
    const endpoint = `${request.method}:${request.path}`;
    const keyPrefix = prefix || 'rl';

    return `${keyPrefix}:${ip}:${userId}:${endpoint}`;
  }
}
