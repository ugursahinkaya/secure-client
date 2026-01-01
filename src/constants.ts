/**
 * Error messages used throughout the application
 */
export const ErrorMessages = {
  CLIENT_NOT_INITIALIZED: 'SecureClient not initialized. Call fetchApiInit() when autoInit=false',
  DOMAIN_REQUIRED: 'Domain is required for initialization',
  LOGIN_FAILED: 'Login failed',
  API_CALL_FAILED: 'API call failed',
  WELCOME_FAILED: 'Welcome failed',
  UNKNOWN_ERROR: 'Unknown error',
  NATIVE_BRIDGE_NOT_INITIALIZED: 'Native bridge not initialized',
} as const;

/**
 * API endpoints
 */
export const ApiEndpoints = {
  LOGIN: '/login',
  LOGOUT: '/logout',
  WHOAMI: '/whoami',
  REGISTER: '/register',
  RESET_PASSWORD: '/resetPassword',
  CHANGE_PASSWORD: '/changePassword',
  VALIDATE: '/validate',
  GET_USER_DATA: '/getUserData',
  CHECK_USERNAME: '/checkUserName',
  REFRESH_TOKEN: '/refreshToken',
} as const;

/**
 * Event names
 */
export const EventNames = {
  INITIALIZED: 'initialized',
  LOGIN_SUCCESS: 'login-success',
  LOGIN_ERROR: 'login-error',
  LOGOUT: 'logout',
  LOGGED_IN: 'loggedIn',
  LOGGED_OUT: 'loggedOut',
  LOGIN_ERROR_CALL: 'loginError',
} as const;

/**
 * Log levels
 */
export const LogLevels = {
  TRACE: 'trace',
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;
