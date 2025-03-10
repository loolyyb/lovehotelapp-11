
// Robust utility for password hashing and verification using bcrypt standards
import * as CryptoJS from 'crypto-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/LogService';
import { AlertService } from '@/services/AlertService';

/**
 * Constants for hashing
 */
const SALT_ROUNDS = 10;
const PEPPER = 'lovehotel_secure_pepper'; // Server-side secret

/**
 * Secure hash function for passwords
 */
export const hashPassword = (password: string): string => {
  try {
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
  } catch (error) {
    logger.error('Error in hashPassword:', { error });
    throw error;
  }
};

/**
 * Verify if a provided password matches the expected hash
 */
export const verifyPassword = (password: string, storedHash: string): boolean => {
  logger.info("Verifying password");
  
  try {
    if (!storedHash || !storedHash.includes(':')) {
      logger.warn("Invalid hash format", { storedHash });
      return false;
    }
    
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
    
    const isValid = calculatedHash === hash;
    logger.info("Password verification result", { isValid });
    return isValid;
  } catch (error) {
    logger.error('Error in verifyPassword:', { error });
    return false;
  }
};

/**
 * Updates the admin password in the database directly
 */
export async function updateAdminPassword(newPassword: string = "Reussite888!"): Promise<string> {
  logger.info("Updating admin password in database");
  try {
    // Generate a secure hash for the new password
    const secureHash = hashPassword(newPassword);
    logger.info("Generated secure hash for admin password");
    
    // Update the admin_settings table with the new hash
    const { error } = await supabase
      .from('admin_settings')
      .upsert({
        key: 'admin_password_hash',
        value: { hash: secureHash },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'key'
      });
    
    if (error) {
      logger.error("Failed to update admin password:", { error });
      AlertService.captureException(error as Error, {
        context: "updateAdminPassword"
      });
      throw error;
    }
    
    logger.info("Admin password updated successfully");
    return secureHash;
  } catch (error) {
    logger.error("Error updating admin password:", { error });
    AlertService.captureException(error as Error, {
      context: "updateAdminPassword"
    });
    throw error;
  }
}

