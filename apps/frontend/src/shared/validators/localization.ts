import { z } from 'zod';

/**
 * Zod validation schemas for localization configuration
 */

export const DateFormatOptionsSchema = z.object({
  era: z.enum(['buddhist', 'gregorian']).default('buddhist'),
  numerals: z.enum(['thai', 'arabic']).default('arabic'),
  includeEraPrefix: z.boolean().default(true)
});

export const PrinterLocalizationSettingsSchema = z.object({
  useThaiNumerals: z.boolean().default(true),
  includeBuddhistEra: z.boolean().default(true),
  currencyFormat: z.enum(['thai', 'international']).default('thai')
});

export const LocalizationConfigSchema = z.object({
  enableBuddhistEra: z.boolean().default(true),
  enableThaiNumeralsForPrint: z.boolean().default(true),
  defaultDateFormat: DateFormatOptionsSchema,
  printerSettings: PrinterLocalizationSettingsSchema
});

/**
 * Validation schemas for print data
 */
export const CustomerInfoSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional()
});

export const PrintableItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  totalPrice: z.number().nonnegative()
});

export const PrintableDocumentSchema = z.object({
  id: z.string().min(1),
  date: z.date(),
  items: z.array(PrintableItemSchema).min(1),
  totalAmount: z.number().nonnegative(),
  customerInfo: CustomerInfoSchema.optional()
});

/**
 * Validation functions
 */
export const validateLocalizationConfig = (config: unknown) => {
  return LocalizationConfigSchema.parse(config);
};

export const validatePrintableDocument = (document: unknown) => {
  return PrintableDocumentSchema.parse(document);
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
