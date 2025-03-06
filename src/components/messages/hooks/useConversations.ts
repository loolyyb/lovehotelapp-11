
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useLogger } from "@/hooks/useLogger";
import { useUserProfileRetrieval } from "@/hooks/conversations/useUserProfileRetrieval";
import { useConversationsFetcher } from "@/hooks/conversations/useConversationsFetcher";
import { useLatestMessagesFetcher } from "@/hooks/conversations/useLatestMessagesFetcher";
import { useConversationsRealtime } from "@/hooks/conversations/useConversationsRealtime";
import { supabase } from "@/integrations/supabase/client";

export const useConversations = () => {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const logger = useLogger("useConversations");
  const fetchingRef = useRef(false);
  const debounceTimerRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const fetchAttemptsRef = useRef(0);

  // Import all the refactored hooks
  const {
    currentProfileId,
    setCurrentProfileId,
    isLoading: profileLoading,
    error: profileError,
    getUserProfile
  } = useUserProfileRetrieval();

  const {
    conversations,
    setConversations,
    isLoading: conversationsLoading,
    error: conversationsError,
    fetchConversations
  } = useConversationsFetcher(currentProfileId);

  const { fetchLatestMessages } = useLatestMessagesFetcher();

  // Combine loading and error states
  const isLoading = profileLoading || conversationsLoading;
  
  useEffect(() => {
    if (profileError) setError(profileError);
    else if (conversationsError) setError(conversationsError);
    else setError(null);
  }, [profileError, conversationsError]);

  // Log when we retrieve conversations
  useEffect(() => {
    logger.info("Fetched conversations", {
      count: conversations.length
    });
  }, [conversations, logger]);

  // Diagnostic check for profile and username
  useEffect(() => {
    if (currentProfileId) {
      // Fetch profile details
      supabase
        .from('profiles')
        .select('id, username, full_name')
        .eq('id', currentProfileId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            logger.error("Error fetching profile details", { error });
          } else if (data) {
            logger.info("User profile found", {
              profileId: data.id,
              username: data.username,
              fullName: data.full_name
            });
          }
        });
    }
  }, [currentProfileId, logger]);

  // Check permissions and fix profile issues
  useEffect(() => {
    const checkPermsAndFix = async () => {
      if (!currentProfileId) return;
      
      try {
        logger.info("Checking permissions and profile setup", { profileId: currentProfileId });
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          logger.warn("No authenticated user", { reason: "no_user" });
          return;
        }
        
        // Check if profile exists and has correct user_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, user_id')
          .eq('id', currentProfileId)
          .maybeSingle();
          
        if (profileError) {
          logger.error("Error checking profile", { error: profileError });
          return;
        }
        
        if (!profile) {
          logger.warn("Profile not found, may need to create it", { profileId: currentProfileId });
          return;
        }
        
        logger.info("Profile check successful", { 
          profileId: profile.id,
          userId: profile.user_id,
          authId: user.id
        });
        
        // If user_id doesn't match auth.id, update it
        if (profile.user_id !== user.id) {
          logger.warn("Profile user_id doesn't match auth.id, fixing...", {
            profileId: profile.id,
            profileUserId: profile.user_id,
            authId: user.id
          });
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ user_id: user.id })
            .eq('id', currentProfileId);
            
          if (updateError) {
            logger.error("Failed to update profile user_id", { error: updateError });
          } else {
            logger.info("Successfully updated profile user_id", {
              profileId: currentProfileId,
              userId: user.id
            });
          }
        }
      } catch (error) {
        logger.error("Error in permissions check", { error });
      }
    };
    
    checkPermsAndFix();
  }, [currentProfileId, logger]);

  // Main fetch function that orchestrates the process
  const fetchConversationsWithMessages = useCallback(async () => {
    // Use ref to prevent multiple simultaneous fetches
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      logger.info("Starting conversations fetch process", { attempt: fetchAttemptsRef.current + 1 });
      fetchAttemptsRef.current += 1;
      
      // 1. Get user profile if not already available
      if (!currentProfileId) {
        const profileId = await getUserProfile();
        if (!profileId) {
          logger.error("Could not retrieve user profile", { reason: "profile_retrieval_failed" });
          fetchingRef.current = false;
          return;
        }
      }

      // 2. Fetch conversations for the user
      const fetchedConversations = await fetchConversations();
      
      if (fetchedConversations.length === 0) {
        logger.warn("No conversations found, attempt", { attemptNumber: fetchAttemptsRef.current });
        
        // After several attempts, try to diagnose the issue
        if (fetchAttemptsRef.current > 3) {
          // Try fetching all conversations that might be relevant (admin access)
          const { data: allConversations, error: allError } = await supabase
            .from('conversations')
            .select('*')
            .limit(20);
            
          logger.info("Diagnostic - all conversations", {
            success: !allError,
            count: allConversations?.length || 0,
            error: allError
          });
          
          // Try to check for user profile mismatch
          const { data: authUser } = await supabase.auth.getUser();
          if (authUser.user) {
            logger.info("Diagnostic - auth user", {
              id: authUser.user.id,
              email: authUser.user.email
            });
            
            const { data: userProfiles } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', authUser.user.id);
              
            logger.info("Diagnostic - user profiles", {
              count: userProfiles?.length || 0,
              profiles: userProfiles
            });
          }
        }
      }
      
      // 3. Fetch latest message for each conversation
      const conversationsWithMessages = await fetchLatestMessages(fetchedConversations);
      
      // 4. Update state with the completed data
      setConversations(conversationsWithMessages);
      
      // Reset retry counter on success
      retryCountRef.current = 0;
    } catch (error: any) {
      logger.error("Error in fetchConversationsWithMessages", {
        error: error.message,
        stack: error.stack
      });
      setError("Impossible de charger les conversations. Veuillez réessayer plus tard.");
    } finally {
      fetchingRef.current = false;
    }
  }, [
    currentProfileId, 
    logger, 
    getUserProfile, 
    fetchConversations, 
    fetchLatestMessages, 
    setConversations
  ]);

  // Initial fetch
  useEffect(() => {
    fetchConversationsWithMessages();
  }, [fetchConversationsWithMessages]);

  // Handler for conversation changes
  const handleConversationChange = useCallback(() => {
    logger.info("Conversation change detected, triggering refresh", { timestamp: new Date().toISOString() });
    fetchConversationsWithMessages();
  }, [logger, fetchConversationsWithMessages]);

  // Handler for new messages with debounce to prevent excessive updates
  const handleNewMessage = useCallback((message: any) => {
    logger.info("New message received, triggering conversation update", { 
      messageId: message.id, 
      conversationId: message.conversation_id,
      timestamp: new Date().toISOString()
    });
    
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    
    // Set a new debounce timer to fetch conversations
    debounceTimerRef.current = window.setTimeout(() => {
      fetchConversationsWithMessages();
      debounceTimerRef.current = null;
    }, 300);
  }, [fetchConversationsWithMessages, logger]);

  // Setup realtime subscription for conversation updates
  const { handleNewMessage: realtimeMessageHandler } = useConversationsRealtime(
    currentProfileId,
    handleConversationChange,
    handleNewMessage
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Setup realtime subscription for messages
  useRealtimeMessages({
    currentProfileId,
    onNewMessage: realtimeMessageHandler,
  });

  return { 
    conversations, 
    isLoading, 
    error, 
    refetch: fetchConversationsWithMessages, 
    currentProfileId 
  };
};
