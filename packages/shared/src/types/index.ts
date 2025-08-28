// Core type definitions for the MuniCollect system

// Export common utility types
export * from './common';

// Export localization types
export * from './localization';

// User types
export type UserRole = 'resident' | 'municipal_staff' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

// Municipality types
export interface PaymentConfig {
  wasteManagementFee?: number;
  waterBillEnabled?: boolean;
  currency: string;
  paymentMethods: string[];
  qrCodeExpirationMinutes: number;
}

export interface Municipality {
  id: string;
  name: string;
  code: string;
  contactEmail?: string;
  contactPhone?: string;
  paymentConfig?: PaymentConfig;
  createdAt: Date;
  updatedAt: Date;
}

// Payment types
export type ServiceType = 'waste_management' | 'water_bill';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'expired';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'THB';

export interface Payment {
  id: string;
  municipalityId: string;
  userId: string;
  serviceType: ServiceType;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  qrCode?: string;
  dueDate?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTransaction {
  id: string;
  paymentId: string;
  status: PaymentStatus;
  transactionData?: Record<string, any>;
  createdAt: Date;
}

// QR Code types
export interface QRCodeData {
  paymentId: string;
  municipalityId: string;
  amount: number;
  currency: Currency;
  serviceType: ServiceType;
  expiresAt: Date;
}

export interface QRCode {
  code: string;
  data: QRCodeData;
  imageUrl?: string;
}

// Notification types
export type NotificationType = 'payment_reminder' | 'payment_confirmation' | 'payment_failed' | 'system_update';
export type NotificationStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  data?: Record<string, any>;
  createdAt: Date;
  readAt?: Date;
}

// Authentication types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface UserSession {
  user: User;
  tokens: AuthTokens;
}