
// Robust utility for password hashing and verification using bcrypt standards
import * as CryptoJS from 'crypto-js';

/**
 * Constants for hashing
 */
const SALT_ROUNDS = 10;
const PEPPER = 'lovehotel_secure_pepper'; // Server-side secret

/**
 * Secure hash function for passwords
 * Uses PBKDF2 with SHA-256 and a high iteration count for security
 */
export const hashPassword = (password: string): string => {
  // Generate a random salt
  const salt = CryptoJS.lib.WordArray.random(16).toString();
  
  // Apply PBKDF2 with high iteration count 
  const hash = CryptoJS.PBKDF2(
    password + PEPPER, 
    salt, 
    { 
      keySize: 256 / 32, 
      iterations: 10000,
      hasher: CryptoJS.algo.SHA256
    }
  ).toString();
  
  // Store both the salt and hash together
  return `${salt}:${hash}`;
};

/**
 * Verify if a provided password matches the expected hash
 */
export const verifyPassword = (password: string, storedHash: string): boolean => {
  // Support legacy hash format (simple hash function)
  if (!storedHash.includes(':')) {
    // Legacy verification
    const legacyHash = legacyHashPassword(password);
    return legacyHash === storedHash;
  }
  
  // For new hash format (salt:hash)
  const [salt, hash] = storedHash.split(':');
  
  const calculatedHash = CryptoJS.PBKDF2(
    password + PEPPER, 
    salt, 
    { 
      keySize: 256 / 32, 
      iterations: 10000,
      hasher: CryptoJS.algo.SHA256
    }
  ).toString();
  
  return calculatedHash === hash;
};

/**
 * Legacy hash function for password compatibility
 * @deprecated Use hashPassword instead
 */
const legacyHashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
};

/**
 * Migrate a password from legacy format to new secure format
 * Returns the new hash that should be stored
 */
export const migratePassword = (password: string, legacyHash: string): string => {
  // Verify the password matches the legacy hash first
  const legacyVerified = legacyHashPassword(password) === legacyHash;
  
  if (!legacyVerified) {
    throw new Error("Password does not match legacy hash");
  }
  
  // Return a new secure hash
  return hashPassword(password);
};
