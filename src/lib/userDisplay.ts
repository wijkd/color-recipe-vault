/**
 * Utility functions for safely displaying user information
 */

/**
 * Checks if a string appears to be an email address
 */
export const isEmail = (str: string | null | undefined): boolean => {
  if (!str) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
};

/**
 * Returns a safe display name for a user, hiding email addresses
 * @param username - The username field from the profiles table
 * @param fallback - Fallback text if username is not available or is an email
 * @returns A safe display name
 */
export const getSafeUsername = (
  username: string | null | undefined,
  fallback: string = 'Anonymous User'
): string => {
  if (!username || isEmail(username)) {
    return fallback;
  }
  return username;
};
