// Test file to verify all localization exports are working
import {
  // Interfaces
  NumberConverter,
  DateConverter,
  LocalizationConfig,
  LocalizationService,
  
  // Types
  ThaiNumeral,
  ArabicNumeral,
  LocalizationError,
  LocalizationErrorType,
  
  // Constants
  ARABIC_TO_THAI_NUMERALS,
  THAI_TO_ARABIC_NUMERALS,
  BUDDHIST_ERA_OFFSET,
  DEFAULT_LOCALIZATION_CONFIG,
  
  // Validators
  LocalizationConfigSchema,
  validateLocalizationConfig
} from './src/index';

// Test that all imports are available
console.log('All localization exports are available:', {
  NumberConverter: typeof NumberConverter,
  DateConverter: typeof DateConverter,
  LocalizationConfig: typeof LocalizationConfig,
  LocalizationService: typeof LocalizationService,
  ThaiNumeral: typeof ThaiNumeral,
  ArabicNumeral: typeof ArabicNumeral,
  LocalizationError: typeof LocalizationError,
  LocalizationErrorType: typeof LocalizationErrorType,
  ARABIC_TO_THAI_NUMERALS: typeof ARABIC_TO_THAI_NUMERALS,
  THAI_TO_ARABIC_NUMERALS: typeof THAI_TO_ARABIC_NUMERALS,
  BUDDHIST_ERA_OFFSET: typeof BUDDHIST_ERA_OFFSET,
  DEFAULT_LOCALIZATION_CONFIG: typeof DEFAULT_LOCALIZATION_CONFIG,
  LocalizationConfigSchema: typeof LocalizationConfigSchema,
  validateLocalizationConfig: typeof validateLocalizationConfig
});

export {};