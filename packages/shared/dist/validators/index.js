"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMunicipalityCode = exports.validateQRCodeExpiration = exports.validatePaymentAmount = exports.ApiResponseSchema = exports.PaginationSchema = exports.MarkNotificationReadRequestSchema = exports.NotificationListRequestSchema = exports.NotificationRequestSchema = exports.NotificationSchema = exports.QRCodeValidationRequestSchema = exports.QRCodeRequestSchema = exports.QRCodeDataSchema = exports.PaymentStatusUpdateSchema = exports.PaymentHistoryRequestSchema = exports.PaymentSchema = exports.PaymentRequestSchema = exports.MunicipalityRequestSchema = exports.MunicipalitySchema = exports.PaymentConfigSchema = exports.UpdateProfileRequestSchema = exports.RefreshTokenRequestSchema = exports.LoginRequestSchema = exports.RegisterRequestSchema = exports.UserSchema = exports.UserDetailsSchema = exports.NotificationStatusSchema = exports.NotificationTypeSchema = exports.UserRoleSchema = exports.PaymentStatusSchema = exports.ServiceTypeSchema = exports.CurrencySchema = exports.PhoneSchema = exports.EmailSchema = exports.UUIDSchema = void 0;
const zod_1 = require("zod");
// Base validation schemas
exports.UUIDSchema = zod_1.z.string().uuid();
exports.EmailSchema = zod_1.z.string().email();
exports.PhoneSchema = zod_1.z.string().regex(/^\+?[\d\s\-\(\)]+$/).optional();
exports.CurrencySchema = zod_1.z.enum(['USD', 'EUR', 'GBP']);
exports.ServiceTypeSchema = zod_1.z.enum(['waste_management', 'water_bill']);
exports.PaymentStatusSchema = zod_1.z.enum(['pending', 'completed', 'failed', 'expired']);
exports.UserRoleSchema = zod_1.z.enum(['resident', 'municipal_staff', 'admin']);
exports.NotificationTypeSchema = zod_1.z.enum(['payment_reminder', 'payment_confirmation', 'payment_failed', 'system_update']);
exports.NotificationStatusSchema = zod_1.z.enum(['sent', 'delivered', 'read', 'failed']);
// User validation schemas
exports.UserDetailsSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'First name is required').max(100),
    lastName: zod_1.z.string().min(1, 'Last name is required').max(100),
    email: exports.EmailSchema,
    phone: exports.PhoneSchema,
});
exports.UserSchema = zod_1.z.object({
    id: exports.UUIDSchema,
    email: exports.EmailSchema,
    firstName: zod_1.z.string().min(1).max(100),
    lastName: zod_1.z.string().min(1).max(100),
    phone: exports.PhoneSchema,
    role: exports.UserRoleSchema,
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// Authentication validation schemas
exports.RegisterRequestSchema = zod_1.z.object({
    email: exports.EmailSchema,
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters').max(100),
    firstName: zod_1.z.string().min(1, 'First name is required').max(100),
    lastName: zod_1.z.string().min(1, 'Last name is required').max(100),
    phone: exports.PhoneSchema,
    municipalityId: exports.UUIDSchema.optional(),
});
exports.LoginRequestSchema = zod_1.z.object({
    email: exports.EmailSchema,
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.RefreshTokenRequestSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.UpdateProfileRequestSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).max(100).optional(),
    lastName: zod_1.z.string().min(1).max(100).optional(),
    phone: exports.PhoneSchema,
});
// Municipality validation schemas
exports.PaymentConfigSchema = zod_1.z.object({
    wasteManagementFee: zod_1.z.number().positive().optional(),
    waterBillEnabled: zod_1.z.boolean().optional(),
    currency: exports.CurrencySchema,
    paymentMethods: zod_1.z.array(zod_1.z.string()),
    qrCodeExpirationMinutes: zod_1.z.number().positive().default(30),
});
exports.MunicipalitySchema = zod_1.z.object({
    id: exports.UUIDSchema,
    name: zod_1.z.string().min(1, 'Municipality name is required').max(255),
    code: zod_1.z.string().min(1, 'Municipality code is required').max(10),
    contactEmail: exports.EmailSchema.optional(),
    contactPhone: exports.PhoneSchema,
    paymentConfig: exports.PaymentConfigSchema.optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.MunicipalityRequestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Municipality name is required').max(255),
    code: zod_1.z.string().min(1, 'Municipality code is required').max(10),
    contactEmail: exports.EmailSchema.optional(),
    contactPhone: exports.PhoneSchema,
    paymentConfig: zod_1.z.record(zod_1.z.any()).optional(),
});
// Payment validation schemas
exports.PaymentRequestSchema = zod_1.z.object({
    municipalityId: exports.UUIDSchema,
    serviceType: exports.ServiceTypeSchema,
    amount: zod_1.z.number().positive('Amount must be greater than 0'),
    currency: exports.CurrencySchema,
    userDetails: exports.UserDetailsSchema,
    dueDate: zod_1.z.date().optional(),
});
exports.PaymentSchema = zod_1.z.object({
    id: exports.UUIDSchema,
    municipalityId: exports.UUIDSchema,
    userId: exports.UUIDSchema,
    serviceType: exports.ServiceTypeSchema,
    amount: zod_1.z.number().positive(),
    currency: exports.CurrencySchema,
    status: exports.PaymentStatusSchema,
    qrCode: zod_1.z.string().optional(),
    dueDate: zod_1.z.date().optional(),
    paidAt: zod_1.z.date().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.PaymentHistoryRequestSchema = zod_1.z.object({
    municipalityId: exports.UUIDSchema.optional(),
    serviceType: exports.ServiceTypeSchema.optional(),
    status: exports.PaymentStatusSchema.optional(),
    startDate: zod_1.z.date().optional(),
    endDate: zod_1.z.date().optional(),
    limit: zod_1.z.number().positive().max(100).default(20),
    offset: zod_1.z.number().nonnegative().default(0),
});
exports.PaymentStatusUpdateSchema = zod_1.z.object({
    paymentId: exports.UUIDSchema,
    status: exports.PaymentStatusSchema,
    transactionData: zod_1.z.record(zod_1.z.any()).optional(),
});
// QR Code validation schemas
exports.QRCodeDataSchema = zod_1.z.object({
    paymentId: exports.UUIDSchema,
    municipalityId: exports.UUIDSchema,
    amount: zod_1.z.number().positive(),
    currency: exports.CurrencySchema,
    serviceType: exports.ServiceTypeSchema,
    expiresAt: zod_1.z.date(),
});
exports.QRCodeRequestSchema = zod_1.z.object({
    paymentId: exports.UUIDSchema,
});
exports.QRCodeValidationRequestSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, 'QR code is required'),
});
// Notification validation schemas
exports.NotificationSchema = zod_1.z.object({
    id: exports.UUIDSchema,
    userId: exports.UUIDSchema,
    type: exports.NotificationTypeSchema,
    title: zod_1.z.string().min(1).max(255),
    message: zod_1.z.string().min(1).max(1000),
    status: exports.NotificationStatusSchema,
    data: zod_1.z.record(zod_1.z.any()).optional(),
    createdAt: zod_1.z.date(),
    readAt: zod_1.z.date().optional(),
});
exports.NotificationRequestSchema = zod_1.z.object({
    userId: exports.UUIDSchema,
    type: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1, 'Title is required').max(255),
    message: zod_1.z.string().min(1, 'Message is required').max(1000),
    data: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.NotificationListRequestSchema = zod_1.z.object({
    userId: exports.UUIDSchema,
    status: zod_1.z.string().optional(),
    limit: zod_1.z.number().positive().max(100).default(20),
    offset: zod_1.z.number().nonnegative().default(0),
});
exports.MarkNotificationReadRequestSchema = zod_1.z.object({
    notificationId: exports.UUIDSchema,
});
// Generic validation helpers
exports.PaginationSchema = zod_1.z.object({
    limit: zod_1.z.number().positive().max(100).default(20),
    offset: zod_1.z.number().nonnegative().default(0),
});
const ApiResponseSchema = (dataSchema) => zod_1.z.object({
    success: zod_1.z.boolean(),
    data: dataSchema.optional(),
    error: zod_1.z.object({
        error: zod_1.z.string(),
        code: zod_1.z.number(),
        timestamp: zod_1.z.number(),
        details: zod_1.z.record(zod_1.z.any()).optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
});
exports.ApiResponseSchema = ApiResponseSchema;
// Validation helper functions
const validatePaymentAmount = (amount, serviceType) => {
    if (amount <= 0)
        return false;
    if (serviceType === 'waste_management' && amount > 10000)
        return false;
    if (serviceType === 'water_bill' && amount > 50000)
        return false;
    return true;
};
exports.validatePaymentAmount = validatePaymentAmount;
const validateQRCodeExpiration = (expiresAt) => {
    return expiresAt > new Date();
};
exports.validateQRCodeExpiration = validateQRCodeExpiration;
const validateMunicipalityCode = (code) => {
    return /^[A-Z0-9]{2,10}$/.test(code);
};
exports.validateMunicipalityCode = validateMunicipalityCode;
