/**
 * Application Configuration
 * Centralized config for environment variables
 */

export const config = {
  /**
   * API Configuration
   */
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000',

  /**
   * Mock Data Configuration
   * Set to true to use mock data instead of real API calls
   */
  useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',

  /**
   * App Configuration
   */
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'TKOB Admin',

  /**
   * Feature Flags
   */
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  },
} as const;

export default config;
