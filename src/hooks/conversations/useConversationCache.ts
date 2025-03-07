
import { useState, useCallback } from "react";
import { logger } from "@/services/LogService";

// Global conversation cache
const conversationsCache = new Map<string, any[]>();
const profilesCache = new Map<string, any>();

export const useConversationCache = () => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Cache timeout in milliseconds (5 minutes)
  const CACHE_TTL = 5 * 60 * 1000;
  
  // Check if cache is valid based on profile ID and last update
  const isCacheValid = useCallback((profileId: string) => {
    if (!conversationsCache.has(profileId)) return false;
    
    const now = new Date().getTime();
    const lastUpdateTime = lastUpdate.getTime();
    
    return (now - lastUpdateTime) < CACHE_TTL;
  }, [lastUpdate]);
  
  // Get conversations from cache
  const getCachedConversations = useCallback((profileId: string) => {
    if (!profileId || !isCacheValid(profileId)) return null;
    
    logger.info("Using cached conversations", {
      profileId,
      count: conversationsCache.get(profileId)?.length || 0,
      component: "useConversationCache"
    });
    
    return conversationsCache.get(profileId);
  }, [isCacheValid]);
  
  // Cache conversations for a profile
  const cacheConversations = useCallback((profileId: string, conversations: any[]) => {
    if (!profileId) return;
    
    logger.info("Caching conversations", {
      profileId,
      count: conversations.length,
      component: "useConversationCache"
    });
    
    conversationsCache.set(profileId, conversations);
    setLastUpdate(new Date());
  }, []);
  
  // Update a specific conversation in cache
  const updateCachedConversation = useCallback((profileId: string, conversationId: string, updatedData: any) => {
    if (!profileId || !conversationsCache.has(profileId)) return;
    
    const conversations = conversationsCache.get(profileId) || [];
    const updatedConversations = conversations.map(conv => 
      conv.id === conversationId ? { ...conv, ...updatedData } : conv
    );
    
    conversationsCache.set(profileId, updatedConversations);
    setLastUpdate(new Date());
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
    logger.info("Conversation and profile caches cleared", {
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
    getCachedProfile
  };
};
