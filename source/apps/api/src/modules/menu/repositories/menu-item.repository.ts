import { Injectable } from '@nestjs/common';
import { MenuItem, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { BaseRepository } from 'src/database/repositories/base.repository';
import { MenuItemFiltersDto } from '../dto/menu-item.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class MenuItemsRepository extends BaseRepository<MenuItem, Prisma.MenuItemDelegate> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.menuItem);
  }

  async findFiltered(tenantId: string, filters: MenuItemFiltersDto) {
    return this.findPaginated(new PaginationDto(filters.page, filters.limit), {
      where: {
        tenantId,
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.status && { status: filters.status }),
        // nếu filters.available == false -> để như dưới nó sẽ bỏ qua và không xử lý trường hợp false
        // ...(filters.available && { available: filters.available }),
        // => so sánh với undefined
        ...(filters.available != undefined && { available: filters.available }),
        // nếu để như dưới thì xử lý hơi hardcode => không biết search theo trường nào
        // ...(filters.search && { search: filters.search }),
        ...(filters.search && {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async softDelete(menuItemId: string) {
    return this.prisma.menuItem.update({
      where: { id: menuItemId },
      data: {
        status: 'ARCHIVED',
      },
    });
  }
}
