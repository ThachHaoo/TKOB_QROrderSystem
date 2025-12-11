import { Module } from '@nestjs/common';
import { MenuCategoryController } from './controllers/menu-category.controller';
import { MenuCategoryService } from './services/menu-category.service';
import { MenuCategoryRepository } from './repositories/menu-category.repository';
import { MenuItemsService } from './services/menu-item.service';
import { MenuItemsRepository } from './repositories/menu-item.repository';
import { MenuItemsController } from './controllers/menu-item.controller';
import { ModifierGroupController } from './controllers/modifier-group.controller';
import { ModifierGroupService } from './services/modifier-group.service';
import { ModifierGroupRepository } from './repositories/modifier-group.repository';
import { PublicMenuController } from './controllers/public-menu.controller';

@Module({
  controllers: [
    MenuCategoryController,
    MenuItemsController,
    ModifierGroupController,
    PublicMenuController,
  ],
  providers: [
    // Services
    MenuCategoryService,
    MenuItemsService,
    ModifierGroupService,

    // Repository
    MenuCategoryRepository,
    MenuItemsRepository,
    ModifierGroupRepository,
  ],
  exports: [
    // Export services for use in other modules (e.g., Orders module)
  ],
})
export class MenuModule {}
