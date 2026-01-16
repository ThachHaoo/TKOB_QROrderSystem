import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../modules/redis/redis.service';
import { SkipTransform } from '../interceptors/transform.interceptor';

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: {
      status: 'up' | 'down';
      latency?: number;
    };
    redis: {
      status: 'up' | 'down';
      latency?: number;
    };
  };
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly startTime: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    this.startTime = Date.now();
  }

  @Get()
  @SkipTransform()
  @ApiOperation({ 
    summary: 'Basic health check',
    description: 'Returns 200 if the server is running. Used by load balancers and monitoring tools.',
  })
  @ApiResponse({ status: 200, description: 'Server is healthy' })
  async basicHealth(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('detailed')
  @SkipTransform()
  @ApiOperation({ 
    summary: 'Detailed health check',
    description: 'Returns detailed health status including database and Redis connectivity.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Detailed health information',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
        timestamp: { type: 'string' },
        version: { type: 'string' },
        uptime: { type: 'number' },
        services: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['up', 'down'] },
                latency: { type: 'number' },
              },
            },
            redis: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['up', 'down'] },
                latency: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  async detailedHealth(): Promise<HealthCheckResponse> {
    const dbHealth = await this.checkDatabase();
    const redisHealth = await this.checkRedis();

    const allHealthy = dbHealth.status === 'up' && redisHealth.status === 'up';
    const allDown = dbHealth.status === 'down' && redisHealth.status === 'down';

    return {
      status: allHealthy ? 'healthy' : allDown ? 'unhealthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      services: {
        database: dbHealth,
        redis: redisHealth,
      },
    };
  }

  @Get('ready')
  @SkipTransform()
  @ApiOperation({ 
    summary: 'Readiness check',
    description: 'Returns 200 if the server is ready to accept traffic (DB and Redis are connected).',
  })
  @ApiResponse({ status: 200, description: 'Server is ready' })
  @ApiResponse({ status: 503, description: 'Server is not ready' })
  async readinessCheck(): Promise<{ ready: boolean; checks: Record<string, boolean> }> {
    const dbReady = await this.checkDatabase().then(r => r.status === 'up');
    const redisReady = await this.checkRedis().then(r => r.status === 'up');

    const ready = dbReady && redisReady;

    return {
      ready,
      checks: {
        database: dbReady,
        redis: redisReady,
      },
    };
  }

  @Get('live')
  @SkipTransform()
  @ApiOperation({ 
    summary: 'Liveness check',
    description: 'Returns 200 if the server process is running. Used by Kubernetes liveness probes.',
  })
  @ApiResponse({ status: 200, description: 'Server is alive' })
  async livenessCheck(): Promise<{ alive: boolean; timestamp: string }> {
    return {
      alive: true,
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<{ status: 'up' | 'down'; latency?: number }> {
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      return { status: 'up', latency };
    } catch (error) {
      return { status: 'down' };
    }
  }

  private async checkRedis(): Promise<{ status: 'up' | 'down'; latency?: number }> {
    try {
      const start = Date.now();
      const client = this.redis.getClient();
      await client.ping();
      const latency = Date.now() - start;
      return { status: 'up', latency };
    } catch (error) {
      return { status: 'down' };
    }
  }
}
