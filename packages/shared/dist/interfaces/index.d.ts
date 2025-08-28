import { ServiceType, Currency, PaymentStatus, UserDetails, User, Payment, Municipality, Notification, QRCodeData } from '../types';
export * from './localization';
export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    municipalityId?: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
    expiresAt: Date;
}
export interface RefreshTokenRequest {
    refreshToken: string;
}
export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
}
export interface UserProfileResponse {
    user: User;
    municipalities: Municipality[];
}
export interface PaymentRequest {
    municipalityId: string;
    serviceType: ServiceType;
    amount: number;
    currency: Currency;
    userDetails: UserDetails;
    dueDate?: Date;
}
export interface PaymentResponse {
    id: string;
    qrCode: string;
    status: PaymentStatus;
    expiresAt: Date;
    paymentUrl: string;
    payment: Payment;
}
export interface PaymentHistoryRequest {
    municipalityId?: string;
    serviceType?: ServiceType;
    status?: PaymentStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}
export interface PaymentHistoryResponse {
    payments: Payment[];
    total: number;
    hasMore: boolean;
}
export interface PaymentStatusUpdate {
    paymentId: string;
    status: PaymentStatus;
    transactionData?: Record<string, any>;
}
export interface MunicipalityRequest {
    name: string;
    code: string;
    contactEmail?: string;
    contactPhone?: string;
    paymentConfig?: Record<string, any>;
}
export interface MunicipalityResponse {
    municipality: Municipality;
}
export interface MunicipalityListResponse {
    municipalities: Municipality[];
    total: number;
}
export interface QRCodeRequest {
    paymentId: string;
}
export interface QRCodeResponse {
    qrCode: string;
    data: QRCodeData;
    expiresAt: Date;
}
export interface QRCodeValidationRequest {
    code: string;
}
export interface QRCodeValidationResponse {
    valid: boolean;
    data?: QRCodeData;
    payment?: Payment;
}
export interface NotificationRequest {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
}
export interface NotificationResponse {
    notification: Notification;
}
export interface NotificationListRequest {
    userId: string;
    status?: string;
    limit?: number;
    offset?: number;
}
export interface NotificationListResponse {
    notifications: Notification[];
    total: number;
    unreadCount: number;
}
export interface MarkNotificationReadRequest {
    notificationId: string;
}
export interface ApiError {
    error: string;
    code: number;
    timestamp: number;
    details?: Record<string, any>;
}
export interface ValidationError extends ApiError {
    field: string;
    value: any;
}
