
import { useState, useCallback, useRef } from "react";
import { logger } from "@/services/LogService";

// Global conversation cache with optimized storage
const conversationsCache = new Map<string, any[]>();
const profilesCache = new Map<string, any>();
const lastUpdateTimes = new Map<string, number>();

export const useConversationCache = () => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const cacheOperationsInProgress = useRef(new Set<string>());
  
  // Cache timeout in milliseconds (5 minutes)
  const CACHE_TTL = 5 * 60 * 1000;
  
  // Check if cache is valid based on profile ID and last update
  const isCacheValid = useCallback((profileId: string) => {
    if (!conversationsCache.has(profileId)) return false;
    
    const now = new Date().getTime();
    const lastUpdateTime = lastUpdateTimes.get(profileId) || 0;
    
    return (now - lastUpdateTime) < CACHE_TTL;
  }, []);
  
  // Get conversations from cache with proper validation
  const getCachedConversations = useCallback((profileId: string) => {
    if (!profileId || !conversationsCache.has(profileId)) return null;
    
    const cachedData = conversationsCache.get(profileId);
    if (!cachedData || cachedData.length === 0) return null;
    
    // Check if cache is still valid
    if (!isCacheValid(profileId)) {
      logger.info("Cache expired for profile", {
        profileId,
        component: "useConversationCache"
      });
      return null;
    }
    
    logger.info("Using cached conversations", {
      profileId,
      count: cachedData.length,
      component: "useConversationCache"
    });
    
    return cachedData;
  }, [isCacheValid]);
  
  // Cache conversations for a profile with operation deduplication
  const cacheConversations = useCallback((profileId: string, conversations: any[]) => {
    if (!profileId || conversations.length === 0) return;
    
    // Skip if an operation is already in progress for this profile
    const cacheKey = `cache_${profileId}`;
    if (cacheOperationsInProgress.current.has(cacheKey)) {
      logger.info("Cache operation already in progress, skipping", {
        profileId,
        component: "useConversationCache"
      });
      return;
    }
    
    cacheOperationsInProgress.current.add(cacheKey);
    
    try {
      logger.info("Caching conversations", {
        profileId,
        count: conversations.length,
        component: "useConversationCache"
      });
      
      conversationsCache.set(profileId, [...conversations]);
      lastUpdateTimes.set(profileId, Date.now());
      setLastUpdate(new Date());
    } finally {
      // Remove from in-progress set after a short delay
      setTimeout(() => {
        cacheOperationsInProgress.current.delete(cacheKey);
      }, 300);
    }
  }, []);
  
  // Update a specific conversation in cache
  const updateCachedConversation = useCallback((profileId: string, conversationId: string, updatedData: any) => {
    if (!profileId || !conversationsCache.has(profileId)) return;
    
    const conversations = conversationsCache.get(profileId) || [];
    
    // Find the conversation index
    const index = conversations.findIndex(conv => conv.id === conversationId);
    if (index === -1) return;
    
    // Create a new array with the updated conversation
    const updatedConversations = [
      ...conversations.slice(0, index),
      { ...conversations[index], ...updatedData },
      ...conversations.slice(index + 1)
    ];
    
    conversationsCache.set(profileId, updatedConversations);
    lastUpdateTimes.set(profileId, Date.now());
    setLastUpdate(new Date());
    
    logger.info("Updated conversation in cache", {
      profileId,
      conversationId,
      component: "useConversationCache"
    });
  }, []);
  
  // Cache a user profile
  const cacheProfile = useCallback((profileId: string, profileData: any) => {
    if (!profileId || !profileData) return;
    
    profilesCache.set(profileId, profileData);
  }, []);
  
  // Get a cached profile
  const getCachedProfile = useCallback((profileId: string) => {
    if (!profileId) return null;
    return profilesCache.get(profileId);
  }, []);
  
  // Clear the cache
  const clearCache = useCallback(() => {
    conversationsCache.clear();
    profilesCache.clear();
    lastUpdateTimes.clear();
    logger.info("Conversation and profile caches cleared", {
      component: "useConversationCache"
    });
  }, []);
  
  // Refresh the cache TTL without changing the data
  const refreshCacheTTL = useCallback((profileId: string) => {
    if (!profileId || !conversationsCache.has(profileId)) return;
    
    lastUpdateTimes.set(profileId, Date.now());
    setLastUpdate(new Date());
    
    logger.info("Refreshed cache TTL", {
      profileId,
      component: "useConversationCache"
    });
  }, []);
  
  return {
    getCachedConversations,
    cacheConversations,
    updateCachedConversation,
    isCacheValid,
    clearCache,
    cacheProfile,
    getCachedProfile,
    refreshCacheTTL
  };
};
