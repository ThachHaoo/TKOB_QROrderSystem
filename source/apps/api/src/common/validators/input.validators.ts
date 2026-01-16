/**
 * Input Validation Utilities
 * Common validation functions and decorators
 */

import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { applyDecorators } from '@nestjs/common';

/**
 * Validate Vietnamese phone number
 */
export function IsVietnamesePhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isVietnamesePhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          // Vietnamese phone: 10 digits starting with 0
          // Or international format: +84 followed by 9 digits
          return /^(0[1-9][0-9]{8}|\+84[1-9][0-9]{8})$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Số điện thoại không hợp lệ. VD: 0912345678 hoặc +84912345678';
        },
      },
    });
  };
}

/**
 * Validate safe string (no dangerous characters)
 */
export function IsSafeString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSafeString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          // Disallow: <, >, script, javascript:, on* handlers
          const dangerous = /<|>|<script|javascript:|onerror|onclick|onload/i;
          return !dangerous.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} chứa ký tự không được phép`;
        },
      },
    });
  };
}

/**
 * Validate slug format (URL-friendly)
 */
export function IsSlug(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSlug',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          // Lowercase letters, numbers, hyphens only
          return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} chỉ được chứa chữ thường, số và dấu gạch ngang`;
        },
      },
    });
  };
}

/**
 * Validate promotion code format
 */
export function IsPromoCode(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPromoCode',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          // Uppercase letters, numbers, max 20 chars
          return /^[A-Z0-9]{3,20}$/.test(value.toUpperCase());
        },
        defaultMessage(args: ValidationArguments) {
          return 'Mã giảm giá phải từ 3-20 ký tự, chỉ chứa chữ và số';
        },
      },
    });
  };
}

/**
 * Composite decorator for name fields
 */
export function IsValidName(minLength = 2, maxLength = 100) {
  return applyDecorators(
    IsString(),
    IsNotEmpty(),
    MinLength(minLength),
    MaxLength(maxLength),
    IsSafeString(),
  );
}

/**
 * Composite decorator for description fields
 */
export function IsValidDescription(maxLength = 1000) {
  return applyDecorators(
    IsString(),
    MaxLength(maxLength),
    IsSafeString(),
  );
}

/**
 * Sanitize string input (remove dangerous content)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Validate UUID format
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}
