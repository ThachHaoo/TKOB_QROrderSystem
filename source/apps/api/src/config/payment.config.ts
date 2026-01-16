import { registerAs } from '@nestjs/config';

export default registerAs('payment', () => ({
  sepay: {
    apiUrl: process.env.SEPAY_API_URL || 'https://my.sepay.vn/userapi',
    secretKey: process.env.SEPAY_SECRET_KEY, // API Token từ my.sepay.vn/companyapi
    webhookSecret: process.env.SEPAY_WEBHOOK_SECRET || '', // Optional
    accountNumber: process.env.SEPAY_ACCOUNT_NUMBER,
    accountName: process.env.SEPAY_ACCOUNT_NAME,
    bankCode: process.env.SEPAY_BANK_CODE || 'VCB',
  },
  paymentExpiryMinutes: parseInt(process.env.PAYMENT_EXPIRY_MINUTES || '15', 10),
  retryAttempts: parseInt(process.env.PAYMENT_RETRY_ATTEMPTS || '3', 10),
  retryDelay: parseInt(process.env.PAYMENT_RETRY_DELAY || '1000', 10),
}));
