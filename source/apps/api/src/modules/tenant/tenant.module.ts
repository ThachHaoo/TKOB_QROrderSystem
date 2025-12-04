import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TenantController } from './controllers/tenant.controller';
import { TenantService } from './services/tenant.service';
import { TenantOwnershipGuard } from './guards/tenant-ownership.guard';
import { TenantContextMiddleware } from 'src/common/middleware/tenant-context.middleware';
import { OnboardingService } from './services/onboarding.service';

@Module({
  controllers: [TenantController],
  providers: [TenantService, OnboardingService, TenantOwnershipGuard],
  exports: [TenantService],
})
export class TenantModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply TenantContextMiddleware to all tenant routes
    consumer
      .apply(TenantContextMiddleware)
      .forRoutes({ path: 'tenants/*', method: RequestMethod.ALL });
  }
}
