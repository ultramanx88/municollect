import { z } from 'zod';

// Export localization validators
export * from './localization';

// Base validation schemas
export const UUIDSchema = z.string().uuid();
export const EmailSchema = z.string().email();
export const PhoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/).optional();
export const CurrencySchema = z.enum(['USD', 'EUR', 'GBP', 'THB']);
export const ServiceTypeSchema = z.enum(['waste_management', 'water_bill']);
export const PaymentStatusSchema = z.enum(['pending', 'completed', 'failed', 'expired']);
export const UserRoleSchema = z.enum(['resident', 'municipal_staff', 'admin']);
export const NotificationTypeSchema = z.enum(['payment_reminder', 'payment_confirmation', 'payment_failed', 'system_update']);
export const NotificationStatusSchema = z.enum(['sent', 'delivered', 'read', 'failed']);

// User validation schemas
export const UserDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: EmailSchema,
  phone: PhoneSchema,
});

export const UserSchema = z.object({
  id: UUIDSchema,
  email: EmailSchema,
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: PhoneSchema,
  role: UserRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Authentication validation schemas
export const RegisterRequestSchema = z.object({
  email: EmailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: PhoneSchema,
  municipalityId: UUIDSchema.optional(),
});

export const LoginRequestSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const UpdateProfileRequestSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: PhoneSchema,
});

// Municipality validation schemas
export const PaymentConfigSchema = z.object({
  wasteManagementFee: z.number().positive().optional(),
  waterBillEnabled: z.boolean().optional(),
  currency: CurrencySchema,
  paymentMethods: z.array(z.string()),
  qrCodeExpirationMinutes: z.number().positive().default(30),
});

export const MunicipalitySchema = z.object({
  id: UUIDSchema,
  name: z.string().min(1, 'Municipality name is required').max(255),
  code: z.string().min(1, 'Municipality code is required').max(10),
  contactEmail: EmailSchema.optional(),
  contactPhone: PhoneSchema,
  paymentConfig: PaymentConfigSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const MunicipalityRequestSchema = z.object({
  name: z.string().min(1, 'Municipality name is required').max(255),
  code: z.string().min(1, 'Municipality code is required').max(10),
  contactEmail: EmailSchema.optional(),
  contactPhone: PhoneSchema,
  paymentConfig: z.record(z.any()).optional(),
});

// Payment validation schemas
export const PaymentRequestSchema = z.object({
  municipalityId: UUIDSchema,
  serviceType: ServiceTypeSchema,
  amount: z.number().positive('Amount must be greater than 0'),
  currency: CurrencySchema,
  userDetails: UserDetailsSchema,
  dueDate: z.date().optional(),
});

export const PaymentSchema = z.object({
  id: UUIDSchema,
  municipalityId: UUIDSchema,
  userId: UUIDSchema,
  serviceType: ServiceTypeSchema,
  amount: z.number().positive(),
  currency: CurrencySchema,
  status: PaymentStatusSchema,
  qrCode: z.string().optional(),
  dueDate: z.date().optional(),
  paidAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PaymentHistoryRequestSchema = z.object({
  municipalityId: UUIDSchema.optional(),
  serviceType: ServiceTypeSchema.optional(),
  status: PaymentStatusSchema.optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  limit: z.number().positive().max(100).default(20),
  offset: z.number().nonnegative().default(0),
});

export const PaymentStatusUpdateSchema = z.object({
  paymentId: UUIDSchema,
  status: PaymentStatusSchema,
  transactionData: z.record(z.any()).optional(),
});

// QR Code validation schemas
export const QRCodeDataSchema = z.object({
  paymentId: UUIDSchema,
  municipalityId: UUIDSchema,
  amount: z.number().positive(),
  currency: CurrencySchema,
  serviceType: ServiceTypeSchema,
  expiresAt: z.date(),
});

export const QRCodeRequestSchema = z.object({
  paymentId: UUIDSchema,
});

export const QRCodeValidationRequestSchema = z.object({
  code: z.string().min(1, 'QR code is required'),
});

// Notification validation schemas
export const NotificationSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  type: NotificationTypeSchema,
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(1000),
  status: NotificationStatusSchema,
  data: z.record(z.any()).optional(),
  createdAt: z.date(),
  readAt: z.date().optional(),
});

export const NotificationRequestSchema = z.object({
  userId: UUIDSchema,
  type: z.string().min(1),
  title: z.string().min(1, 'Title is required').max(255),
  message: z.string().min(1, 'Message is required').max(1000),
  data: z.record(z.any()).optional(),
});

export const NotificationListRequestSchema = z.object({
  userId: UUIDSchema,
  status: z.string().optional(),
  limit: z.number().positive().max(100).default(20),
  offset: z.number().nonnegative().default(0),
});

export const MarkNotificationReadRequestSchema = z.object({
  notificationId: UUIDSchema,
});

// Generic validation helpers
export const PaginationSchema = z.object({
  limit: z.number().positive().max(100).default(20),
  offset: z.number().nonnegative().default(0),
});

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.object({
      error: z.string(),
      code: z.number(),
      timestamp: z.number(),
      details: z.record(z.any()).optional(),
    }).optional(),
    timestamp: z.number(),
  });

// Validation helper functions
export const validatePaymentAmount = (amount: number, serviceType: string): boolean => {
  if (amount <= 0) return false;
  if (serviceType === 'waste_management' && amount > 10000) return false;
  if (serviceType === 'water_bill' && amount > 50000) return false;
  return true;
};

export const validateQRCodeExpiration = (expiresAt: Date): boolean => {
  return expiresAt > new Date();
};

export const validateMunicipalityCode = (code: string): boolean => {
  return /^[A-Z0-9]{2,10}$/.test(code);
};
