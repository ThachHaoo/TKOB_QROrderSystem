import { Module } from '@nestjs/common';
import { MenuCategoryController } from './controllers/menu-category.controller';
import { MenuCategoryService } from './services/menu-category.service';
import { MenuCategoryRepository } from './repositories/menu-category.repository';
import { MenuItemsService } from './services/menu-item.service';
import { MenuItemsRepository } from './repositories/menu-item.repository';
import { MenuItemsController } from './controllers/menu-item.controller';

@Module({
  controllers: [MenuCategoryController, MenuItemsController],
  providers: [
    // Services
    MenuCategoryService,
    MenuItemsService,

    // Repository
    MenuCategoryRepository,
    MenuItemsRepository,
  ],
  exports: [
    // Export services for use in other modules (e.g., Orders module)
  ],
})
export class MenuModule {}
