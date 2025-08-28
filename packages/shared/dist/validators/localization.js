"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePrintableDocument = exports.validateLocalizationConfig = exports.PrintableDocumentSchema = exports.PrintableItemSchema = exports.CustomerInfoSchema = exports.LocalizationConfigSchema = exports.PrinterLocalizationSettingsSchema = exports.DateFormatOptionsSchema = void 0;
const zod_1 = require("zod");
/**
 * Zod validation schemas for localization configuration
 */
exports.DateFormatOptionsSchema = zod_1.z.object({
    era: zod_1.z.enum(['buddhist', 'gregorian']).default('buddhist'),
    numerals: zod_1.z.enum(['thai', 'arabic']).default('arabic'),
    includeEraPrefix: zod_1.z.boolean().default(true)
});
exports.PrinterLocalizationSettingsSchema = zod_1.z.object({
    useThaiNumerals: zod_1.z.boolean().default(true),
    includeBuddhistEra: zod_1.z.boolean().default(true),
    currencyFormat: zod_1.z.enum(['thai', 'international']).default('thai')
});
exports.LocalizationConfigSchema = zod_1.z.object({
    enableBuddhistEra: zod_1.z.boolean().default(true),
    enableThaiNumeralsForPrint: zod_1.z.boolean().default(true),
    defaultDateFormat: exports.DateFormatOptionsSchema,
    printerSettings: exports.PrinterLocalizationSettingsSchema
});
/**
 * Validation schemas for print data
 */
exports.CustomerInfoSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional()
});
exports.PrintableItemSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    quantity: zod_1.z.number().positive(),
    unitPrice: zod_1.z.number().nonnegative(),
    totalPrice: zod_1.z.number().nonnegative()
});
exports.PrintableDocumentSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    date: zod_1.z.date(),
    items: zod_1.z.array(exports.PrintableItemSchema).min(1),
    totalAmount: zod_1.z.number().nonnegative(),
    customerInfo: exports.CustomerInfoSchema.optional()
});
/**
 * Validation functions
 */
const validateLocalizationConfig = (config) => {
    return exports.LocalizationConfigSchema.parse(config);
};
exports.validateLocalizationConfig = validateLocalizationConfig;
const validatePrintableDocument = (document) => {
    return exports.PrintableDocumentSchema.parse(document);
};
exports.validatePrintableDocument = validatePrintableDocument;
