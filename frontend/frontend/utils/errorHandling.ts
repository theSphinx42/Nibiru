import { toast } from 'react-hot-toast';
import { ApiError } from '../types';

export class ApiErrorHandler {
  static handle(error: unknown, fallbackMessage = 'An error occurred'): ApiError {
    let apiError: ApiError;

    if (error instanceof Error) {
      apiError = {
        message: error.message,
        code: 'UNKNOWN_ERROR',
        status: 500
      };
    } else if (typeof error === 'string') {
      apiError = {
        message: error,
        code: 'UNKNOWN_ERROR',
        status: 500
      };
    } else {
      apiError = {
        message: fallbackMessage,
        code: 'UNKNOWN_ERROR',
        status: 500
      };
    }

    // Log error to monitoring service (if implemented)
    console.error('API Error:', apiError);

    return apiError;
  }

  static showError(error: unknown, fallbackMessage = 'An error occurred') {
    const apiError = this.handle(error, fallbackMessage);
    toast.error(apiError.message);
  }
} 