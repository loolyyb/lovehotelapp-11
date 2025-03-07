
/**
 * Type definitions for the message cache
 */

// Cache structure with timestamps to track age
export type CachedData = {
  messages: any[];
  timestamp: number;
};

// Map type for the message cache
export type MessageCacheMap = Map<string, CachedData>;
