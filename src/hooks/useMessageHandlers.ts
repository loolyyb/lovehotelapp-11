
import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import debounce from 'lodash/debounce';
import { logger } from "@/services/LogService";

interface UseMessageHandlersProps {
  currentProfileId: string | null;
  conversationId: string;
  newMessage: string;
  setNewMessage: (message: string) => void;
  toast: ReturnType<typeof useToast>["toast"];
  setMessages?: React.Dispatch<React.SetStateAction<any[]>>;
  addMessageToCache?: (message: any) => void;
}

export const useMessageHandlers = ({ 
  currentProfileId,
  conversationId,
  newMessage,
  setNewMessage,
  toast,
  setMessages,
  addMessageToCache
}: UseMessageHandlersProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const optimisticMessageRef = useRef<string | null>(null);
  const processingMessageRef = useRef<boolean>(false);
  const processingTimeoutRef = useRef<number | null>(null);
  const messageIdSentRef = useRef<Set<string>>(new Set());

  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submissions
    if (processingMessageRef.current || !currentProfileId || !newMessage.trim() || isProcessing) {
      return;
    }

    processingMessageRef.current = true;
    setIsProcessing(true);
    
    // Store the message to be sent
    const messageToSend = newMessage.trim();
    optimisticMessageRef.current = messageToSend;
    
    // Generate a unique ID for this message attempt
    const messageAttemptId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if we've just attempted to send this exact message
    if (messageIdSentRef.current.has(messageToSend)) {
      logger.info("Preventing duplicate message send", { 
        messageContent: messageToSend,
        component: "useMessageHandlers" 
      });
      
      processingMessageRef.current = false;
      setIsProcessing(false);
      setNewMessage("");
      return;
    }
    
    // Mark this message as being processed
    messageIdSentRef.current.add(messageToSend);
    
    // Clear this message from the sent set after a while
    setTimeout(() => {
      messageIdSentRef.current.delete(messageToSend);
    }, 5000);
    
    // Optimistically clear the input field right away for better UX
    setNewMessage("");

    try {
      // First check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        logger.error("Authentication error", { error: authError, component: "useMessageHandlers" });
        throw new Error("Vous devez être connecté pour envoyer des messages");
      }

      logger.info("Sending message", { 
        conversationId, 
        senderProfileId: currentProfileId,
        authUserId: user.id,
        component: "useMessageHandlers" 
      });

      // First verify the user has permission to this conversation
      const { data: conversation, error: verifyError } = await supabase
        .from('conversations')
        .select('id, user1_id, user2_id')
        .eq('id', conversationId)
        .single();
        
      if (verifyError) {
        logger.error("Error verifying conversation permission:", { 
          error: verifyError, 
          component: "useMessageHandlers" 
        });
        throw new Error("Vous n'avez pas l'autorisation d'envoyer des messages dans cette conversation");
      }
      
      // Verify user is part of this conversation
      if (conversation.user1_id !== currentProfileId && conversation.user2_id !== currentProfileId) {
        logger.error("User not part of conversation", {
          conversationId,
          currentProfileId,
          conversation,
          component: "useMessageHandlers"
        });
        throw new Error("Vous n'êtes pas autorisé à envoyer des messages dans cette conversation");
      }

      // Create optimistic temporary message for immediate display
      if (setMessages) {
        const tempId = `temp-${messageAttemptId}`;
        const optimisticMessage = {
          id: tempId,
          conversation_id: conversationId,
          sender_id: currentProfileId,
          content: messageToSend,
          media_type: messageToSend.startsWith('[Image]') ? 'image' : 'text',
          created_at: new Date().toISOString(),
          is_read: true,
          sender: {
            id: currentProfileId
          },
          optimistic: true
        };
        
        // Add to local state immediately for better UX
        setMessages(prev => {
          // Ensure no duplicate optimistic messages
          const filtered = prev.filter(m => 
            !(m.optimistic && m.content === messageToSend)
          );
          
          return [...filtered, optimisticMessage].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        });
        
        if (addMessageToCache) {
          addMessageToCache(optimisticMessage);
        }
      }

      // Insert the message
      const { data: newMessageData, error: insertError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentProfileId,
          content: messageToSend,
          media_type: messageToSend.startsWith('[Image]') ? 'image' : 'text'
        })
        .select('*')
        .single();
          
      if (insertError) {
        logger.error("Insert message error:", { 
          error: insertError,
          component: "useMessageHandlers" 
        });
        throw insertError;
      }
      
      logger.info("Message sent successfully", {
        conversationId,
        messageId: newMessageData?.id,
        component: "useMessageHandlers"
      });

      // Replace optimistic message with real one if we're using local state updates
      if (setMessages && newMessageData) {
        setMessages(prev => prev
          .filter(msg => !(msg.optimistic && msg.content === messageToSend))
          .concat([newMessageData])
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        );
        
        if (addMessageToCache && newMessageData) {
          addMessageToCache(newMessageData);
        }
      }
      
    } catch (error: any) {
      logger.error("Error in sendMessage:", { 
        error: error.message,
        stack: error.stack,
        component: "useMessageHandlers" 
      });
      
      // If there was an error, put the message back in the input field
      setNewMessage(messageToSend);
      
      // Remove optimistic message if we have local state management
      if (setMessages) {
        setMessages(prev => prev.filter(msg => !msg.optimistic));
      }
      
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le message",
      });
    } finally {
      setIsProcessing(false);
      optimisticMessageRef.current = null;
      
      // Clear the processing lock after a delay to prevent rapid resubmission
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      
      processingTimeoutRef.current = window.setTimeout(() => {
        processingMessageRef.current = false;
        processingTimeoutRef.current = null;
      }, 1000) as unknown as number;
    }
  }, [currentProfileId, conversationId, newMessage, isProcessing, toast, setNewMessage, setMessages, addMessageToCache]);

  // Properly memoized function without double-call risk
  const debouncedSendMessage = useCallback(
    (e: React.FormEvent) => {
      if (processingMessageRef.current) return;
      sendMessage(e);
    },
    [sendMessage]
  );

  return { sendMessage: debouncedSendMessage };
};
