import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ErrorCode } from '../constants/error-codes.constant';

/**
 * Prisma Exception Filter
 * Converts Prisma errors to standardized API responses
 */
@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = ErrorCode.DATABASE_ERROR;
    let message = 'Database error occurred';
    let details: any = undefined;

    // Handle Prisma Known Request Errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const result = this.handleKnownError(exception);
      status = result.status;
      errorCode = result.errorCode;
      message = result.message;
      details = result.details;
    }

    // Handle Prisma Validation Errors
    if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      errorCode = ErrorCode.VALIDATION_FAILED;
      message = 'Invalid data provided';
      details = { validationError: exception.message };
    }

    // Log error
    this.logger.error(
      `Prisma Error: ${exception.code || 'VALIDATION'} - ${message}`,
      exception.stack,
    );

    // Send response
    response.status(status).json({
      success: false,
      error: {
        code: errorCode,
        message,
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }

  /**
   * Handle known Prisma errors
   * https://www.prisma.io/docs/reference/api-reference/error-reference
   */
  private handleKnownError(exception: Prisma.PrismaClientKnownRequestError) {
    const code = exception.code;
    const meta = exception.meta;

    switch (code) {
      // Unique constraint violation
      case 'P2002': {
        const target = meta?.target as string[] | undefined;
        const field = target?.[0] || 'field';

        return {
          status: HttpStatus.CONFLICT,
          errorCode: ErrorCode.VALIDATION_FAILED,
          message: `${this.formatField(field)} already exists`,
          details: { field, constraint: 'unique' },
        };
      }

      // Record not found
      case 'P2025': {
        return {
          status: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Record not found',
          details: { prismaCode: code },
        };
      }

      // Foreign key constraint violation
      case 'P2003': {
        const field = meta?.field_name as string | undefined;

        return {
          status: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.VALIDATION_FAILED,
          message: `Invalid reference: ${field || 'related record'} not found`,
          details: { field, constraint: 'foreign_key' },
        };
      }

      // Null constraint violation
      case 'P2011': {
        const target = meta?.target as string[] | undefined;
        const field = target?.[0] || 'field';

        return {
          status: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.VALIDATION_FIELD_REQUIRED,
          message: `${this.formatField(field)} is required`,
          details: { field, constraint: 'required' },
        };
      }

      // Invalid value
      case 'P2006':
      case 'P2007': {
        return {
          status: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.VALIDATION_FIELD_INVALID,
          message: 'Invalid value provided',
          details: { prismaCode: code },
        };
      }

      // Connection error
      case 'P1001':
      case 'P1002':
      case 'P1008': {
        return {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          errorCode: ErrorCode.DATABASE_ERROR,
          message: 'Database connection error',
          details: { prismaCode: code },
        };
      }

      // Default
      default: {
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: ErrorCode.DATABASE_ERROR,
          message: 'Database error occurred',
          details: { prismaCode: code },
        };
      }
    }
  }

  /**
   * Format field name for user-friendly messages
   * Examples: email -> Email, tenantId -> Tenant ID
   */
  private formatField(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
}
