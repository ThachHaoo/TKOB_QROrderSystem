// Centralized route paths for web-tenant (Admin/Staff portal)
// Use these constants across features and app router wrappers.

export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  // Admin routes - all prefixed with /admin
  dashboard: '/admin/dashboard',
  menu: '/admin/menu',
  menuModifiers: '/admin/menu-modifiers',
  tables: '/admin/tables',
  tableQRDetail: '/admin/table-qr-detail',
  orders: '/admin/orders',
  analytics: '/admin/analytics',
  staff: '/admin/staff',
  tenantProfile: '/admin/tenant-profile',
  kds: '/admin/kds',
  serviceBoard: '/admin/service-board',
} as const;

export type RouteKey = keyof typeof ROUTES;
