import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  UpdatePaymentConfigDto,
  PaymentConfigResponseDto,
  TestPaymentResultDto,
  SUPPORTED_BANKS,
} from './dto/payment-config.dto';
import * as crypto from 'crypto';

/**
 * Internal config with decrypted API key for payment processing
 * DO NOT expose this to API responses!
 */
export interface InternalPaymentConfig {
  sepayEnabled: boolean;
  sepayApiKey?: string; // Decrypted!
  sepayAccountNo?: string;
  sepayAccountName?: string;
  sepayBankCode?: string;
  webhookSecret?: string; // Decrypted!
}

@Injectable()
export class PaymentConfigService {
  private readonly logger = new Logger(PaymentConfigService.name);

  // Encryption key from env (32 bytes for AES-256)
  private readonly encryptionKey: Buffer;
  private readonly algorithm = 'aes-256-gcm';

  constructor(private prisma: PrismaService) {
    // Use ENCRYPTION_KEY from env or generate a default (not recommended for production)
    const keyFromEnv = process.env.ENCRYPTION_KEY;
    if (keyFromEnv) {
      this.encryptionKey = Buffer.from(keyFromEnv, 'hex');
    } else {
      this.logger.warn(
        'ENCRYPTION_KEY not set in environment. Using default key (NOT SAFE FOR PRODUCTION)',
      );
      // Generate a deterministic key for development
      this.encryptionKey = crypto.scryptSync('default-dev-key', 'salt', 32);
    }
  }

