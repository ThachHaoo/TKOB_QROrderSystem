import { ApiProperty } from '@nestjs/swagger';
import { ErrorCode } from '../constants/error-codes.constant';

/**
 * Standard Error Response DTO (for Swagger documentation)
 */
export class ErrorResponseDto {
  @ApiProperty({ default: false })
  success: false;

  @ApiProperty({
    type: 'object',
    properties: {
      code: { type: 'string', example: 'AUTH_INVALID_CREDENTIALS' },
      message: { type: 'string', example: 'Invalid email or password' },
      details: { type: 'object', nullable: true, additionalProperties: true },
    },
  })
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
  };

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/v1/auth/login' })
  path: string;

  @ApiProperty({ example: 'POST' })
  method: string;

  @ApiProperty({ example: 'req-123', required: false })
  requestId?: string;
}
