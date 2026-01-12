import { Module } from '@nestjs/common';
import { MenuModule } from '../menu/menu.module';
import { CartController } from './controllers/cart.controllers';
import { CartService } from './services/cart.service';
import { TableModule } from '../table/table.module';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';
import { OrderGateway } from './gateways/order.gateway';

@Module({
  imports: [MenuModule, TableModule],
  controllers: [CartController, OrderController],
  providers: [
    // Services
    CartService,
    OrderService,
    // WebSocket Gateway
    OrderGateway,
  ],
  exports: [CartService, OrderService, OrderGateway],
})
export class OrderModule {}
