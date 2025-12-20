// Application constants

// API Mode: 'mock' or 'real'
export const API_MODE = process.env.NEXT_PUBLIC_API_MODE || 'mock';
export const USE_MOCK_API = API_MODE === 'mock';

// Tax and charges
export const TAX_RATE = 0.1; // 10%
export const SERVICE_CHARGE_RATE = 0.05; // 5%

// Pagination
export const ITEMS_PER_PAGE = 6;

// Payment methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  COUNTER: 'counter',
} as const;

// Order status progression
export const ORDER_STATUS_FLOW = [
  'Pending',
  'Accepted',
  'Preparing',
  'Ready',
  'Served',
  'Completed',
] as const;

// QR token
export const MOCK_QR_TOKEN = 'mock-token-123';
