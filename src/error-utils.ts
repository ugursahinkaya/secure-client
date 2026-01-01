/**
 * Utility functions for error handling
 */

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown, fallback = 'Unknown error'): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('network') || 
           error.message.includes('fetch') ||
           error.message.includes('timeout');
  }
  return false;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(error: unknown, context?: string): {
  success: false;
  error: string;
} {
  const message = context 
    ? `${context}: ${getErrorMessage(error)}`
    : getErrorMessage(error);
    
  return {
    success: false,
    error: message
  };
}
