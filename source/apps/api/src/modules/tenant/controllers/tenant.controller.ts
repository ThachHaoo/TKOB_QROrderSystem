// src/modules/tenants/controllers/tenants.controller.ts

import { Controller, Get, Patch, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantService } from '../services/tenant.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateOpeningHoursDto } from '../dto/update-opening-hours.dto';
import { UpdateSettingsDto } from '../dto/update-settings.dto';
import { UserRole } from '@prisma/client';
import { UpdatePaymentConfigDto } from '../dto/update-payment-config.dto';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current tenant info' })
  async getCurrentTenant(@CurrentUser() user: any) {
    return this.tenantService.findById(user.tenantId);
  }

  @Patch('profile')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update tenant profile (Onboarding Step 1)' })
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.tenantService.updateProfile(user.tenantId, dto);
  }

  @Patch('opening-hours')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update opening hours (Onboarding Step 2)' })
  async updateOpeningHours(@CurrentUser() user: any, @Body() dto: UpdateOpeningHoursDto) {
    return this.tenantService.updateOpeningHours(user.tenantId, dto);
  }

  @Patch('settings')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update settings (Onboarding Step 3)' })
  async updateSettings(@CurrentUser() user: any, @Body() dto: UpdateSettingsDto) {
    return this.tenantService.updateSettings(user.tenantId, dto);
  }

  @Patch('payment-config')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update settings (Onboarding Step 4)' })
  async updatePaymentConfig(@CurrentUser() user: any, @Body() dto: UpdatePaymentConfigDto) {
    return this.tenantService.updatePaymentConfig(user.tenantId, dto);
  }

  @Post('complete-onboarding')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Complete onboarding' })
  async completeOnboarding(@CurrentUser() user: any) {
    return this.tenantService.completeOnboarding(user.tenantId);
  }
}
