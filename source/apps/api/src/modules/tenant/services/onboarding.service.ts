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
import { UpdatePaymentConfigDto } from '../dto/update-payment-config.dto';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
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
   * Step 3: Update settings
   */
  async updateSettings(tenantId: string, dto: UpdateSettingsDto) {
    const tenant = await this.tenantService.getTenant(tenantId);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    try {
      const updated = await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          settings: {
            ...(tenant.settings as object),
            ...(dto.language && { language: dto.language }),
            ...(dto.timezone && { timezone: dto.timezone }),
          },
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
   * Step 4: Configure payment (Stripe integration)
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
    const tenant = await this.tenantService.getTenant(tenantId);

    if (tenant.onboardingStep < 5) {
      throw new ForbiddenException('Please complete all onboarding steps first');
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        onboardingStep: 5,
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
