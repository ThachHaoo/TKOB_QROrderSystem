import { Injectable } from '@nestjs/common';
import { MenuItem, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { BaseRepository } from 'src/database/repositories/base.repository';

@Injectable()
export class MenuItemsRepository extends BaseRepository<MenuItem, Prisma.MenuItemDelegate> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.menuItem);
  }
}
