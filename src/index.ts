// Main exports
export { SecureClient } from "./secure-client";
export { useSecureClient } from "./use-secure-client";

// Type exports
export type {
  SecureClientAPI,
  LoginState,
  LoginResponse,
  StateListener,
  UserData,
  NativeEvents,
  JsEvents
} from "./types";

// Constants exports
export { 
  ErrorMessages, 
  ApiEndpoints, 
  EventNames 
} from "./constants";

// Utility exports
export { 
  getErrorMessage, 
  isNetworkError, 
  createErrorResponse 
} from "./error-utils";

export {
  isValidUsername,
  isValidPassword,
  isValidEmail,
  isValidDomain,
  sanitizeInput
} from "./validation-utils";

