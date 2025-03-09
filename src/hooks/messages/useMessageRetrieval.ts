
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
  const [permissionVerified, setPermissionVerified] = useState(false);
  const isMountedRef = useRef(true);
  const fetchingMessagesRef = useRef(false);
  const permissionVerifiedRef = useRef(false);
  const attemptCountRef = useRef(0);

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
    setPermissionVerified(false);
    fetchingMessagesRef.current = false;
    permissionVerifiedRef.current = false;
    attemptCountRef.current = 0;

    // Also reset failed attempts for this conversation
    if (conversationId) {
      MessagesFetcher.resetFailedAttempts(conversationId);
    }
  }, [conversationId]);

  // Verify user permission for the conversation
  const verifyConversationPermission = useCallback(async () => {
    if (!conversationId || !currentProfileId) {
      logger.info("Cannot verify permission: missing required data", {
        conversationId: !!conversationId,
        profileId: !!currentProfileId,
        component: "useMessageRetrieval.verifyConversationPermission"
      });
      return false;
    }

    // If we already verified permission, return early
    if (permissionVerifiedRef.current) {
      return true;
    }

    try {
      logger.info("Verifying conversation permission", {
        conversationId,
        profileId: currentProfileId,
        component: "useMessageRetrieval.verifyConversationPermission"
      });

      // Direct query to conversations table
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
          component: "useMessageRetrieval.verifyConversationPermission"
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
          component: "useMessageRetrieval.verifyConversationPermission"
        });
        
        // Also log the raw IDs to help with debugging
        logger.error("Permission check details", {
          user1_id: conversation?.user1_id,
          user2_id: conversation?.user2_id,
          currentProfileId,
          matches1: conversation?.user1_id === currentProfileId,
          matches2: conversation?.user2_id === currentProfileId,
          component: "useMessageRetrieval.verifyConversationPermission"
        });
      } else {
        permissionVerifiedRef.current = true;
        setPermissionVerified(true);
        logger.info("User has permission for this conversation", {
          conversationId,
          profileId: currentProfileId,
          component: "useMessageRetrieval.verifyConversationPermission"
        });
      }

      return hasPermission;
    } catch (error) {
      logger.error("Exception verifying conversation permission", {
        error,
        conversationId,
        profileId: currentProfileId,
        component: "useMessageRetrieval.verifyConversationPermission"
      });
      return false;
    }
  }, [conversationId, currentProfileId]);

  // Fetch messages with permission verification
  const fetchMessages = useCallback(async (useCache = true) => {
    if (!conversationId || !currentProfileId) {
      logger.info("Cannot fetch messages: missing required data", {
        conversationId: !!conversationId,
        profileId: !!currentProfileId,
        component: "useMessageRetrieval.fetchMessages"
      });
      return null;
    }

    if (fetchingMessagesRef.current) {
      logger.info("Already fetching messages, skipping duplicate request", {
        conversationId,
        component: "useMessageRetrieval.fetchMessages"
      });
      return null;
    }

    // Increment attempt counter
    attemptCountRef.current++;
    
    logger.info(`Fetching messages attempt #${attemptCountRef.current}`, {
      conversationId, 
      currentProfileId,
      component: "useMessageRetrieval.fetchMessages"
    });

    fetchingMessagesRef.current = true;

    try {
      // Verify permission first
      const hasPermission = await verifyConversationPermission();
      if (!hasPermission) {
        logger.error("Permission denied for fetching messages", {
          conversationId,
          profileId: currentProfileId,
          component: "useMessageRetrieval.fetchMessages"
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

      logger.info("Permission verified, fetching messages", {
        conversationId,
        profileId: currentProfileId,
        component: "useMessageRetrieval.fetchMessages"
      });

      const messagesData = await MessagesFetcher.fetchInitialMessages(
        conversationId,
        currentProfileId,
        useCache
      );

      if (messagesData) {
        logger.info(`Fetched ${messagesData.length} messages`, {
          conversationId,
          component: "useMessageRetrieval.fetchMessages"
        });
      } else {
        logger.warn("No messages returned from fetcher", {
          conversationId,
          component: "useMessageRetrieval.fetchMessages"
        });
        
        // If no messages were returned, try a direct query as a last resort
        logger.info("Attempting direct messages query as fallback", {
          conversationId,
          component: "useMessageRetrieval.fetchMessages"
        });
        
        try {
          const { data: directMessages, error: directError } = await supabase
            .from('messages')
            .select(`
              id,
              content,
              created_at,
              read_at,
              sender_id,
              conversation_id,
              media_type,
              media_url
            `)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
          
          if (directError) {
            logger.error("Direct messages query failed", {
              error: directError,
              conversationId,
              component: "useMessageRetrieval.fetchMessages"
            });
          } else if (directMessages && directMessages.length > 0) {
            logger.info(`Direct query succeeded with ${directMessages.length} messages`, {
              conversationId,
              component: "useMessageRetrieval.fetchMessages"
            });
            
            if (isMountedRef.current) {
              setMessages(directMessages);
              
              // Auto-mark messages as read after a short delay
              setTimeout(() => {
                if (isMountedRef.current) {
                  markMessagesAsRead();
                }
              }, 1000);
              
              return directMessages;
            }
          } else {
            logger.info("Direct query returned no messages", {
              conversationId,
              component: "useMessageRetrieval.fetchMessages"
            });
          }
        } catch (directQueryError) {
          logger.error("Exception in direct messages query", {
            error: directQueryError,
            conversationId,
            component: "useMessageRetrieval.fetchMessages"
          });
        }
      }

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
        component: "useMessageRetrieval.fetchMessages"
      });
      return null;
    } finally {
      fetchingMessagesRef.current = false;
    }
  }, [conversationId, currentProfileId, setMessages, toast, verifyConversationPermission, markMessagesAsRead]);

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
        component: "useMessageRetrieval.loadMoreMessages"
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

      if (fetchError) {
        logger.error("Error finding unread messages", {
          error: fetchError,
          conversationId,
          component: "useMessageRetrieval.markMessagesAsRead"
        });
        return;
      }

      if (!unreadMessages || unreadMessages.length === 0) {
        logger.info("No unread messages to mark as read", {
          conversationId,
          component: "useMessageRetrieval.markMessagesAsRead"
        });
        return;
      }

      logger.info(`Marking ${unreadMessages.length} messages as read`, {
        conversationId,
        component: "useMessageRetrieval.markMessagesAsRead"
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
          component: "useMessageRetrieval.markMessagesAsRead"
        });
      } else {
        logger.info("Successfully marked messages as read", {
          count: unreadMessages.length,
          conversationId,
          component: "useMessageRetrieval.markMessagesAsRead"
        });
      }
    } catch (error) {
      logger.error("Exception in markMessagesAsRead", {
        error,
        conversationId,
        component: "useMessageRetrieval.markMessagesAsRead"
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
    isFetchingMore,
    permissionVerified
  };
};