  /**
   * Encrypt sensitive data (API key)
   */
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.algorithm,
      this.encryptionKey,
      iv,
    );
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    // Return iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt sensitive data
   */
  private decrypt(encryptedText: string): string {
    try {
      const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.encryptionKey,
        iv,
      );
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      this.logger.error('Failed to decrypt data', error);
      throw new Error('Failed to decrypt sensitive data');
    }
  }

  /**
   * Mask API key for safe display (show only last 4 chars)
   */
  private maskApiKey(apiKey?: string): string | undefined {
    if (!apiKey || apiKey.length < 8) return undefined;
    try {
      const decrypted = this.decrypt(apiKey);
      return '*'.repeat(decrypted.length - 4) + decrypted.slice(-4);
    } catch {
      return '****';
    }
  }

  /**
   * Get internal payment config with decrypted secrets
   * Use this for internal payment processing only, never expose to API
   */
  async getInternalConfig(tenantId: string): Promise<InternalPaymentConfig | null> {
    const config = await this.prisma.tenantPaymentConfig.findUnique({
      where: { tenantId },
    });

    if (!config) {
      return null;
    }

    return {
      sepayEnabled: config.sepayEnabled,
      sepayApiKey: config.sepayApiKey ? this.decrypt(config.sepayApiKey) : undefined,
      sepayAccountNo: config.sepayAccountNo ?? undefined,
      sepayAccountName: config.sepayAccountName ?? undefined,
      sepayBankCode: config.sepayBankCode ?? undefined,
      webhookSecret: config.webhookSecret ? this.decrypt(config.webhookSecret) : undefined,
    };
  }

  /**
   * Get payment config for a tenant
   */
  async getConfig(tenantId: string): Promise<PaymentConfigResponseDto> {
    let config = await this.prisma.tenantPaymentConfig.findUnique({
      where: { tenantId },
    });

    // Create default config if not exists
    if (!config) {
      config = await this.prisma.tenantPaymentConfig.create({
        data: {
          tenantId,
          sepayEnabled: false,
          webhookEnabled: false,
        },
      });
    }

    return {
      id: config.id,
      tenantId: config.tenantId,
      sepayEnabled: config.sepayEnabled,
      sepayApiKeyMasked: this.maskApiKey(config.sepayApiKey ?? undefined),
      sepayAccountNo: config.sepayAccountNo ?? undefined,
      sepayAccountName: config.sepayAccountName ?? undefined,
      sepayBankCode: config.sepayBankCode ?? undefined,
      webhookEnabled: config.webhookEnabled,
      webhookSecretMasked: config.webhookSecret
        ? '********'
        : undefined,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  /**
   * Update payment config
   */
  async updateConfig(
    tenantId: string,
    dto: UpdatePaymentConfigDto,
  ): Promise<PaymentConfigResponseDto> {
    // Prepare update data
    const updateData: any = {};

    if (dto.sepayEnabled !== undefined) {
      updateData.sepayEnabled = dto.sepayEnabled;
    }

    if (dto.sepayApiKey !== undefined) {
      // Encrypt the API key before storing
      updateData.sepayApiKey = this.encrypt(dto.sepayApiKey);
    }

    if (dto.sepayAccountNo !== undefined) {
      updateData.sepayAccountNo = dto.sepayAccountNo;
    }

    if (dto.sepayAccountName !== undefined) {
      updateData.sepayAccountName = dto.sepayAccountName;
    }

    if (dto.sepayBankCode !== undefined) {
      updateData.sepayBankCode = dto.sepayBankCode.toUpperCase();
    }

    if (dto.webhookSecret !== undefined) {
      updateData.webhookSecret = dto.webhookSecret;
    }

    if (dto.webhookEnabled !== undefined) {
      updateData.webhookEnabled = dto.webhookEnabled;
    }

    // Upsert the config
    const config = await this.prisma.tenantPaymentConfig.upsert({
      where: { tenantId },
      create: {
        tenantId,
        ...updateData,
      },
      update: updateData,
    });

    return {
      id: config.id,
      tenantId: config.tenantId,
      sepayEnabled: config.sepayEnabled,
      sepayApiKeyMasked: this.maskApiKey(config.sepayApiKey ?? undefined),
      sepayAccountNo: config.sepayAccountNo ?? undefined,
      sepayAccountName: config.sepayAccountName ?? undefined,
      sepayBankCode: config.sepayBankCode ?? undefined,
      webhookEnabled: config.webhookEnabled,
      webhookSecretMasked: config.webhookSecret ? '********' : undefined,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  /**
   * Get decrypted API key for payment processing
   * This should only be called by the payment service internally
   */
  async getDecryptedApiKey(tenantId: string): Promise<string | null> {
    const config = await this.prisma.tenantPaymentConfig.findUnique({
      where: { tenantId },
    });

    if (!config?.sepayApiKey) {
      return null;
    }

    try {
      return this.decrypt(config.sepayApiKey);
    } catch {
      return null;
    }
  }

  /**
   * Test payment config by generating a sample QR code
   */
  async testConfig(
    tenantId: string,
    amount: number,
  ): Promise<TestPaymentResultDto> {
    const config = await this.prisma.tenantPaymentConfig.findUnique({
      where: { tenantId },
    });

    if (!config) {
      return {
        success: false,
        error: 'Payment config not found. Please configure first.',
      };
    }

    if (!config.sepayAccountNo || !config.sepayBankCode) {
      return {
        success: false,
        error: 'Bank account information is incomplete.',
      };
    }

    // Generate test QR URL using SePay format
    const testDescription = `TEST-${Date.now()}`;
    const qrCodeUrl = this.generateSepayQrUrl({
      bankCode: config.sepayBankCode,
      accountNo: config.sepayAccountNo,
      accountName: config.sepayAccountName || '',
      amount,
      description: testDescription,
    });

    return {
      success: true,
      qrCodeUrl,
    };
  }

  /**
   * Generate SePay QR URL
   */
  private generateSepayQrUrl(params: {
    bankCode: string;
    accountNo: string;
    accountName: string;
    amount: number;
    description: string;
  }): string {
    // SePay QR URL format
    const baseUrl = 'https://qr.sepay.vn/img';
    const queryParams = new URLSearchParams({
      bank: params.bankCode,
      acc: params.accountNo,
      template: 'compact',
      amount: params.amount.toString(),
      des: params.description,
    });

    return `${baseUrl}?${queryParams.toString()}`;
  }

  /**
   * Get list of supported banks
   */
  getSupportedBanks() {
    return SUPPORTED_BANKS;
  }

  /**
   * Check if tenant has valid payment config
   */
  async hasValidConfig(tenantId: string): Promise<boolean> {
    const config = await this.prisma.tenantPaymentConfig.findUnique({
      where: { tenantId },
    });

    return !!(
      config?.sepayEnabled &&
      config?.sepayAccountNo &&
      config?.sepayBankCode
    );
  }
}
