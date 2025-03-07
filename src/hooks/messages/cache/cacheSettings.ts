
/**
 * Settings for message cache to control memory usage and cache validity
 */

// Set a maximum cache size to prevent memory issues
export const MAX_CACHE_SIZE = 50;

// How long messages should be kept in cache (10 minutes)
export const MAX_CACHE_AGE_MS = 10 * 60 * 1000;

// Cache key format helper
export const getCacheKey = (conversationId: string): string => 
  `${conversationId}_messages`;
