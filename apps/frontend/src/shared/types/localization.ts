/**
 * Type definitions for Thai localization system
 */

export type ThaiNumeral = '๐' | '๑' | '๒' | '๓' | '๔' | '๕' | '๖' | '๗' | '๘' | '๙';
export type ArabicNumeral = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export type LocaleType = 'thai' | 'arabic';
export type EraType = 'buddhist' | 'gregorian';
export type CurrencyFormat = 'thai' | 'international';

/**
 * Error types for localization operations
 */
export enum LocalizationErrorType {
  INVALID_NUMBER_FORMAT = 'INVALID_NUMBER_FORMAT',
  INVALID_DATE_FORMAT = 'INVALID_DATE_FORMAT',
  CONFIG_LOAD_ERROR = 'CONFIG_LOAD_ERROR',
  PRINTER_FORMAT_ERROR = 'PRINTER_FORMAT_ERROR'
}

/**
 * Custom error class for localization operations
 */
export class LocalizationError extends Error {
  constructor(
    public type: LocalizationErrorType,
    message: string,
    public originalValue?: any
  ) {
    super(message);
    this.name = 'LocalizationError';
  }
}

/**
 * Print-related types
 */
export interface PrintableDocument {
  id: string;
  date: Date;
  items: PrintableItem[];
  totalAmount: number;
  customerInfo?: CustomerInfo;
}

export interface PrintableItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomerInfo {
  name?: string;
  address?: string;
  phone?: string;
}

/**
 * Configuration update result
 */
export interface ConfigUpdateResult {
  success: boolean;
  errors?: string[];
  updatedConfig?: LocalizationConfig;
}

/**
 * Utility types for configuration
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Re-export interfaces for convenience
export type {
  NumberConverter,
  DateConverter,
  DateFormatOptions,
  PrinterLocalizationSettings,
  LocalizationConfig,
  LocalizationService
} from '../interfaces/localization';

// Import LocalizationConfig for use in this file
import type { LocalizationConfig } from '../interfaces/localization';
