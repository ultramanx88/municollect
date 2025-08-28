// Application constants

// Export constants from subdirectories
export * from './constants';

// Service types
export const SERVICE_TYPES = {
  WASTE_MANAGEMENT: 'waste_management',
  WATER_BILL: 'water_bill',
} as const;

// Payment statuses
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  EXPIRED: 'expired',
} as const;

// User roles
export const USER_ROLES = {
  RESIDENT: 'resident',
  MUNICIPAL_STAFF: 'municipal_staff',
  ADMIN: 'admin',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  PAYMENT_REMINDER: 'payment_reminder',
  PAYMENT_CONFIRMATION: 'payment_confirmation',
  PAYMENT_FAILED: 'payment_failed',
  SYSTEM_UPDATE: 'system_update',
} as const;

// Notification statuses
export const NOTIFICATION_STATUSES = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
} as const;

// Supported currencies
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  THB: 'THB',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REFRESH: '/api/auth/refresh',
  AUTH_LOGOUT: '/api/auth/logout',
  
  // Users
  USERS_PROFILE: '/api/users/profile',
  USERS_MUNICIPALITIES: '/api/users/municipalities',
  
  // Municipalities
  MUNICIPALITIES: '/api/municipalities',
  MUNICIPALITY_BY_ID: '/api/municipalities/:id',
  
  // Payments
  PAYMENTS_SERVICES: '/api/payments/services',
  PAYMENTS_INITIATE: '/api/payments/initiate',
  PAYMENTS_HISTORY: '/api/payments/history',
  PAYMENT_STATUS: '/api/payments/:id/status',
  
  // QR Codes
  QR_GENERATE: '/api/qr/generate',
  QR_DETAILS: '/api/qr/:code/details',
  
  // Notifications
  NOTIFICATIONS_SEND: '/api/notifications/send',
  NOTIFICATIONS_HISTORY: '/api/notifications/history',
  NOTIFICATION_READ: '/api/notifications/:id/read',
  
  // Localization
  LOCALIZATION_CONFIG: '/api/localization/config',
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
  NAME_MAX_LENGTH: 100,
  MUNICIPALITY_CODE_MAX_LENGTH: 10,
  NOTIFICATION_TITLE_MAX_LENGTH: 255,
  NOTIFICATION_MESSAGE_MAX_LENGTH: 1000,
  QR_CODE_EXPIRATION_MINUTES: 30,
  MAX_PAYMENT_AMOUNT_WASTE: 10000,
  MAX_PAYMENT_AMOUNT_WATER: 50000,
  PAGINATION_MAX_LIMIT: 100,
  PAGINATION_DEFAULT_LIMIT: 20,
} as const;

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  QR_CODE_ERROR: 'QR_CODE_ERROR',
  NOTIFICATION_ERROR: 'NOTIFICATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;