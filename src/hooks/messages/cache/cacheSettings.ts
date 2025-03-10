
/**
 * Settings for message cache to control memory usage and cache validity
 */

// Set a maximum cache size to prevent memory issues
export const MAX_CACHE_SIZE = 500; // Increased from 100

// Increase cache retention time to 60 minutes
export const MAX_CACHE_AGE_MS = 60 * 60 * 1000; // Increased from 20 minutes

// Cache key format helper
export const getCacheKey = (conversationId: string): string => 
  `${conversationId}_messages`;

// Get timestamp for freshness check
export const getCacheTimestampKey = (conversationId: string): string =>
  `${conversationId}_timestamp`;
