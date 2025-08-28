"use strict";
/**
 * Constants for Thai localization system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGES = exports.MIXED_NUMERAL_REGEX = exports.THAI_NUMERAL_REGEX = exports.ARABIC_NUMERAL_REGEX = exports.DEFAULT_LOCALIZATION_CONFIG = exports.THAI_BAHT_SYMBOL_SHORT = exports.THAI_BAHT_SYMBOL = exports.GREGORIAN_ERA_PREFIX = exports.BUDDHIST_ERA_PREFIX = exports.BUDDHIST_ERA_OFFSET = exports.THAI_TO_ARABIC_NUMERALS = exports.ARABIC_TO_THAI_NUMERALS = void 0;
/**
 * Mapping between Arabic and Thai numerals
 */
exports.ARABIC_TO_THAI_NUMERALS = {
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
};
/**
 * Mapping between Thai and Arabic numerals
 */
exports.THAI_TO_ARABIC_NUMERALS = {
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
};
/**
 * Buddhist Era constants
 */
exports.BUDDHIST_ERA_OFFSET = 543;
exports.BUDDHIST_ERA_PREFIX = 'พ.ศ.';
exports.GREGORIAN_ERA_PREFIX = 'ค.ศ.';
/**
 * Currency formatting constants
 */
exports.THAI_BAHT_SYMBOL = 'บาท';
exports.THAI_BAHT_SYMBOL_SHORT = '฿';
/**
 * Default configuration values
 */
exports.DEFAULT_LOCALIZATION_CONFIG = {
    enableBuddhistEra: true,
    enableThaiNumeralsForPrint: true,
    defaultDateFormat: {
        era: 'buddhist',
        numerals: 'arabic',
        includeEraPrefix: true
    },
    printerSettings: {
        useThaiNumerals: true,
        includeBuddhistEra: true,
        currencyFormat: 'thai'
    }
};
/**
 * Regular expressions for validation
 */
exports.ARABIC_NUMERAL_REGEX = /[0-9]/g;
exports.THAI_NUMERAL_REGEX = /[๐-๙]/g;
exports.MIXED_NUMERAL_REGEX = /[0-9๐-๙]/g;
/**
 * Error messages
 */
exports.ERROR_MESSAGES = {
    INVALID_NUMBER_FORMAT: 'Invalid number format provided',
    INVALID_DATE_FORMAT: 'Invalid date format provided',
    CONFIG_LOAD_ERROR: 'Failed to load localization configuration',
    PRINTER_FORMAT_ERROR: 'Failed to format content for printer',
    INVALID_THAI_NUMERAL: 'Invalid Thai numeral character',
    INVALID_ARABIC_NUMERAL: 'Invalid Arabic numeral character'
};
