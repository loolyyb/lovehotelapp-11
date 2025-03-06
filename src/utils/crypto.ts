
// Simple utility for password hashing and verification
// Note: This is for demo purposes only - in production, use better methods

/**
 * Simple hash function for admin password
 * This is not secure, just for demonstration
 */
export const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
};

/**
 * Verify if a provided password matches the expected hash
 */
export const verifyPassword = (password: string, expectedHash: string): boolean => {
  const hash = hashPassword(password);
  return hash === expectedHash;
};
