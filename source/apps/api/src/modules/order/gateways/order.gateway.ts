import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OrderResponseDto } from '../dtos/order-response.dto';
import { OrderEvents } from '../constants/events.constant';

/**
 * WebSocket Gateway for real-time order updates
 *
 * Room Strategy:
 * - `tenant:{tenantId}` - Staff/Kitchen join to receive all orders for their tenant
 * - `table:{tableId}` - Customer join to track their specific table's orders
 *
 * Events emitted:
 * - `order.new` - New order created (for KDS)
 * - `order.status_changed` - Order status updated (for customer tracking & KDS)
 */
@WebSocketGateway({
  namespace: '/orders',
  cors: {
    origin: '*', // Configure appropriately for production
    credentials: true,
  },
})
export class OrderGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(OrderGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log('OrderGateway initialized');
  }

  handleConnection(client: Socket) {
    const tenantId = client.handshake.query.tenantId as string;
    const tableId = client.handshake.query.tableId as string;

    if (tenantId) {
      void client.join(`tenant:${tenantId}`);
      this.logger.log(`Client ${client.id} joined tenant room: ${tenantId}`);
    }

    if (tableId) {
      void client.join(`table:${tableId}`);
      this.logger.log(`Client ${client.id} joined table room: ${tableId}`);
    }

    if (!tenantId && !tableId) {
      this.logger.warn(`Client ${client.id} connected without tenantId or tableId`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Emit when a new order is created
   * Sent to tenant room (for Staff/Kitchen KDS)
   */
  emitNewOrder(tenantId: string, order: OrderResponseDto): void {
    this.server.to(`tenant:${tenantId}`).emit(OrderEvents.NEW_ORDER, order);
    this.logger.log(`Emitted order.new for order ${order.orderNumber} to tenant:${tenantId}`);
  }

  /**
   * Emit when order status changes
   * Sent to both tenant room (KDS) and table room (customer tracking)
   */
  emitOrderStatusChanged(tenantId: string, order: OrderResponseDto): void {
    // Notify kitchen/staff dashboard
    this.server.to(`tenant:${tenantId}`).emit(OrderEvents.STATUS_CHANGED, order);

    // Notify customer on that table
    this.server.to(`table:${order.tableId}`).emit(OrderEvents.STATUS_CHANGED, order);

    this.logger.log(
      `Emitted order.status_changed for order ${order.orderNumber} ` +
        `(status: ${order.status}) to tenant:${tenantId} and table:${order.tableId}`,
    );
  }
}
