import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateMenuItemDto,
  MenuItemFiltersDto,
  UpdateMenuItemDto,
} from '../dto/menu-item.dto';
import { MenuCategoryRepository } from '../repositories/menu-category.repository';
import { MenuItemsRepository } from '../repositories/menu-item.repository';
import { ErrorCode, ErrorMessages } from 'src/common/constants/error-codes.constant';

@Injectable()
export class MenuItemsService {
  constructor(
    private readonly menuItemRepo: MenuItemsRepository,
    private readonly menuCategoryRepo: MenuCategoryRepository,
  ) {}

  async create(tenantId: string, dto: CreateMenuItemDto) {
    /* create menu item for tenant:
      INSERT INTO MenuItems (name, ..., categoryId, ..., modifierGroupIds)
      VALUES (...)
      Vấn đề:
        1. Khoá ngoại đến category (id)
          {
            1. FE Tự lôi hết cate và map vào với id => khi chọn cate:name -> tự động map vào và chèn vào id
            2. BE quan tâm?
              - Name phải là unique
              - categoryId đó nó có thực sự tồn tại không? => cateRepo.findById().hasValue?
                  + If yep -> gắn vào
                  + If no -> báo lỗi
          }
        2. Chưa có modifier => thêm sau khi xây dựng xong
    */
    // Kiểm tra xem tên đã tồn tại chưa? => đã cài unique trong database rồi
    // Kiểm tra category có tồn tại không?
    const category = await this.menuCategoryRepo.findById(dto.categoryId);
    if (!category) {
      throw new NotFoundException(ErrorMessages[ErrorCode.MENU_CATEGORY_NOT_FOUND]);
    }

    // Create item
    return this.menuItemRepo.create({
      tenantId,
      name: dto.name,
      description: dto.description,
      categoryId: dto.categoryId,
      price: dto.price,
      imageUrl: dto.imageUrl,
      tags: dto.tags || [],
      allergens: dto.allergens || [],
      displayOrder: dto.displayOrder ?? 0,
      status: 'DRAFT',
      available: true,
    });
  }

  async findFiltered(tenantId: string, filters: MenuItemFiltersDto) {
    return this.menuItemRepo.findFiltered(tenantId, filters);
  }

  async findById(menuItemId: string) {
    const item = await this.menuItemRepo.findById(menuItemId);
    if (!item) {
      throw new NotFoundException(ErrorMessages[ErrorCode.MENU_ITEM_NOT_FOUND]);
    }
    return item;
  }

  async update(menuItemId: string, dto: UpdateMenuItemDto) {
    await this.findById(menuItemId);

    if (dto.categoryId) {
      await this.menuCategoryRepo.findById(dto.categoryId);
    }

    // Update item
    const updateData: any = {
      ...(dto.name && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.categoryId && { categoryId: dto.categoryId }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
      ...(dto.allergens !== undefined && { allergens: dto.allergens }),
      ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
      ...(dto.available !== undefined && { available: dto.available }),
    };

    return await this.menuItemRepo.update(menuItemId, updateData);
  }

  async delete(menuItemId: string) {
    await this.findById(menuItemId);
    return this.menuItemRepo.softDelete(menuItemId);
  }
}
