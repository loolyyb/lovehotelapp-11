
import { useState, useCallback } from "react";
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
}

export const useMessageHandlers = ({ 
  currentProfileId,
  conversationId,
  newMessage,
  setNewMessage,
  toast 
}: UseMessageHandlersProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfileId || !newMessage.trim() || isProcessing) {
      return;
    }

    setIsProcessing(true);
    // Store the message to be sent
    const messageToSend = newMessage.trim();
    
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

      // Insert the message
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentProfileId,
          content: messageToSend,
          media_type: messageToSend.startsWith('[Image]') ? 'image' : 'text'
        });
          
      if (insertError) {
        logger.error("Insert message error:", { 
          error: insertError,
          component: "useMessageHandlers" 
        });
        throw insertError;
      }
      
      logger.info("Message sent successfully", {
        conversationId,
        component: "useMessageHandlers"
      });
    } catch (error: any) {
      logger.error("Error in sendMessage:", { 
        error: error.message,
        stack: error.stack,
        component: "useMessageHandlers" 
      });
      
      // If there was an error, put the message back in the input field
      setNewMessage(messageToSend);
      
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le message",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [currentProfileId, conversationId, newMessage, isProcessing, toast, setNewMessage]);

  const debouncedSendMessage = useCallback(
    debounce((e: React.FormEvent) => sendMessage(e), 500, { leading: true, trailing: false }),
    [sendMessage]
  );

  return { sendMessage: debouncedSendMessage };
};
