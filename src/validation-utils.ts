/**
 * Validation utilities
 */

/**
 * Validate username format
 */
export function isValidUsername(username: string): boolean {
  return username.length >= 3 && username.length <= 50;
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate domain format
 */
export function isValidDomain(domain: string): boolean {
  try {
    new URL(domain);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim();
}
