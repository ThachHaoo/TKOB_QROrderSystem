import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

/**
 * Success response interface following OPENAPI.md spec
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
  path: string;
  method: string;
  requestId?: string;
}

/**
 * Decorator to skip response transformation
 * Usage: @SkipTransform() on controller method
 */
import { SetMetadata } from '@nestjs/common';
export const SKIP_TRANSFORM_KEY = 'skipTransform';
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);

/**
 * Transform Response Interceptor
 * Wraps successful responses in a standardized format
 * 
 * Can be used globally (new TransformInterceptor()) or with DI
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  private readonly reflector: Reflector;

  constructor(reflector?: Reflector) {
    // Allow usage without DI (for global interceptors in main.ts)
    this.reflector = reflector || new Reflector();
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    // Check if we should skip transformation (for redirects, NO_CONTENT, etc.)
    const skipTransform = this.reflector.get<boolean>(
      SKIP_TRANSFORM_KEY,
      context.getHandler(),
    );

    if (skipTransform) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        success: true as const,
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        requestId: request.headers['x-request-id'] as string,
      })),
    );
  }
}
