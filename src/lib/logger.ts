/**
 * Logger utility - Only logs in development mode
 * In production, errors are sanitized to avoid exposing sensitive data
 */

const isDev = import.meta.env.DEV;

// Sensitive keys that should never be logged
const SENSITIVE_KEYS = [
  'password', 'token', 'secret', 'api_key', 'apikey', 
  'authorization', 'cookie', 'session', 'credit_card',
  'ssn', 'private_key', 'access_token', 'refresh_token'
];

/**
 * Sanitize objects by removing sensitive information
 */
const sanitize = (data: any): any => {
  if (!data) return data;
  
  if (typeof data === 'string') {
    // Check if string looks like a token or secret
    if (data.length > 32 && /^[A-Za-z0-9_-]+$/.test(data)) {
      return '[REDACTED_TOKEN]';
    }
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitize(item));
  }
  
  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.some(sk => lowerKey.includes(sk))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitize(value);
      }
    }
    return sanitized;
  }
  
  return data;
};

export const logger = {
  /**
   * Log informational messages (dev only)
   */
  info: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  
  /**
   * Log warning messages (dev only)
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  
  /**
   * Log error messages (always logged but sanitized in production)
   */
  error: (message: string, error?: any) => {
    if (isDev) {
      console.error(message, error);
    } else {
      // In production, only log sanitized error info
      const sanitizedError = error ? {
        message: error?.message || 'Unknown error',
        type: error?.constructor?.name || 'Error'
      } : null;
      console.error(message, sanitizedError);
    }
  },
  
  /**
   * Log with sanitization (useful for logging user data)
   */
  safe: (message: string, data?: any) => {
    if (isDev) {
      console.log(message, sanitize(data));
    }
  }
};
