import { ApiError } from '../types';

export class ErrorHandler {
  static handle(error: unknown): ApiError {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'UNKNOWN_ERROR',
        status: 500
      };
    }

    if (typeof error === 'object' && error !== null) {
      const err = error as any;
      return {
        message: err.message || 'An error occurred',
        code: err.code || 'UNKNOWN_ERROR',
        status: err.status || 500
      };
    }

    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      status: 500
    };
  }

  static isNetworkError(error: ApiError): boolean {
    return error.status >= 500 || error.code === 'NETWORK_ERROR';
  }

  static isAuthError(error: ApiError): boolean {
    return error.status === 401 || error.code === 'UNAUTHORIZED';
  }

  static isValidationError(error: ApiError): boolean {
    return error.status === 400 || error.code === 'VALIDATION_ERROR';
  }
}
