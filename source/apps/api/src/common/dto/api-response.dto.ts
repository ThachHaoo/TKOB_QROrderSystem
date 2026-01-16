import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Standard Success Response DTO (for Swagger documentation)
 * All successful API responses follow this structure
 */
export class SuccessResponseDto<T> {
  @ApiProperty({ default: true })
  success: true;

  @ApiProperty({ description: 'Response data' })
  data: T;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/v1/some-endpoint' })
  path: string;

  @ApiProperty({ example: 'GET' })
  method: string;

  @ApiPropertyOptional({ example: 'req-123' })
  requestId?: string;
}

/**
 * Generic wrapper for API responses
 * Use this to type your controller responses
 */
export type ApiResponse<T> = {
  success: true;
  data: T;
  timestamp: string;
  path: string;
  method: string;
  requestId?: string;
};

/**
 * Pagination metadata interface
 */
export interface PaginationMetadata {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated Success Response DTO
 */
export class PaginatedSuccessResponseDto<T> {
  @ApiProperty({ default: true })
  success: true;

  @ApiProperty({ description: 'Paginated response data' })
  data: {
    items: T[];
    meta: PaginationMetadata;
  };

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/v1/some-endpoint' })
  path: string;

  @ApiProperty({ example: 'GET' })
  method: string;

  @ApiPropertyOptional({ example: 'req-123' })
  requestId?: string;
}

/**
 * Message-only response (for simple confirmations)
 */
export class MessageResponseDto {
  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;
}

/**
 * Count response (for delete/update operations)
 */
export class CountResponseDto {
  @ApiProperty({ example: 5, description: 'Number of affected records' })
  count: number;
}

/**
 * ID response (for create operations)
 */
export class IdResponseDto {
  @ApiProperty({ example: 'uuid-here', description: 'Created resource ID' })
  id: string;
}
