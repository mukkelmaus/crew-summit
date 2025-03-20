
import { toast } from '@/hooks/use-toast';

// Error types
export enum ErrorType {
  API = 'API Error',
  DATABASE = 'Database Error',
  VALIDATION = 'Validation Error',
  AUTHENTICATION = 'Authentication Error',
  AUTHORIZATION = 'Authorization Error',
  NETWORK = 'Network Error',
  UNKNOWN = 'Unknown Error'
}

// Error handling class
export class AppError extends Error {
  type: ErrorType;
  originalError?: any;
  
  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN, originalError?: any) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
    
    // Log error to console with additional context
    console.error(`[${type}] ${message}`, originalError);
  }
}

// Error handling middleware
export function handleError(error: any, showToast = true): AppError {
  let appError: AppError;
  
  // Convert to AppError if not already
  if (!(error instanceof AppError)) {
    // Check error type
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      appError = new AppError('Invalid response from server', ErrorType.API, error);
    } else if (error.name === 'TypeError' && error.message.includes('Network')) {
      appError = new AppError('Network connection issue', ErrorType.NETWORK, error);
    } else if (error.message?.includes('timeout')) {
      appError = new AppError('Request timed out', ErrorType.NETWORK, error);
    } else if (error.status === 401 || error.statusCode === 401) {
      appError = new AppError('Authentication required', ErrorType.AUTHENTICATION, error);
    } else if (error.status === 403 || error.statusCode === 403) {
      appError = new AppError('Not authorized', ErrorType.AUTHORIZATION, error);
    } else if (error.name === 'ValidationError') {
      appError = new AppError(error.message, ErrorType.VALIDATION, error);
    } else if (error.name === 'DBError' || error.message?.includes('database') || error.message?.includes('indexedDB')) {
      appError = new AppError('Database operation failed', ErrorType.DATABASE, error);
    } else {
      appError = new AppError(error.message || 'An unexpected error occurred', ErrorType.UNKNOWN, error);
    }
  } else {
    appError = error;
  }
  
  // Show toast if enabled
  if (showToast) {
    toast({
      title: appError.type,
      description: appError.message,
      variant: "destructive"
    });
  }
  
  return appError;
}

// Async function wrapper
export function withErrorHandling<T>(fn: () => Promise<T>, showToast = true): Promise<T> {
  return fn().catch(error => {
    throw handleError(error, showToast);
  });
}
