import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MenuPhotoService } from '../services/mene-photo.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { TenantOwnershipGuard } from '@/modules/tenant/guards/tenant-ownership.guard';
import { MenuItemPhotoResponseDto, UpdatePhotoDto, UploadPhotoDto } from '../dto/menu-photo.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Menu - Photos')
@Controller('menu/items/:itemId/photos')
@UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
@ApiBearerAuth()
export class MenuPhotoController {
  constructor(private readonly photoService: MenuPhotoService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload photo for menu item' })
  @ApiBody({ type: UploadPhotoDto })
  @ApiResponse({ status: 201, type: MenuItemPhotoResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async uploadPhoto(
    @Param('itemId') itemId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MenuItemPhotoResponseDto> {
    if (!file) {
      throw new Error('File is required');
    }
    return this.photoService.uploadPhoto(itemId, file);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.STAFF, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Get all photos for menu item' })
  @ApiResponse({ status: 200, type: [MenuItemPhotoResponseDto] })
  async getPhotos(@Param('itemId') itemId: string): Promise<MenuItemPhotoResponseDto[]> {
    return this.photoService.getPhotos(itemId);
  }

  @Patch(':photoId/primary')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set photo as primary' })
  @ApiResponse({ status: 200, description: 'Primary photo updated' })
  async setPrimary(
    @Param('itemId') itemId: string,
    @Param('photoId') photoId: string,
  ): Promise<{ message: string }> {
    await this.photoService.setPrimaryPhoto(itemId, photoId);
    return { message: 'Primary photo updated successfully' };
  }

  @Patch(':photoId/order')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Update photo display order' })
  @ApiResponse({ status: 200 })
  async updateOrder(
    @Param('itemId') itemId: string,
    @Param('photoId') photoId: string,
    @Body() dto: UpdatePhotoDto,
  ): Promise<{ message: string }> {
    await this.photoService.updatePhotoOrder(itemId, photoId, dto.displayOrder!);
    return { message: 'Photo order updated' };
  }

  @Delete(':photoId')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete photo' })
  @ApiResponse({ status: 204 })
  async deletePhoto(
    @Param('itemId') itemId: string,
    @Param('photoId') photoId: string,
  ): Promise<void> {
    await this.photoService.deletePhoto(itemId, photoId);
  }
}
