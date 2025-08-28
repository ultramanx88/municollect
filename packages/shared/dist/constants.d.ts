export * from './constants';
export declare const SERVICE_TYPES: {
    readonly WASTE_MANAGEMENT: "waste_management";
    readonly WATER_BILL: "water_bill";
};
export declare const PAYMENT_STATUSES: {
    readonly PENDING: "pending";
    readonly COMPLETED: "completed";
    readonly FAILED: "failed";
    readonly EXPIRED: "expired";
};
export declare const USER_ROLES: {
    readonly RESIDENT: "resident";
    readonly MUNICIPAL_STAFF: "municipal_staff";
    readonly ADMIN: "admin";
};
export declare const NOTIFICATION_TYPES: {
    readonly PAYMENT_REMINDER: "payment_reminder";
    readonly PAYMENT_CONFIRMATION: "payment_confirmation";
    readonly PAYMENT_FAILED: "payment_failed";
    readonly SYSTEM_UPDATE: "system_update";
};
export declare const NOTIFICATION_STATUSES: {
    readonly SENT: "sent";
    readonly DELIVERED: "delivered";
    readonly READ: "read";
    readonly FAILED: "failed";
};
export declare const CURRENCIES: {
    readonly USD: "USD";
    readonly EUR: "EUR";
    readonly GBP: "GBP";
    readonly THB: "THB";
};
export declare const API_ENDPOINTS: {
    readonly AUTH_REGISTER: "/api/auth/register";
    readonly AUTH_LOGIN: "/api/auth/login";
    readonly AUTH_REFRESH: "/api/auth/refresh";
    readonly AUTH_LOGOUT: "/api/auth/logout";
    readonly USERS_PROFILE: "/api/users/profile";
    readonly USERS_MUNICIPALITIES: "/api/users/municipalities";
    readonly MUNICIPALITIES: "/api/municipalities";
    readonly MUNICIPALITY_BY_ID: "/api/municipalities/:id";
    readonly PAYMENTS_SERVICES: "/api/payments/services";
    readonly PAYMENTS_INITIATE: "/api/payments/initiate";
    readonly PAYMENTS_HISTORY: "/api/payments/history";
    readonly PAYMENT_STATUS: "/api/payments/:id/status";
    readonly QR_GENERATE: "/api/qr/generate";
    readonly QR_DETAILS: "/api/qr/:code/details";
    readonly NOTIFICATIONS_SEND: "/api/notifications/send";
    readonly NOTIFICATIONS_HISTORY: "/api/notifications/history";
    readonly NOTIFICATION_READ: "/api/notifications/:id/read";
    readonly LOCALIZATION_CONFIG: "/api/localization/config";
};
export declare const VALIDATION_LIMITS: {
    readonly PASSWORD_MIN_LENGTH: 6;
    readonly PASSWORD_MAX_LENGTH: 100;
    readonly NAME_MAX_LENGTH: 100;
    readonly MUNICIPALITY_CODE_MAX_LENGTH: 10;
    readonly NOTIFICATION_TITLE_MAX_LENGTH: 255;
    readonly NOTIFICATION_MESSAGE_MAX_LENGTH: 1000;
    readonly QR_CODE_EXPIRATION_MINUTES: 30;
    readonly MAX_PAYMENT_AMOUNT_WASTE: 10000;
    readonly MAX_PAYMENT_AMOUNT_WATER: 50000;
    readonly PAGINATION_MAX_LIMIT: 100;
    readonly PAGINATION_DEFAULT_LIMIT: 20;
};
export declare const ERROR_CODES: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR";
    readonly AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR";
    readonly NOT_FOUND_ERROR: "NOT_FOUND_ERROR";
    readonly DUPLICATE_ERROR: "DUPLICATE_ERROR";
    readonly PAYMENT_ERROR: "PAYMENT_ERROR";
    readonly QR_CODE_ERROR: "QR_CODE_ERROR";
    readonly NOTIFICATION_ERROR: "NOTIFICATION_ERROR";
    readonly DATABASE_ERROR: "DATABASE_ERROR";
    readonly EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR";
    readonly INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR";
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly SERVICE_UNAVAILABLE: 503;
};
