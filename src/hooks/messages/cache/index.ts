/**
 * Improved Message Cache System with two-level caching
 * Combines in-memory cache with IndexedDB persistence
 */
import { openDB, IDBPDatabase } from 'idb';
import { logger } from '@/services/LogService';

// Constants
const CACHE_VERSION = 1;
const CACHE_DB_NAME = 'message-cache-db';
const CONVERSATION_STORE = 'conversations';
const PROFILE_STORE = 'profiles';
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

// Memory cache
const memoryCache = new Map<string, {
  data: any[];
  timestamp: number;
  version: number;
}>();

// Types
type MessageCacheItem = {
  data: any[];
  timestamp: number;
  version: number;
};

/**
 * Main MessageCache implementation
 */
class MessageCacheImplementation {
  private db: IDBPDatabase | null = null;
  private dbPromise: Promise<IDBPDatabase> | null = null;
  private initPromise: Promise<void> | null = null;
  private pendingRequests = new Map<string, Promise<any[]>>();
  
  constructor() {
    this.init();
  }
  
  /**
   * Initialize the cache database
   */
  private async init() {
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = new Promise(async (resolve) => {
      try {
        this.dbPromise = openDB(CACHE_DB_NAME, CACHE_VERSION, {
          upgrade(db) {
            if (!db.objectStoreNames.contains(CONVERSATION_STORE)) {
              db.createObjectStore(CONVERSATION_STORE);
            }
            if (!db.objectStoreNames.contains(PROFILE_STORE)) {
              db.createObjectStore(PROFILE_STORE);
            }
          },
        });
        
        this.db = await this.dbPromise;
        logger.info('MessageCache: IndexedDB initialized successfully');
        resolve();
      } catch (error) {
        logger.error('MessageCache: Failed to initialize IndexedDB', { error });
        // Continue without IndexedDB
        resolve();
      }
    });
    
    return this.initPromise;
  }
  
  /**
   * Get messages from cache
   */
  async get(conversationId: string): Promise<any[] | null> {
    if (!conversationId) return null;
    
    // Check memory cache first
    const memCache = memoryCache.get(conversationId);
    if (memCache && Date.now() - memCache.timestamp < CACHE_EXPIRY) {
      logger.info('MessageCache: Using memory cache', { 
        conversationId, 
        messageCount: memCache.data.length 
      });
      return memCache.data;
    }
    
    // Try to get from IndexedDB
    try {
      await this.init();
      if (this.db) {
        const cachedItem = await this.db.get(CONVERSATION_STORE, conversationId) as MessageCacheItem;
        if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_EXPIRY) {
          // Update memory cache
          memoryCache.set(conversationId, cachedItem);
          logger.info('MessageCache: Using IndexedDB cache', { 
            conversationId, 
            messageCount: cachedItem.data.length 
          });
          return cachedItem.data;
        }
      }
    } catch (error) {
      logger.error('MessageCache: Error reading from IndexedDB', { 
        error,
        conversationId
      });
    }
    
