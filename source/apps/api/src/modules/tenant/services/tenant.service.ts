import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateOpeningHoursDto } from '../dto/update-opening-hours.dto';
import { UpdateSettingsDto } from '../dto/update-settings.dto';
import { UpdatePaymentConfigDto } from '../dto/update-payment-config.dto';
import { TenantStatus } from '@prisma/client';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findById(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        // paymentConfig: true, // Uncomment when TenantPaymentConfig model is added
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async updateProfile(tenantId: string, dto: UpdateProfileDto) {
    // Check if slug is already taken (if updating slug)
    if (dto.slug) {
      const existingSlug = await this.prisma.tenant.findUnique({
        where: { slug: dto.slug },
      });

      if (existingSlug && existingSlug.id !== tenantId) {
        throw new ConflictException('Slug already exists');
      }
    }

    const tenant = await this.findById(tenantId);

    try {
      const updated = await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          name: dto.name,
          slug: dto.slug,
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

      this.logger.log(`Tenant profile updated: ${tenantId}`);
      return updated;
    } catch (error) {
      this.logger.error('Failed to update tenant profile', error);
      throw new BadRequestException('Failed to update tenant profile');
    }
  }

  /**
   * Update opening hours
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
   * Update tenant settings (currency, timezone, locale, brandColor)
   */
  async updateSettings(tenantId: string, dto: UpdateSettingsDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Merge new settings with existing settings
    const currentSettings = (tenant.settings as any) || {};
    const updatedSettings = {
      ...currentSettings,
      ...(dto.language && { language: dto.language }),
      ...(dto.timezone && { timezone: dto.timezone }),
      onboardingStep: tenant.onboardingStep < 4 ? 4 : tenant.onboardingStep,
    };

    try {
      const updated = await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          settings: updatedSettings,
        },
      });

      this.logger.log(`Tenant settings updated: ${tenantId}`);
      return updated;
    } catch (error) {
      this.logger.error('Failed to update tenant settings', error);
      throw new BadRequestException('Failed to update tenant settings');
    }
  }

  /**
   * Configure payment (Stripe integration)
   * Note: Requires TenantPaymentConfig model to be created first
   */
  async updatePaymentConfig(tenantId: string, dto: UpdatePaymentConfigDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // TODO: Implement when TenantPaymentConfig model is added to schema
    throw new BadRequestException('Payment configuration not yet implemented');

    /*
    try {
      const config = await this.prisma.tenantPaymentConfig.upsert({
        where: { tenantId },
        create: {
          tenantId,
          stripeAccountId: dto.stripeAccountId,
        },
        update: {
          stripeAccountId: dto.stripeAccountId,
        },
      });

      // Advance onboarding step
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          onboardingStep: Math.max(tenant.onboardingStep, 3),
        },
      });

      this.logger.log(`Payment config updated: ${tenantId}`);
      return config;
    } catch (error) {
      this.logger.error('Failed to update payment config', error);
      throw new BadRequestException('Failed to update payment config');
    }
    */
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(tenantId: string) {
    const tenant = await this.findById(tenantId);

    if (tenant.onboardingStep < 5) {
      throw new ForbiddenException('Please complete all onboarding steps first');
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { onboardingStep: 6 },
    });

    return {
      message: 'Onboarding completed successfully',
      onboardingStep: updated.onboardingStep,
      completedAt: updated.updatedAt,
    };
  }

  /**
   * Update tenant status (Admin only)
   */
  async updateStatus(tenantId: string, status: TenantStatus) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { status },
    });
  }
}
