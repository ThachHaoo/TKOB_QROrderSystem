import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SeedModule } from './seed/seed.module';

/**
 * @Global() decorator makes this module global-scoped.
 * Once imported into the AppModule, PrismaService will be available
 * everywhere without needing to import PrismaModule in feature modules.
 */
@Global()
@Module({
  imports: [SeedModule], // Import SeedModule
  providers: [PrismaService],
  exports: [PrismaService, SeedModule], // Export SeedModule thay vì SeedService
})
export class PrismaModule {}
