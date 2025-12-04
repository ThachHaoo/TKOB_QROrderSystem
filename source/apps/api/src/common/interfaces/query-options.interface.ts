/**
 * Common query options for list endpoints
 */
export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

/**
 * Prisma query options
 */
export interface PrismaQueryOptions {
  skip?: number;
  take?: number;
  orderBy?: any;
  where?: any;
  include?: any;
  select?: any;
}
