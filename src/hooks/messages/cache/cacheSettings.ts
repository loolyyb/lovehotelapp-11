
/**
 * Settings for message cache to control memory usage and cache validity
 */

// Set a maximum cache size to prevent memory issues
export const MAX_CACHE_SIZE = 100; // Increased from 50

// Increase cache retention time to 20 minutes
export const MAX_CACHE_AGE_MS = 20 * 60 * 1000; // Increased from 10 minutes

// Cache key format helper
export const getCacheKey = (conversationId: string): string => 
  `${conversationId}_messages`;

// Get timestamp for freshness check
export const getCacheTimestampKey = (conversationId: string): string =>
  `${conversationId}_timestamp`;
