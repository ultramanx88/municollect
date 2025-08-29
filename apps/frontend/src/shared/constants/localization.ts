/**
 * Constants for Thai localization system
 */

/**
 * Mapping between Arabic and Thai numerals
 */
export const ARABIC_TO_THAI_NUMERALS: Record<string, string> = {
  '0': '๐',
  '1': '๑',
  '2': '๒',
  '3': '๓',
  '4': '๔',
  '5': '๕',
  '6': '๖',
  '7': '๗',
  '8': '๘',
  '9': '๙'
} as const;

/**
 * Mapping between Thai and Arabic numerals
 */
export const THAI_TO_ARABIC_NUMERALS: Record<string, string> = {
  '๐': '0',
  '๑': '1',
  '๒': '2',
  '๓': '3',
  '๔': '4',
  '๕': '5',
  '๖': '6',
  '๗': '7',
  '๘': '8',
  '๙': '9'
} as const;

/**
 * Buddhist Era constants
 */
export const BUDDHIST_ERA_OFFSET = 543;
export const BUDDHIST_ERA_PREFIX = 'พ.ศ.';
export const GREGORIAN_ERA_PREFIX = 'ค.ศ.';

/**
 * Currency formatting constants
 */
export const THAI_BAHT_SYMBOL = 'บาท';
export const THAI_BAHT_SYMBOL_SHORT = '฿';

/**
 * Default configuration values
 */
export const DEFAULT_LOCALIZATION_CONFIG = {
  enableBuddhistEra: true,
  enableThaiNumeralsForPrint: true,
  defaultDateFormat: {
    era: 'buddhist' as const,
    numerals: 'arabic' as const,
    includeEraPrefix: true
  },
  printerSettings: {
    useThaiNumerals: true,
    includeBuddhistEra: true,
    currencyFormat: 'thai' as const
  }
} as const;

/**
 * Regular expressions for validation
 */
export const ARABIC_NUMERAL_REGEX = /[0-9]/g;
export const THAI_NUMERAL_REGEX = /[๐-๙]/g;
export const MIXED_NUMERAL_REGEX = /[0-9๐-๙]/g;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  INVALID_NUMBER_FORMAT: 'Invalid number format provided',
  INVALID_DATE_FORMAT: 'Invalid date format provided',
  CONFIG_LOAD_ERROR: 'Failed to load localization configuration',
  PRINTER_FORMAT_ERROR: 'Failed to format content for printer',
  INVALID_THAI_NUMERAL: 'Invalid Thai numeral character',
  INVALID_ARABIC_NUMERAL: 'Invalid Arabic numeral character'
} as const;
