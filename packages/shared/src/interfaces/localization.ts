/**
 * Core interfaces for Thai number and date localization
 */

export interface NumberConverter {
  /**
   * Converts Arabic numerals (0-9) to Thai numerals (๐-๙)
   */
  toThaiNumerals(input: string | number): string;
  
  /**
   * Converts Thai numerals (๐-๙) to Arabic numerals (0-9)
   */
  toArabicNumerals(input: string): string;
  
  /**
   * Formats currency amounts with appropriate numeral system
   */
  formatCurrency(amount: number, locale: 'thai' | 'arabic'): string;
}

export interface DateConverter {
  /**
   * Converts Gregorian year to Buddhist Era year (adds 543 years)
   */
  toBuddhistEra(gregorianYear: number): number;
  
  /**
   * Converts Buddhist Era year to Gregorian year (subtracts 543 years)
   */
  toGregorian(buddhistYear: number): number;
  
  /**
   * Formats date according to specified options
   */
  formatDate(date: Date, options: DateFormatOptions): string;
}

export interface DateFormatOptions {
  era: 'buddhist' | 'gregorian';
  numerals: 'thai' | 'arabic';
  includeEraPrefix: boolean;
}

export interface PrinterLocalizationSettings {
  useThaiNumerals: boolean;
  includeBuddhistEra: boolean;
  currencyFormat: 'thai' | 'international';
}

export interface LocalizationConfig {
  enableBuddhistEra: boolean;
  enableThaiNumeralsForPrint: boolean;
  defaultDateFormat: DateFormatOptions;
  printerSettings: PrinterLocalizationSettings;
}

export interface LocalizationService {
  /**
   * Get current localization configuration
   */
  getConfig(): LocalizationConfig;
  
  /**
   * Update localization configuration
   */
  updateConfig(config: Partial<LocalizationConfig>): Promise<void>;
  
  /**
   * Get number converter instance
   */
  getNumberConverter(): NumberConverter;
  
  /**
   * Get date converter instance
   */
  getDateConverter(): DateConverter;
}