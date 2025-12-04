// apps/api/src/common/exceptions/business.exception.ts

import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ErrorMessages } from '../constants/error-codes.constant';

/**
 * Custom Business Exception
 * Use this for domain-specific errors
 */
export class BusinessException extends HttpException {
  constructor(
    public readonly errorCode: ErrorCode,
    message?: string,
    public readonly details?: any,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        errorCode,
        message: message || ErrorMessages[errorCode],
        details,
      },
      statusCode,
    );
  }
}

/**
 * Resource Not Found Exception
 */
export class ResourceNotFoundException extends BusinessException {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;

    super(
      ErrorCode.INTERNAL_SERVER_ERROR, // Will be overridden by specific codes
      message,
      { resource, identifier },
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Auth Exceptions
 */
export class InvalidCredentialsException extends BusinessException {
  constructor() {
    super(ErrorCode.AUTH_INVALID_CREDENTIALS, undefined, undefined, HttpStatus.UNAUTHORIZED);
  }
}

export class TokenExpiredException extends BusinessException {
  constructor() {
    super(ErrorCode.AUTH_TOKEN_EXPIRED, undefined, undefined, HttpStatus.UNAUTHORIZED);
  }
}

export class UnauthorizedException extends BusinessException {
  constructor(message?: string) {
    super(ErrorCode.AUTH_UNAUTHORIZED, message, undefined, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenException extends BusinessException {
  constructor(message?: string) {
    super(ErrorCode.AUTH_FORBIDDEN, message, undefined, HttpStatus.FORBIDDEN);
  }
}

/**
 * Validation Exception
 */
export class ValidationException extends BusinessException {
  constructor(errors: any) {
    super(ErrorCode.VALIDATION_FAILED, 'Validation failed', errors, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Conflict Exception (e.g., duplicate email)
 */
export class ConflictException extends BusinessException {
  constructor(message: string, details?: any) {
    super(ErrorCode.VALIDATION_FAILED, message, details, HttpStatus.CONFLICT);
  }
}
