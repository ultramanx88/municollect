/**
 * Constants for Thai localization system
 */
/**
 * Mapping between Arabic and Thai numerals
 */
export declare const ARABIC_TO_THAI_NUMERALS: Record<string, string>;
/**
 * Mapping between Thai and Arabic numerals
 */
export declare const THAI_TO_ARABIC_NUMERALS: Record<string, string>;
/**
 * Buddhist Era constants
 */
export declare const BUDDHIST_ERA_OFFSET = 543;
export declare const BUDDHIST_ERA_PREFIX = "\u0E1E.\u0E28.";
export declare const GREGORIAN_ERA_PREFIX = "\u0E04.\u0E28.";
/**
 * Currency formatting constants
 */
export declare const THAI_BAHT_SYMBOL = "\u0E1A\u0E32\u0E17";
export declare const THAI_BAHT_SYMBOL_SHORT = "\u0E3F";
/**
 * Default configuration values
 */
export declare const DEFAULT_LOCALIZATION_CONFIG: {
    readonly enableBuddhistEra: true;
    readonly enableThaiNumeralsForPrint: true;
    readonly defaultDateFormat: {
        readonly era: "buddhist";
        readonly numerals: "arabic";
        readonly includeEraPrefix: true;
    };
    readonly printerSettings: {
        readonly useThaiNumerals: true;
        readonly includeBuddhistEra: true;
        readonly currencyFormat: "thai";
    };
};
/**
 * Regular expressions for validation
 */
export declare const ARABIC_NUMERAL_REGEX: RegExp;
export declare const THAI_NUMERAL_REGEX: RegExp;
export declare const MIXED_NUMERAL_REGEX: RegExp;
/**
 * Error messages
 */
export declare const ERROR_MESSAGES: {
    readonly INVALID_NUMBER_FORMAT: "Invalid number format provided";
    readonly INVALID_DATE_FORMAT: "Invalid date format provided";
    readonly CONFIG_LOAD_ERROR: "Failed to load localization configuration";
    readonly PRINTER_FORMAT_ERROR: "Failed to format content for printer";
    readonly INVALID_THAI_NUMERAL: "Invalid Thai numeral character";
    readonly INVALID_ARABIC_NUMERAL: "Invalid Arabic numeral character";
};
