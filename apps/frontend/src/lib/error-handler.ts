import { ApiError, NetworkError, ValidationError } from './api-client';
import { ERROR_CODES, HTTP_STATUS } from '@/shared';

// Error handler configuration
export interface ErrorHandlerConfig {
  showToast?: boolean;
  logError?: boolean;
  redirectOnAuth?: boolean;
  customHandler?: (error: Error) => void;
}

// Default error messages for different error types
const DEFAULT_ERROR_MESSAGES = {
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ERROR_CODES.AUTHENTICATION_ERROR]: 'Please log in to continue.',
  [ERROR_CODES.AUTHORIZATION_ERROR]: 'You do not have permission to perform this action.',
  [ERROR_CODES.NOT_FOUND_ERROR]: 'The requested resource was not found.',
  [ERROR_CODES.DUPLICATE_ERROR]: 'This item already exists.',
  [ERROR_CODES.PAYMENT_ERROR]: 'Payment processing failed. Please try again.',
  [ERROR_CODES.QR_CODE_ERROR]: 'QR code is invalid or expired.',
  [ERROR_CODES.NOTIFICATION_ERROR]: 'Failed to process notification.',
  [ERROR_CODES.DATABASE_ERROR]: 'A database error occurred. Please try again later.',
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'External service is temporarily unavailable.',
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'An internal server error occurred.',
} as const;

// User-friendly error messages based on HTTP status
const HTTP_ERROR_MESSAGES = {
  [HTTP_STATUS.BAD_REQUEST]: 'Invalid request. Please check your input.',
  [HTTP_STATUS.UNAUTHORIZED]: 'Authentication required. Please log in.',
  [HTTP_STATUS.FORBIDDEN]: 'Access denied. You do not have permission.',
  [HTTP_STATUS.NOT_FOUND]: 'Resource not found.',
  [HTTP_STATUS.CONFLICT]: 'Conflict detected. The resource may already exist.',
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'Unable to process the request.',
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Server error. Please try again later.',
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable.',
} as const;

/**
 * Global error handler class
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private config: ErrorHandlerConfig = {
    showToast: true,
    logError: true,
    redirectOnAuth: true,
  };

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Configure the error handler
   */
  configure(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Handle any error with appropriate user feedback
   */
  handle(error: unknown, context?: string): void {
    const processedError = this.processError(error);
    
    if (this.config.logError) {
      this.logError(processedError, context);
    }

    if (this.config.customHandler) {
      this.config.customHandler(processedError);
      return;
    }

    // Handle authentication errors
    if (this.isAuthError(processedError) && this.config.redirectOnAuth) {
      this.handleAuthError();
      return;
    }

    // Show user-friendly message
    if (this.config.showToast) {
      this.showErrorMessage(processedError);
    }
  }

  /**
   * Process raw error into a standardized format
   */
  private processError(error: unknown): Error {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof NetworkError) {
      return error;
    }

    if (error instanceof Error) {
      return error;
    }

    // Handle string errors
    if (typeof error === 'string') {
      return new Error(error);
    }

    // Handle unknown errors
    return new Error('An unexpected error occurred');
  }

  /**
   * Check if error is authentication related
   */
  private isAuthError(error: Error): boolean {
    if (error instanceof ApiError) {
      return error.status === HTTP_STATUS.UNAUTHORIZED || 
             error.code === ERROR_CODES.AUTHENTICATION_ERROR;
    }
    return false;
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(): void {
    // Clear tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('municollect_access_token');
      localStorage.removeItem('municollect_refresh_token');
      localStorage.removeItem('municollect_token_expires_at');
    }

    // Redirect to login (you might want to use your router here)
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  /**
   * Log error for debugging
   */
  private logError(error: Error, context?: string): void {
    const logData = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    };

    if (error instanceof ApiError) {
      Object.assign(logData, {
        status: error.status,
        code: error.code,
        details: error.details,
      });
    }

    console.error('Error handled:', logData);

    // You could send this to an error tracking service like Sentry
    // Example: Sentry.captureException(error, { extra: logData });
  }

  /**
   * Show user-friendly error message
   */
  private showErrorMessage(error: Error): void {
    let message = error.message;

    if (error instanceof ApiError) {
      // Use predefined messages for known error codes
      message = DEFAULT_ERROR_MESSAGES[error.code as keyof typeof DEFAULT_ERROR_MESSAGES] ||
                HTTP_ERROR_MESSAGES[error.status as keyof typeof HTTP_ERROR_MESSAGES] ||
                error.message;
    }

    if (error instanceof NetworkError) {
      message = 'Network connection failed. Please check your internet connection and try again.';
    }

    // You would integrate with your toast/notification system here
    // For now, we'll just log it
    console.warn('User error message:', message);
    
    // Example integration with a toast library:
    // toast.error(message);
  }

  /**
   * Get user-friendly error message without handling
   */
  getErrorMessage(error: unknown): string {
    const processedError = this.processError(error);

    if (processedError instanceof ApiError) {
      return DEFAULT_ERROR_MESSAGES[processedError.code as keyof typeof DEFAULT_ERROR_MESSAGES] ||
             HTTP_ERROR_MESSAGES[processedError.status as keyof typeof HTTP_ERROR_MESSAGES] ||
             processedError.message;
    }

    if (processedError instanceof NetworkError) {
      return 'Network connection failed. Please check your internet connection.';
    }

    return processedError.message || 'An unexpected error occurred';
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: unknown): boolean {
    const processedError = this.processError(error);

    if (processedError instanceof NetworkError) {
      return true;
    }

    if (processedError instanceof ApiError) {
      // Retry on server errors but not client errors
      return processedError.status >= 500;
    }

    return false;
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export const handleError = (error: unknown, context?: string) => {
  errorHandler.handle(error, context);
};

export const getErrorMessage = (error: unknown): string => {
  return errorHandler.getErrorMessage(error);
};

export const isRetryableError = (error: unknown): boolean => {
  return errorHandler.isRetryable(error);
};

// Error boundary helper for React
import React from 'react';

export const createErrorBoundary = (fallbackComponent: React.ComponentType<{ error: Error }>) => {
  return class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      errorHandler.handle(error, `React Error Boundary: ${errorInfo.componentStack}`);
    }

    render() {
      if (this.state.hasError && this.state.error) {
        const FallbackComponent = fallbackComponent;
        return React.createElement(FallbackComponent, { error: this.state.error });
      }

      return this.props.children;
    }
  };
};
