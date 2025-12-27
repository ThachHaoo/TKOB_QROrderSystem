import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { MenuModule } from '@/modules/menu/menu.module'; // Add this
import { UnsplashService } from './unplash.service';

@Module({
  imports: [MenuModule], // Import MenuModule to access MenuPhotoService
  providers: [SeedService, UnsplashService],
  exports: [SeedService],
})
export class SeedModule {}
