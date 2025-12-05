import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
import { TenantOwnershipGuard } from '../guards/tenant-ownership.guard';
import { TenantResponseDto } from '../dto/tenant-response.dto';
import { OnboardingService } from '../services/onboarding.service';

@ApiTags('Tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
@ApiBearerAuth()
export class TenantController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly onboardingService: OnboardingService,
  ) {}

  @Get('me')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get current tenant info' })
  @ApiResponse({
    status: 200,
    description: 'Tenant details retrieved',
    type: TenantResponseDto,
  })
  async getCurrentTenant(@CurrentUser() user: any) {
    return this.tenantService.getTenant(user.tenantId);
  }

  @Patch('profile')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update tenant profile (Onboarding Step 1)' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.onboardingService.updateProfile(user.tenantId, dto);
  }

  @Patch('opening-hours')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update opening hours (Onboarding Step 2)' })
  @ApiResponse({
    status: 200,
    description: 'Opening hours updated successfully',
    type: TenantResponseDto,
  })
  async updateOpeningHours(@CurrentUser() user: any, @Body() dto: UpdateOpeningHoursDto) {
    return this.onboardingService.updateOpeningHours(user.tenantId, dto);
  }

  @Patch('settings')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update settings (Onboarding Step 3)' })
  @ApiResponse({
    status: 200,
    description: 'Settings updated successfully',
    type: TenantResponseDto,
  })
  async updateSettings(@CurrentUser() user: any, @Body() dto: UpdateSettingsDto) {
    return this.onboardingService.updateSettings(user.tenantId, dto);
  }

  @Patch('payment-config')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update settings (Onboarding Step 4)' })
  @ApiResponse({
    status: 200,
    description: 'Payment config updated',
  })
  async updatePaymentConfig(@CurrentUser() user: any, @Body() dto: UpdatePaymentConfigDto) {
    return this.onboardingService.updatePaymentConfig(user.tenantId, dto);
  }

  @Post('complete-onboarding')
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete onboarding' })
  @ApiResponse({
    status: 200,
    description: 'Tenant activated successfully',
    type: TenantResponseDto,
  })
  async completeOnboarding(@CurrentUser() user: any) {
    return this.onboardingService.completeOnboarding(user.tenantId);
  }
}
