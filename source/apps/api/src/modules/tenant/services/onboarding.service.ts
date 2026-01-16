import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { TenantService } from './tenant.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateOpeningHoursDto } from '../dto/update-opening-hours.dto';
import { UpdateSettingsDto } from '../dto/update-settings.dto';
import { PaymentConfigService } from '../../payment-config/payment-config.service';
import { UpdatePaymentConfigDto } from '../../payment-config/dto/payment-config.dto';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
    private readonly paymentConfigService: PaymentConfigService,
  ) {}

  /**
   * Step 1: Update profile
   */
  async updateProfile(tenantId: string, dto: UpdateProfileDto) {
    // Check slug availability
    if (dto.slug) {
      const isAvailable = await this.tenantService.isSlugAvailable(dto.slug, tenantId);

      if (!isAvailable) {
        throw new ConflictException('Slug already taken');
      }
    }

    const tenant = await this.tenantService.getTenant(tenantId);

    try {
      const updated = await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          name: dto.name ?? tenant.name,
          slug: dto.slug ?? tenant.slug,
          settings: {
            ...(tenant.settings as object),
            description: dto.description,
            phone: dto.phone,
            address: dto.address,
            logoUrl: dto.logoUrl,
          },
          onboardingStep: tenant.onboardingStep < 2 ? 2 : tenant.onboardingStep,
        },
      });

      this.logger.log(`Tenant profile updated: ${tenantId} (Step 1)`);
      return updated;
    } catch (error) {
      this.logger.error('Failed to update tenant profile', error);
      throw new BadRequestException('Failed to update tenant profile');
    }
  }

  /**
   * Step 2: Update opening hours
   */
  async updateOpeningHours(tenantId: string, dto: UpdateOpeningHoursDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Merge new opening hours with existing ones
    const currentHours = (tenant.openingHours as any) || {};
    const updatedHours = {
      ...currentHours,
      ...dto,
    };

    try {
      const updated = await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          openingHours: updatedHours,
          // Automatically advance onboarding step if this is the first time setting hours
          onboardingStep: tenant.onboardingStep < 3 ? 3 : tenant.onboardingStep,
        },
      });

      this.logger.log(`Opening hours updated: ${tenantId}`);
      return updated;
    } catch (error) {
      this.logger.error('Failed to update opening hours', error);
      throw new BadRequestException('Failed to update opening hours');
    }
  }

  /**
   * Step 3: Update settings (includes tax, service charge, tip config)
   */
  async updateSettings(tenantId: string, dto: UpdateSettingsDto) {
    const tenant = await this.tenantService.getTenant(tenantId);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const currentSettings = (tenant.settings as Record<string, any>) || {};

    // Build updated settings, preserving existing values
    const updatedSettings: Record<string, any> = {
      ...currentSettings,
      ...(dto.language && { language: dto.language }),
      ...(dto.timezone && { timezone: dto.timezone }),
      ...(dto.currency && { currency: dto.currency }),
    };

    // Update tax settings if provided
    if (dto.tax) {
      updatedSettings.tax = {
        ...currentSettings.tax,
        ...dto.tax,
      };
    }

    // Update service charge settings if provided
    if (dto.serviceCharge) {
      updatedSettings.serviceCharge = {
        ...currentSettings.serviceCharge,
        ...dto.serviceCharge,
      };
    }

    // Update tip settings if provided
    if (dto.tip) {
      updatedSettings.tip = {
        ...currentSettings.tip,
        ...dto.tip,
      };
    }

    try {
      const updated = await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          settings: updatedSettings,
          onboardingStep: tenant.onboardingStep < 4 ? 4 : tenant.onboardingStep,
        },
      });

      this.logger.log(`Tenant settings updated: ${tenantId} (Step 3)`);
      return updated;
    } catch (error) {
      this.logger.error('Failed to update tenant settings', error);
      throw new BadRequestException('Failed to update tenant settings');
    }
  }

  /**
   * Step 4: Configure payment (SePay integration)
   */
  async updatePaymentConfig(tenantId: string, dto: UpdatePaymentConfigDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    try {
      // Use PaymentConfigService to update (handles encryption)
      const config = await this.paymentConfigService.updateConfig(tenantId, dto);

      // Advance onboarding step
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          onboardingStep: Math.max(tenant.onboardingStep, 4),
        },
      });

      this.logger.log(`Payment config updated: ${tenantId}`);
      return config;
    } catch (error) {
      this.logger.error('Failed to update payment config', error);
      throw new BadRequestException('Failed to update payment config');
    }
  }

  /**
   * Complete onboarding
   * Note: Frontend has 3 steps (Profile, Hours, Review)
   * We allow completion after step 2 (hours set)
   */
  async completeOnboarding(tenantId: string) {
    const tenant = await this.tenantService.getTenant(tenantId);

    // Allow completion if at least profile and hours are set (step >= 2)
    if (tenant.onboardingStep < 2) {
      throw new ForbiddenException('Please complete all onboarding steps first');
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        onboardingStep: 5, // Mark as fully complete
        status: 'ACTIVE',
      },
    });

    this.logger.log(`Tenant onboarding completed: ${tenantId}`);

    return {
      message: 'Onboarding completed successfully',
      onboardingStep: updated.onboardingStep,
      completedAt: updated.updatedAt,
    };
  }

  /**
   * Get onboarding progress
   */
  async getProgress(tenantId: string) {
    const tenant = await this.tenantService.getTenant(tenantId);

    const steps = [
      {
        step: 1,
        name: 'Profile Setup',
        completed: tenant.onboardingStep >= 2,
        description: 'Add restaurant name, description, and logo',
      },
      {
        step: 2,
        name: 'Opening Hours',
        completed: tenant.onboardingStep >= 3,
        description: 'Set your restaurant operating hours',
      },
      {
        step: 3,
        name: 'Settings',
        completed: tenant.onboardingStep >= 4,
        description: 'Configure language and timezone',
      },
      {
        step: 4,
        name: 'Complete',
        completed: tenant.onboardingStep >= 5,
        description: 'Finalize and activate your account',
      },
    ];

    return {
      currentStep: tenant.onboardingStep,
      totalSteps: 4,
      progress: Math.round((tenant.onboardingStep / 4) * 100),
      steps,
    };
  }
}
