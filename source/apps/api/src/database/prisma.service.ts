import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AsyncLocalStorage } from 'async_hooks'; // Built-in Node.js module
import { EnvConfig } from '../config/env.validation';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  // CORE: Sử dụng AsyncLocalStorage để lưu tenantId an toàn cho từng Request
  private readonly asyncLocalStorage = new AsyncLocalStorage<Map<string, string>>();

  private _extendedClient: ReturnType<typeof this.createExtendedClient>;

  constructor(private readonly configService: ConfigService<EnvConfig, true>) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });
  }

  // Getter để truy cập vào client đã được inject logic multi-tenant
  get x() {
    if (!this._extendedClient) {
      this._extendedClient = this.createExtendedClient();
    }
    return this._extendedClient;
  }

  async onModuleInit() {
    await this.$connect();

    // Logging setup (giữ nguyên logic của bạn)
    // @ts-expect-error Prisma type bug workaround
    this.$on('query', (e: any) => {
      if (process.env.NODE_ENV === 'development') {
        this.logger.debug(`Duration: ${e.duration}ms | Query: ${e.query}`);
      }
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // --- CONTEXT MANAGEMENT (Thread-safe) ---

  /**
   * Chạy một callback trong context của một tenant cụ thể.
   * Middleware/Guard sẽ gọi hàm này.
   */
  runWithTenantId<T>(tenantId: string, callback: () => T): T {
    const store = new Map<string, string>();
    store.set('tenantId', tenantId);
    // Mọi code chạy trong callback sẽ truy cập được đúng store này
    return this.asyncLocalStorage.run(store, callback);
  }

  getTenantId(): string | undefined {
    const store = this.asyncLocalStorage.getStore();
    return store?.get('tenantId');
  }

  // --- PRISMA EXTENSION (Thay thế Middleware $use) ---

  private createExtendedClient() {
    return this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            // 1. Lấy Tenant ID từ Async Context
            const tenantId = this.getTenantId();

            // Danh sách các bảng cần isolate
            const tenantModels = [
              'User',
              'Table',
              'MenuCategory',
              'MenuItem',
              'ModifierGroup',
              'ModifierOption',
              'Order',
              'OrderItem',
              'OrderActivityLog',
            ];

            // Nếu không có tenantId hoặc model không nằm trong danh sách -> chạy query gốc
            if (!tenantId || !tenantModels.includes(model as string)) {
              return query(args);
            }

            // 2. Inject Tenant ID vào args
            const _args = args as any; // Cast any để dễ thao tác object

            // Xử lý logic chèn tenantId tương tự middleware cũ
            if (
              [
                'findUnique',
                'findFirst',
                'findMany',
                'count',
                'aggregate',
                'update',
                'updateMany',
                'upsert',
                'delete',
                'deleteMany',
              ].includes(operation)
            ) {
              // Cẩn thận với findUnique: Prisma yêu cầu where của findUnique chỉ được chứa unique fields.
              // Nếu bạn chèn tenantId vào findUnique, nó sẽ biến thành findFirst (về mặt logic Prisma).
              // Ở đây ta xử lý đơn giản là merge vào where.

              _args.where = {
                ..._args.where,
                tenantId: tenantId,
              };
            }

            if (operation === 'create') {
              _args.data = {
                ..._args.data,
                tenantId: tenantId,
              };
            }

            // Note: Với createMany, args.data là array
            if (operation === 'createMany') {
              if (Array.isArray(_args.data)) {
                _args.data = _args.data.map((item: any) => ({ ...item, tenantId }));
              } else {
                _args.data = { ..._args.data, tenantId };
              }
            }

            // 3. Thực thi query với args đã sửa đổi
            return query(_args);
          },
        },
      },
    });
  }
}
