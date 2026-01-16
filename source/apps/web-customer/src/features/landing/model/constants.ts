/**
 * Landing Feature - i18n Text Constants
 * Extracted from inline dictionaries for centralized management
 */

export const LANDING_TEXT = {
  EN: {
    welcome: 'Welcome to',
    tableInfo: (tableNumber: string | number) => `You're at Table ${tableNumber}`,
    guestCount: (count?: number) => count ? `${count} guest${count !== 1 ? 's' : ''}` : 'Welcome',
    validText: 'Scan valid for today only',
    ctaButton: 'View Menu',
    helperText: 'Browse our menu and place your order directly from your table',
    loading: 'Loading...',
  },
  VI: {
    welcome: 'Chào mừng đến',
    tableInfo: (tableNumber: string | number) => `Bạn đang ở bàn số ${tableNumber}`,
    guestCount: (count?: number) => count ? `${count} khách` : 'Chào mừng',
    validText: 'Mã QR có hiệu lực trong ngày hôm nay',
    ctaButton: 'Xem thực đơn',
    helperText: 'Duyệt thực đơn và đặt món ngay tại bàn của bạn',
    loading: 'Đang tải...',
  },
} as const
