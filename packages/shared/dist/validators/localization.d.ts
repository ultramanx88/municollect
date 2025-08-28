import { z } from 'zod';
/**
 * Zod validation schemas for localization configuration
 */
export declare const DateFormatOptionsSchema: z.ZodObject<{
    era: z.ZodDefault<z.ZodEnum<["buddhist", "gregorian"]>>;
    numerals: z.ZodDefault<z.ZodEnum<["thai", "arabic"]>>;
    includeEraPrefix: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    era: "buddhist" | "gregorian";
    numerals: "thai" | "arabic";
    includeEraPrefix: boolean;
}, {
    era?: "buddhist" | "gregorian" | undefined;
    numerals?: "thai" | "arabic" | undefined;
    includeEraPrefix?: boolean | undefined;
}>;
export declare const PrinterLocalizationSettingsSchema: z.ZodObject<{
    useThaiNumerals: z.ZodDefault<z.ZodBoolean>;
    includeBuddhistEra: z.ZodDefault<z.ZodBoolean>;
    currencyFormat: z.ZodDefault<z.ZodEnum<["thai", "international"]>>;
}, "strip", z.ZodTypeAny, {
    useThaiNumerals: boolean;
    includeBuddhistEra: boolean;
    currencyFormat: "thai" | "international";
}, {
    useThaiNumerals?: boolean | undefined;
    includeBuddhistEra?: boolean | undefined;
    currencyFormat?: "thai" | "international" | undefined;
}>;
export declare const LocalizationConfigSchema: z.ZodObject<{
    enableBuddhistEra: z.ZodDefault<z.ZodBoolean>;
    enableThaiNumeralsForPrint: z.ZodDefault<z.ZodBoolean>;
    defaultDateFormat: z.ZodObject<{
        era: z.ZodDefault<z.ZodEnum<["buddhist", "gregorian"]>>;
        numerals: z.ZodDefault<z.ZodEnum<["thai", "arabic"]>>;
        includeEraPrefix: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        era: "buddhist" | "gregorian";
        numerals: "thai" | "arabic";
        includeEraPrefix: boolean;
    }, {
        era?: "buddhist" | "gregorian" | undefined;
        numerals?: "thai" | "arabic" | undefined;
        includeEraPrefix?: boolean | undefined;
    }>;
    printerSettings: z.ZodObject<{
        useThaiNumerals: z.ZodDefault<z.ZodBoolean>;
        includeBuddhistEra: z.ZodDefault<z.ZodBoolean>;
        currencyFormat: z.ZodDefault<z.ZodEnum<["thai", "international"]>>;
    }, "strip", z.ZodTypeAny, {
        useThaiNumerals: boolean;
        includeBuddhistEra: boolean;
        currencyFormat: "thai" | "international";
    }, {
        useThaiNumerals?: boolean | undefined;
        includeBuddhistEra?: boolean | undefined;
        currencyFormat?: "thai" | "international" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    enableBuddhistEra: boolean;
    enableThaiNumeralsForPrint: boolean;
    defaultDateFormat: {
        era: "buddhist" | "gregorian";
        numerals: "thai" | "arabic";
        includeEraPrefix: boolean;
    };
    printerSettings: {
        useThaiNumerals: boolean;
        includeBuddhistEra: boolean;
        currencyFormat: "thai" | "international";
    };
}, {
    defaultDateFormat: {
        era?: "buddhist" | "gregorian" | undefined;
        numerals?: "thai" | "arabic" | undefined;
        includeEraPrefix?: boolean | undefined;
    };
    printerSettings: {
        useThaiNumerals?: boolean | undefined;
        includeBuddhistEra?: boolean | undefined;
        currencyFormat?: "thai" | "international" | undefined;
    };
    enableBuddhistEra?: boolean | undefined;
    enableThaiNumeralsForPrint?: boolean | undefined;
}>;
/**
 * Validation schemas for print data
 */
export declare const CustomerInfoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    address?: string | undefined;
    phone?: string | undefined;
}, {
    name?: string | undefined;
    address?: string | undefined;
    phone?: string | undefined;
}>;
export declare const PrintableItemSchema: z.ZodObject<{
    name: z.ZodString;
    quantity: z.ZodNumber;
    unitPrice: z.ZodNumber;
    totalPrice: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}, {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}>;
export declare const PrintableDocumentSchema: z.ZodObject<{
    id: z.ZodString;
    date: z.ZodDate;
    items: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        totalPrice: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }, {
        name: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }>, "many">;
    totalAmount: z.ZodNumber;
    customerInfo: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        address?: string | undefined;
        phone?: string | undefined;
    }, {
        name?: string | undefined;
        address?: string | undefined;
        phone?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    date: Date;
    items: {
        name: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }[];
    totalAmount: number;
    customerInfo?: {
        name?: string | undefined;
        address?: string | undefined;
        phone?: string | undefined;
    } | undefined;
}, {
    id: string;
    date: Date;
    items: {
        name: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }[];
    totalAmount: number;
    customerInfo?: {
        name?: string | undefined;
        address?: string | undefined;
        phone?: string | undefined;
    } | undefined;
}>;
/**
 * Validation functions
 */
export declare const validateLocalizationConfig: (config: unknown) => {
    enableBuddhistEra: boolean;
    enableThaiNumeralsForPrint: boolean;
    defaultDateFormat: {
        era: "buddhist" | "gregorian";
        numerals: "thai" | "arabic";
        includeEraPrefix: boolean;
    };
    printerSettings: {
        useThaiNumerals: boolean;
        includeBuddhistEra: boolean;
        currencyFormat: "thai" | "international";
    };
};
export declare const validatePrintableDocument: (document: unknown) => {
    id: string;
    date: Date;
    items: {
        name: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }[];
    totalAmount: number;
    customerInfo?: {
        name?: string | undefined;
        address?: string | undefined;
        phone?: string | undefined;
    } | undefined;
};
/**
 * Type inference from schemas
 */
export type ValidatedLocalizationConfig = z.infer<typeof LocalizationConfigSchema>;
export type ValidatedDateFormatOptions = z.infer<typeof DateFormatOptionsSchema>;
export type ValidatedPrinterSettings = z.infer<typeof PrinterLocalizationSettingsSchema>;
export type ValidatedPrintableDocument = z.infer<typeof PrintableDocumentSchema>;
export type ValidatedPrintableItem = z.infer<typeof PrintableItemSchema>;
export type ValidatedCustomerInfo = z.infer<typeof CustomerInfoSchema>;
