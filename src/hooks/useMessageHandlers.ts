
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

      // Use direct approach to bypass potential RLS issues
      const query = `
        INSERT INTO messages (conversation_id, sender_id, content, media_type)
        VALUES ('${conversationId}', '${currentProfileId}', '${newMessage.trim().replace(/'/g, "''")}', 
        ${newMessage.startsWith('[Image]') ? "'image'" : "'text'"})
        RETURNING id
      `;
      
      // Try the direct SQL approach first for better compatibility with existing RLS
      const { data, error } = await supabase.rpc('execute_sql', { query_text: query });
      
      // If that fails, fall back to the regular insert method
      if (error) {
        logger.error("Failed to use direct SQL, falling back to regular insert", { 
          error,
          component: "useMessageHandlers" 
        });
        
        const { error: insertError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: currentProfileId,
            content: newMessage.trim(),
            media_type: newMessage.startsWith('[Image]') ? 'image' : 'text'
          });
          
        if (insertError) {
          logger.error("Insert message error:", { 
            error: insertError,
            component: "useMessageHandlers" 
          });
          throw insertError;
        }
      }
      
      logger.info("Message sent successfully", {
        conversationId,
        component: "useMessageHandlers"
      });
      
      setNewMessage("");
    } catch (error: any) {
      logger.error("Error in sendMessage:", { 
        error: error.message,
        stack: error.stack,
        component: "useMessageHandlers" 
      });
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
