import { z } from 'zod';
export * from './localization';
export declare const UUIDSchema: z.ZodString;
export declare const EmailSchema: z.ZodString;
export declare const PhoneSchema: z.ZodOptional<z.ZodString>;
export declare const CurrencySchema: z.ZodEnum<["USD", "EUR", "GBP", "THB"]>;
export declare const ServiceTypeSchema: z.ZodEnum<["waste_management", "water_bill"]>;
export declare const PaymentStatusSchema: z.ZodEnum<["pending", "completed", "failed", "expired"]>;
export declare const UserRoleSchema: z.ZodEnum<["resident", "municipal_staff", "admin"]>;
export declare const NotificationTypeSchema: z.ZodEnum<["payment_reminder", "payment_confirmation", "payment_failed", "system_update"]>;
export declare const NotificationStatusSchema: z.ZodEnum<["sent", "delivered", "read", "failed"]>;
export declare const UserDetailsSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | undefined;
}>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodEnum<["resident", "municipal_staff", "admin"]>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "resident" | "municipal_staff" | "admin";
    createdAt: Date;
    updatedAt: Date;
    phone?: string | undefined;
}, {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "resident" | "municipal_staff" | "admin";
    createdAt: Date;
    updatedAt: Date;
    phone?: string | undefined;
}>;
export declare const RegisterRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    municipalityId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string | undefined;
    municipalityId?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string | undefined;
    municipalityId?: string | undefined;
}>;
export declare const LoginRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const RefreshTokenRequestSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const UpdateProfileRequestSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    phone?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
}, {
    phone?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
}>;
export declare const PaymentConfigSchema: z.ZodObject<{
    wasteManagementFee: z.ZodOptional<z.ZodNumber>;
    waterBillEnabled: z.ZodOptional<z.ZodBoolean>;
    currency: z.ZodEnum<["USD", "EUR", "GBP", "THB"]>;
    paymentMethods: z.ZodArray<z.ZodString, "many">;
    qrCodeExpirationMinutes: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    currency: "USD" | "EUR" | "GBP" | "THB";
    paymentMethods: string[];
    qrCodeExpirationMinutes: number;
    wasteManagementFee?: number | undefined;
    waterBillEnabled?: boolean | undefined;
}, {
    currency: "USD" | "EUR" | "GBP" | "THB";
    paymentMethods: string[];
    wasteManagementFee?: number | undefined;
    waterBillEnabled?: boolean | undefined;
    qrCodeExpirationMinutes?: number | undefined;
}>;
export declare const MunicipalitySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    code: z.ZodString;
    contactEmail: z.ZodOptional<z.ZodString>;
    contactPhone: z.ZodOptional<z.ZodString>;
    paymentConfig: z.ZodOptional<z.ZodObject<{
        wasteManagementFee: z.ZodOptional<z.ZodNumber>;
        waterBillEnabled: z.ZodOptional<z.ZodBoolean>;
        currency: z.ZodEnum<["USD", "EUR", "GBP", "THB"]>;
        paymentMethods: z.ZodArray<z.ZodString, "many">;
        qrCodeExpirationMinutes: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        currency: "USD" | "EUR" | "GBP" | "THB";
        paymentMethods: string[];
        qrCodeExpirationMinutes: number;
        wasteManagementFee?: number | undefined;
        waterBillEnabled?: boolean | undefined;
    }, {
        currency: "USD" | "EUR" | "GBP" | "THB";
        paymentMethods: string[];
        wasteManagementFee?: number | undefined;
        waterBillEnabled?: boolean | undefined;
        qrCodeExpirationMinutes?: number | undefined;
    }>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    contactEmail?: string | undefined;
    contactPhone?: string | undefined;
    paymentConfig?: {
        currency: "USD" | "EUR" | "GBP" | "THB";
        paymentMethods: string[];
        qrCodeExpirationMinutes: number;
        wasteManagementFee?: number | undefined;
        waterBillEnabled?: boolean | undefined;
    } | undefined;
}, {
    code: string;
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    contactEmail?: string | undefined;
    contactPhone?: string | undefined;
    paymentConfig?: {
        currency: "USD" | "EUR" | "GBP" | "THB";
        paymentMethods: string[];
        wasteManagementFee?: number | undefined;
        waterBillEnabled?: boolean | undefined;
        qrCodeExpirationMinutes?: number | undefined;
    } | undefined;
}>;
export declare const MunicipalityRequestSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
    contactEmail: z.ZodOptional<z.ZodString>;
    contactPhone: z.ZodOptional<z.ZodString>;
    paymentConfig: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
    contactEmail?: string | undefined;
    contactPhone?: string | undefined;
    paymentConfig?: Record<string, any> | undefined;
}, {
    code: string;
    name: string;
    contactEmail?: string | undefined;
    contactPhone?: string | undefined;
    paymentConfig?: Record<string, any> | undefined;
}>;
export declare const PaymentRequestSchema: z.ZodObject<{
    municipalityId: z.ZodString;
    serviceType: z.ZodEnum<["waste_management", "water_bill"]>;
    amount: z.ZodNumber;
    currency: z.ZodEnum<["USD", "EUR", "GBP", "THB"]>;
    userDetails: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string | undefined;
    }, {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string | undefined;
    }>;
    dueDate: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    municipalityId: string;
    currency: "USD" | "EUR" | "GBP" | "THB";
    serviceType: "waste_management" | "water_bill";
    amount: number;
    userDetails: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string | undefined;
    };
    dueDate?: Date | undefined;
}, {
    municipalityId: string;
    currency: "USD" | "EUR" | "GBP" | "THB";
    serviceType: "waste_management" | "water_bill";
    amount: number;
    userDetails: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string | undefined;
    };
    dueDate?: Date | undefined;
}>;
export declare const PaymentSchema: z.ZodObject<{
    id: z.ZodString;
    municipalityId: z.ZodString;
    userId: z.ZodString;
    serviceType: z.ZodEnum<["waste_management", "water_bill"]>;
    amount: z.ZodNumber;
    currency: z.ZodEnum<["USD", "EUR", "GBP", "THB"]>;
    status: z.ZodEnum<["pending", "completed", "failed", "expired"]>;
    qrCode: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodDate>;
    paidAt: z.ZodOptional<z.ZodDate>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "completed" | "failed" | "expired";
    id: string;
    createdAt: Date;
    updatedAt: Date;
    municipalityId: string;
    currency: "USD" | "EUR" | "GBP" | "THB";
    serviceType: "waste_management" | "water_bill";
    amount: number;
    userId: string;
    dueDate?: Date | undefined;
    qrCode?: string | undefined;
    paidAt?: Date | undefined;
}, {
    status: "pending" | "completed" | "failed" | "expired";
    id: string;
    createdAt: Date;
    updatedAt: Date;
    municipalityId: string;
    currency: "USD" | "EUR" | "GBP" | "THB";
    serviceType: "waste_management" | "water_bill";
    amount: number;
    userId: string;
    dueDate?: Date | undefined;
    qrCode?: string | undefined;
    paidAt?: Date | undefined;
}>;
export declare const PaymentHistoryRequestSchema: z.ZodObject<{
    municipalityId: z.ZodOptional<z.ZodString>;
    serviceType: z.ZodOptional<z.ZodEnum<["waste_management", "water_bill"]>>;
    status: z.ZodOptional<z.ZodEnum<["pending", "completed", "failed", "expired"]>>;
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodDate>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    status?: "pending" | "completed" | "failed" | "expired" | undefined;
    municipalityId?: string | undefined;
    serviceType?: "waste_management" | "water_bill" | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
}, {
    status?: "pending" | "completed" | "failed" | "expired" | undefined;
    municipalityId?: string | undefined;
    serviceType?: "waste_management" | "water_bill" | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare const PaymentStatusUpdateSchema: z.ZodObject<{
    paymentId: z.ZodString;
    status: z.ZodEnum<["pending", "completed", "failed", "expired"]>;
    transactionData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "completed" | "failed" | "expired";
    paymentId: string;
    transactionData?: Record<string, any> | undefined;
}, {
    status: "pending" | "completed" | "failed" | "expired";
    paymentId: string;
    transactionData?: Record<string, any> | undefined;
}>;
export declare const QRCodeDataSchema: z.ZodObject<{
    paymentId: z.ZodString;
    municipalityId: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodEnum<["USD", "EUR", "GBP", "THB"]>;
    serviceType: z.ZodEnum<["waste_management", "water_bill"]>;
    expiresAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    municipalityId: string;
    currency: "USD" | "EUR" | "GBP" | "THB";
    serviceType: "waste_management" | "water_bill";
    amount: number;
    paymentId: string;
    expiresAt: Date;
}, {
    municipalityId: string;
    currency: "USD" | "EUR" | "GBP" | "THB";
    serviceType: "waste_management" | "water_bill";
    amount: number;
    paymentId: string;
    expiresAt: Date;
}>;
export declare const QRCodeRequestSchema: z.ZodObject<{
    paymentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    paymentId: string;
}, {
    paymentId: string;
}>;
export declare const QRCodeValidationRequestSchema: z.ZodObject<{
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
}, {
    code: string;
}>;
export declare const NotificationSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    type: z.ZodEnum<["payment_reminder", "payment_confirmation", "payment_failed", "system_update"]>;
    title: z.ZodString;
    message: z.ZodString;
    status: z.ZodEnum<["sent", "delivered", "read", "failed"]>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    createdAt: z.ZodDate;
    readAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    message: string;
    type: "payment_reminder" | "payment_confirmation" | "payment_failed" | "system_update";
    status: "failed" | "sent" | "delivered" | "read";
    id: string;
    createdAt: Date;
    userId: string;
    title: string;
    data?: Record<string, any> | undefined;
    readAt?: Date | undefined;
}, {
    message: string;
    type: "payment_reminder" | "payment_confirmation" | "payment_failed" | "system_update";
    status: "failed" | "sent" | "delivered" | "read";
    id: string;
    createdAt: Date;
    userId: string;
    title: string;
    data?: Record<string, any> | undefined;
    readAt?: Date | undefined;
}>;
export declare const NotificationRequestSchema: z.ZodObject<{
    userId: z.ZodString;
    type: z.ZodString;
    title: z.ZodString;
    message: z.ZodString;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    type: string;
    userId: string;
    title: string;
    data?: Record<string, any> | undefined;
}, {
    message: string;
    type: string;
    userId: string;
    title: string;
    data?: Record<string, any> | undefined;
}>;
export declare const NotificationListRequestSchema: z.ZodObject<{
    userId: z.ZodString;
    status: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    limit: number;
    offset: number;
    status?: string | undefined;
}, {
    userId: string;
    status?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare const MarkNotificationReadRequestSchema: z.ZodObject<{
    notificationId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    notificationId: string;
}, {
    notificationId: string;
}>;
export declare const PaginationSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
}, {
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare const ApiResponseSchema: <T extends z.ZodTypeAny>(dataSchema: T) => z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodObject<{
        error: z.ZodString;
        code: z.ZodNumber;
        timestamp: z.ZodNumber;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        code: number;
        error: string;
        timestamp: number;
        details?: Record<string, any> | undefined;
    }, {
        code: number;
        error: string;
        timestamp: number;
        details?: Record<string, any> | undefined;
    }>>;
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    success: z.ZodBoolean;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodObject<{
        error: z.ZodString;
        code: z.ZodNumber;
        timestamp: z.ZodNumber;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        code: number;
        error: string;
        timestamp: number;
        details?: Record<string, any> | undefined;
    }, {
        code: number;
        error: string;
        timestamp: number;
        details?: Record<string, any> | undefined;
    }>>;
    timestamp: z.ZodNumber;
}>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
    success: z.ZodBoolean;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodObject<{
        error: z.ZodString;
        code: z.ZodNumber;
        timestamp: z.ZodNumber;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        code: number;
        error: string;
        timestamp: number;
        details?: Record<string, any> | undefined;
    }, {
        code: number;
        error: string;
        timestamp: number;
        details?: Record<string, any> | undefined;
    }>>;
    timestamp: z.ZodNumber;
}> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;
export declare const validatePaymentAmount: (amount: number, serviceType: string) => boolean;
export declare const validateQRCodeExpiration: (expiresAt: Date) => boolean;
export declare const validateMunicipalityCode: (code: string) => boolean;
