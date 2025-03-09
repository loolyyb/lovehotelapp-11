
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessagesFetcher } from './fetchers/messagesFetcher';
import { MessageCache } from './cache';
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";

interface UseMessageRetrievalProps {
  conversationId: string;
  currentProfileId: string | null;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  toast: any;
}

export const useMessageRetrieval = ({
  conversationId,
  currentProfileId,
  setMessages,
  toast
}: UseMessageRetrievalProps) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const isMountedRef = useRef(true);
  const fetchingMessagesRef = useRef(false);
  const permissionVerifiedRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Reset state on conversation change
  useEffect(() => {
    // Reset states when conversation changes
    setHasMoreMessages(true);
    setIsLoadingMore(false);
    setIsFetchingMore(false);
    fetchingMessagesRef.current = false;
    permissionVerifiedRef.current = false;

    // Also reset failed attempts for this conversation
    if (conversationId) {
      MessagesFetcher.resetFailedAttempts(conversationId);
    }
  }, [conversationId]);

  // Verify user permission for the conversation
  const verifyConversationPermission = useCallback(async () => {
    if (!conversationId || !currentProfileId || permissionVerifiedRef.current) {
      return permissionVerifiedRef.current;
    }

    try {
      logger.info("Verifying conversation permission", {
        conversationId,
        profileId: currentProfileId,
        component: "useMessageRetrieval"
      });

      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('user1_id, user2_id, status')
        .eq('id', conversationId)
        .single();

      if (error) {
        logger.error("Error verifying conversation permission", {
          error,
          conversationId,
          profileId: currentProfileId,
          component: "useMessageRetrieval"
        });
        return false;
      }

      // Check if user is part of this conversation and it's active
      const hasPermission = 
        conversation &&
        conversation.status === 'active' &&
        (conversation.user1_id === currentProfileId || conversation.user2_id === currentProfileId);

      if (!hasPermission) {
        logger.error("User doesn't have permission for this conversation", {
          conversationId,
          profileId: currentProfileId,
          conversation,
          component: "useMessageRetrieval"
        });
      } else {
        permissionVerifiedRef.current = true;
        logger.info("User has permission for this conversation", {
          conversationId,
          profileId: currentProfileId,
          component: "useMessageRetrieval"
        });
      }

      return hasPermission;
    } catch (error) {
      logger.error("Exception verifying conversation permission", {
        error,
        conversationId,
        profileId: currentProfileId,
        component: "useMessageRetrieval"
      });
      return false;
    }
  }, [conversationId, currentProfileId]);

  // Fetch messages with permission verification
  const fetchMessages = useCallback(async (useCache = true) => {
    if (!conversationId || !currentProfileId || fetchingMessagesRef.current) {
      return null;
    }

    fetchingMessagesRef.current = true;

    try {
      // Verify permission first
      const hasPermission = await verifyConversationPermission();
      if (!hasPermission) {
        logger.error("Permission denied for fetching messages", {
          conversationId,
          profileId: currentProfileId,
          component: "useMessageRetrieval"
        });
        
        if (isMountedRef.current) {
          toast({
            variant: "destructive",
            title: "Erreur d'accès",
            description: "Vous n'avez pas la permission d'accéder à cette conversation"
          });
        }
        
        return null;
      }

      const messagesData = await MessagesFetcher.fetchInitialMessages(
        conversationId,
        currentProfileId,
        useCache
      );

      if (isMountedRef.current && messagesData) {
        setMessages(messagesData);
        setHasMoreMessages(messagesData.length >= 15); // INITIAL_PAGE_SIZE
        
        // Auto-mark messages as read after a short delay
        setTimeout(() => {
          if (isMountedRef.current) {
            markMessagesAsRead();
          }
        }, 1000);
      }

      return messagesData;
    } catch (error) {
      logger.error("Error in fetchMessages", {
        error,
        conversationId,
        component: "useMessageRetrieval"
      });
      return null;
    } finally {
      fetchingMessagesRef.current = false;
    }
  }, [conversationId, currentProfileId, setMessages, toast, verifyConversationPermission]);

  // Load more (older) messages
  const loadMoreMessages = useCallback(async () => {
    if (!conversationId || !currentProfileId || !hasMoreMessages || isLoadingMore || isFetchingMore) {
      return;
    }

    setIsFetchingMore(true);

    try {
      // Only proceed if permission is verified
      if (!permissionVerifiedRef.current) {
        const hasPermission = await verifyConversationPermission();
        if (!hasPermission) {
          setHasMoreMessages(false);
          return;
        }
      }

      setIsLoadingMore(true);
      
      const updatedMessages = await MessagesFetcher.fetchMoreMessages(
        conversationId,
        currentProfileId,
        hasMoreMessages
      );

      if (isMountedRef.current) {
        if (updatedMessages && updatedMessages.length > 0) {
          setMessages(updatedMessages);
          // Check if we likely have more messages (received a full page)
          setHasMoreMessages(updatedMessages.length % 10 === 0);
        } else {
          setHasMoreMessages(false);
        }
      }
    } catch (error) {
      logger.error("Error in loadMoreMessages", {
        error,
        conversationId,
        component: "useMessageRetrieval"
      });
      
      if (isMountedRef.current) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger plus de messages"
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingMore(false);
        setIsFetchingMore(false);
      }
    }
  }, [
    conversationId,
    currentProfileId,
    hasMoreMessages,
    isLoadingMore,
    isFetchingMore,
    setMessages,
    toast,
    verifyConversationPermission
  ]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    if (!conversationId || !currentProfileId) return;

    try {
      // Find unread messages for this conversation that were sent by the other user
      const { data: unreadMessages, error: fetchError } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentProfileId)
        .is('read_at', null);

      if (fetchError || !unreadMessages || unreadMessages.length === 0) return;

      logger.info(`Marking ${unreadMessages.length} messages as read`, {
        conversationId,
        component: "useMessageRetrieval"
      });

      // Mark them all as read
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadMessages.map(msg => msg.id));

      if (updateError) {
        logger.error("Error marking messages as read", {
          error: updateError,
          conversationId,
          component: "useMessageRetrieval"
        });
      }
    } catch (error) {
      logger.error("Exception in markMessagesAsRead", {
        error,
        conversationId,
        component: "useMessageRetrieval"
      });
    }
  }, [conversationId, currentProfileId]);

  // Add new message to cache and state
  const addMessageToCache = useCallback((message: any) => {
    if (!conversationId) return false;
    
    return MessageCache.addMessage(conversationId, message);
  }, [conversationId]);

  return {
    fetchMessages,
    loadMoreMessages,
    markMessagesAsRead,
    addMessageToCache,
    isLoadingMore,
    hasMoreMessages,
    isFetchingMore
  };
};