    return null;
  }
  
  /**
   * Store messages in cache
   */
  async set(conversationId: string, messages: any[]): Promise<void> {
    if (!conversationId || !messages || messages.length === 0) return;
    
    const cacheItem: MessageCacheItem = {
      data: messages,
      timestamp: Date.now(),
      version: CACHE_VERSION
    };
    
    // Update memory cache
    memoryCache.set(conversationId, cacheItem);
    
    // Update IndexedDB cache
    try {
      await this.init();
      if (this.db) {
        await this.db.put(CONVERSATION_STORE, cacheItem, conversationId);
        logger.info('MessageCache: Updated IndexedDB cache', { 
          conversationId, 
          messageCount: messages.length 
        });
      }
    } catch (error) {
      logger.error('MessageCache: Error writing to IndexedDB', { 
        error,
        conversationId
      });
    }
  }
  
  /**
   * Check if messages exist in cache
   */
  has(conversationId: string): boolean {
    if (!conversationId) return false;
    return memoryCache.has(conversationId);
  }
  
  /**
   * Add a single message to the cache
   */
  addMessage(conversationId: string, message: any): boolean {
    if (!conversationId || !message) return false;
    
    // Get existing cache
    const existingCache = memoryCache.get(conversationId);
    if (!existingCache) return false;
    
    // Check for duplicate message
    const isDuplicate = existingCache.data.some(m => m.id === message.id);
    if (isDuplicate) return false;
    
    // Add message to cache
    const updatedMessages = [...existingCache.data, message];
    this.set(conversationId, updatedMessages);
    return true;
  }
  
  /**
   * Clear a specific conversation from cache
   */
  async clearConversation(conversationId: string): Promise<void> {
    if (!conversationId) return;
    
    // Remove from memory cache
    memoryCache.delete(conversationId);
    
    // Remove from IndexedDB
    try {
      await this.init();
      if (this.db) {
        await this.db.delete(CONVERSATION_STORE, conversationId);
        logger.info('MessageCache: Cleared conversation from cache', { conversationId });
      }
    } catch (error) {
      logger.error('MessageCache: Error clearing conversation from IndexedDB', { 
        error,
        conversationId
      });
    }
  }
  
  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    // Clear memory cache
    memoryCache.clear();
    
    // Clear IndexedDB
    try {
      await this.init();
      if (this.db) {
        await this.db.clear(CONVERSATION_STORE);
        await this.db.clear(PROFILE_STORE);
        logger.info('MessageCache: Cleared all cache');
      }
    } catch (error) {
      logger.error('MessageCache: Error clearing all cache from IndexedDB', { error });
    }
  }
  
  /**
   * Check for newer messages and update cache if needed
   * @returns The updated messages array or null
   */
  async checkForNewerMessages(supabase: any, conversationId: string, cachedMessages: any[]): Promise<any[] | null> {
    if (!conversationId || !cachedMessages || cachedMessages.length === 0) return cachedMessages;
    
    try {
      // Get latest message timestamp
      const latestTimestamp = Math.max(
        ...cachedMessages.map(msg => new Date(msg.created_at).getTime())
      );
      
      // Check for newer messages
      const { data: newerMessages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .gt('created_at', new Date(latestTimestamp).toISOString())
        .order('created_at', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (newerMessages && newerMessages.length > 0) {
        logger.info('MessageCache: Found newer messages', { 
          conversationId, 
          count: newerMessages.length 
        });
        
        // Add to cache
        const updatedMessages = [...cachedMessages, ...newerMessages];
        this.set(conversationId, updatedMessages);
        return updatedMessages;
      }
      
      // Return the original messages if no newer ones were found
      return cachedMessages;
    } catch (error) {
      logger.error('MessageCache: Error checking for newer messages', { 
        error,
        conversationId
      });
      // Return the original messages in case of error
      return cachedMessages;
    }
  }
  
  /**
   * Record a pending request to deduplicate concurrent fetches
   */
  registerPendingRequest(key: string, promise: Promise<any[]>): void {
    this.pendingRequests.set(key, promise);
    
    // Cleanup after completion
    promise.finally(() => {
      setTimeout(() => {
        if (this.pendingRequests.get(key) === promise) {
          this.pendingRequests.delete(key);
        }
      }, 1000); // Keep for 1 second to handle near-simultaneous requests
    });
  }
  
  /**
   * Get a pending request if one exists
   */
  getPendingRequest(key: string): Promise<any[]> | undefined {
    return this.pendingRequests.get(key);
  }
  
  /**
   * Prefetch profiles for common contacts
   */
  async prefetchProfiles(supabase: any, profileIds: string[]): Promise<void> {
    if (!profileIds || profileIds.length === 0) return;
    
    try {
      await this.init();
      
      // Get profiles from Supabase
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', profileIds);
      
      if (error) {
        throw error;
      }
      
      if (profiles && profiles.length > 0 && this.db) {
        // Store each profile in IndexedDB
        const tx = this.db.transaction(PROFILE_STORE, 'readwrite');
        
        for (const profile of profiles) {
          await tx.store.put({
            data: profile,
            timestamp: Date.now(),
            version: CACHE_VERSION
          }, profile.id);
        }
        
        await tx.done;
        logger.info('MessageCache: Prefetched profiles', { count: profiles.length });
      }
    } catch (error) {
      logger.error('MessageCache: Error prefetching profiles', { error });
    }
  }
}

// Singleton instance
export const MessageCache = new MessageCacheImplementation();
