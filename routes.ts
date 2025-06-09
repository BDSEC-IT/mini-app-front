export const vendorRoutes = [''];

export const authRoutes = ['/login'];
export const adminRoutes = [
  /^\/dashboard\/users(\/.*)?$/,
  /^\/dashboard\/otc(\/.*)?$/
];
export const superAdminRoutes = [
  /^\/dashboard\/users(\/.*)?$/,
  /^\/dashboard\/otc(\/.*)?$/
];

export const dashboardPrefix = '/dashboard';
export const apiAuthPrefix = '/api/auth';
export const DEFAULT_LOGIN_REDIRECT = '/dashboard/overview';
export const PROHIBITED_PAGE_REDIRECT = '/dashboard/accessdenied';

export const DEFAULT_LOGIN_PAGE = '/login';
