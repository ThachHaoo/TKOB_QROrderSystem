import { Injectable, Logger } from '@nestjs/common';
import { CartModifierDto, CartResponseDto } from '../dtos/cart.dto';
import { RedisService } from '@/modules/redis/redis.service';
import { PrismaService } from '@/database/prisma.service';

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers: CartModifierDto[];
  notes?: string;
  itemTotal: number;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  // private readonly TAX_RATE = 0.08;
  private readonly CART_TTL = 86400; // 24 hours

  constructor(
    private readonly redis: RedisService,
    private readonly prima: PrismaService,
  ) {}

  async getCart(sessionId: string): Promise<Cart> {
    const cartKey = `cart:${sessionId}`;
    const cartData = await this.redis.get(cartKey);

    if (!cartData) {
      return {
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
      };
    }

    return JSON.parse(cartData) as Cart;
  }

  // ==================== PRIVATE HELPERS ====================

  private toResponseDto(cart: Cart): CartResponseDto {
    return {
      items: cart.items.map((item) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        modifiers: item.modifiers,
        notes: item.notes,
        itemTotal: item.itemTotal,
      })),
      subtotal: Math.round(cart.subtotal),
      tax: Math.round(cart.tax),
      total: Math.round(cart.total),
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }
}
