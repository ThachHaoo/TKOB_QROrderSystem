import { Module } from '@nestjs/common';
import { TenantController } from './controllers/tenant.controller';
import { TenantService } from './services/tenant.service';

@Module({
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
