
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import debounce from 'lodash/debounce';

interface UseMessageHandlersProps {
  currentUserId: string | null;
  conversationId: string;
  newMessage: string;
  setNewMessage: (message: string) => void;
  toast: ReturnType<typeof useToast>["toast"];
}

export const useMessageHandlers = ({ 
  currentUserId, 
  conversationId,
  newMessage,
  setNewMessage,
  toast 
}: UseMessageHandlersProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !newMessage.trim() || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', currentUserId)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (!profile) {
        throw new Error("No profile found");
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: profile.id,
          content: newMessage.trim(),
          media_type: newMessage.startsWith('[Image]') ? 'image' : 'text'
        });

      if (error) {
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
  }, [currentUserId, conversationId, newMessage, isProcessing]);

  const debouncedSendMessage = useCallback(
    debounce((e: React.FormEvent) => sendMessage(e), 500, { leading: true, trailing: false }),
    [sendMessage]
  );

  return { sendMessage: debouncedSendMessage };
};
