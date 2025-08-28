"use strict";
/**
 * Type definitions for Thai localization system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalizationError = exports.LocalizationErrorType = void 0;
/**
 * Error types for localization operations
 */
var LocalizationErrorType;
(function (LocalizationErrorType) {
    LocalizationErrorType["INVALID_NUMBER_FORMAT"] = "INVALID_NUMBER_FORMAT";
    LocalizationErrorType["INVALID_DATE_FORMAT"] = "INVALID_DATE_FORMAT";
    LocalizationErrorType["CONFIG_LOAD_ERROR"] = "CONFIG_LOAD_ERROR";
    LocalizationErrorType["PRINTER_FORMAT_ERROR"] = "PRINTER_FORMAT_ERROR";
})(LocalizationErrorType || (exports.LocalizationErrorType = LocalizationErrorType = {}));
/**
 * Custom error class for localization operations
 */
class LocalizationError extends Error {
    constructor(type, message, originalValue) {
        super(message);
        this.type = type;
        this.originalValue = originalValue;
        this.name = 'LocalizationError';
    }
}
exports.LocalizationError = LocalizationError;
