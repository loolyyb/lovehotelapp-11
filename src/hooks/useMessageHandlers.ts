
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import debounce from 'lodash/debounce';

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
      // First verify the user has permission to this conversation
      const { error: verifyError } = await supabase
        .from('conversations')
        .select('id')
        .or(`user1_id.eq.${currentProfileId},user2_id.eq.${currentProfileId}`)
        .eq('id', conversationId)
        .single();
        
      if (verifyError) {
        console.error("Error verifying conversation permission:", verifyError);
        throw new Error("You don't have permission to send messages in this conversation");
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentProfileId,
          content: newMessage.trim(),
          media_type: newMessage.startsWith('[Image]') ? 'image' : 'text'
        });

      if (error) {
        console.error("Insert message error:", error);
        throw error;
      }
      
      setNewMessage("");
    } catch (error: any) {
      console.error("Error in sendMessage:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le message",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [currentProfileId, conversationId, newMessage, isProcessing]);

  const debouncedSendMessage = useCallback(
    debounce((e: React.FormEvent) => sendMessage(e), 500, { leading: true, trailing: false }),
    [sendMessage]
  );

  return { sendMessage: debouncedSendMessage };
};
