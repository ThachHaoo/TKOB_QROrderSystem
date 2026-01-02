import { Module } from '@nestjs/common';
import { MenuModule } from '../menu/menu.module';
import { CartController } from './controllers/cart.controllers';
import { CartService } from './services/cart.service';
import { TableModule } from '../table/table.module';

@Module({
  imports: [MenuModule, TableModule],
  controllers: [CartController],
  providers: [
    // Services
    CartService,
  ],
  exports: [CartService],
})
export class OrderModule {}
