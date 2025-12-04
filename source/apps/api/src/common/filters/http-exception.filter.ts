import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '../constants/error-codes.constant';

/**
 * Error response interface following OPENAPI.md spec
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path: string;
  method: string;
  requestId?: string;
}

/**
 * Global HTTP Exception Filter
 * Standardizes error responses across the application
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Extract error details
    const exceptionResponse = exception.getResponse();
    const errorCode = this.extractErrorCode(exceptionResponse);
    const message = this.extractMessage(exceptionResponse);
    const details = this.extractDetails(exceptionResponse);

    // Build standardized error response
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message,
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      requestId: request.headers['x-request-id'] as string,
    };

    // Log error (but not for client errors like 400, 404)
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        JSON.stringify(errorResponse),
        exception.stack,
      );
    } else if (status >= 400) {
      this.logger.warn(`${request.method} ${request.url}`, JSON.stringify(errorResponse));
    }

    response.status(status).json(errorResponse);
  }

  /**
   * Extract error code from exception response
   */
  private extractErrorCode(exceptionResponse: any): string {
    if (typeof exceptionResponse === 'object' && exceptionResponse.errorCode) {
      return exceptionResponse.errorCode;
    }

    // Fallback to generic error code
    return ErrorCode.INTERNAL_SERVER_ERROR;
  }

  /**
   * Extract message from exception response
   */
  private extractMessage(exceptionResponse: any): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (typeof exceptionResponse === 'object') {
      // Handle class-validator errors
      if (Array.isArray(exceptionResponse.message)) {
        return exceptionResponse.message.join(', ');
      }

      if (exceptionResponse.message) {
        return exceptionResponse.message;
      }
    }

    return 'An error occurred';
  }

  /**
   * Extract details from exception response
   */
  private extractDetails(exceptionResponse: any): any {
    if (typeof exceptionResponse === 'object') {
      const { errorCode, message, ...details } = exceptionResponse;

      // Only return details if there are additional fields
      if (Object.keys(details).length > 0) {
        return details;
      }
    }

    return undefined;
  }
}
