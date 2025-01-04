import { useToast } from "./use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      console.error("No current user ID available");
      return;
    }

    try {
      console.log("Sending message in conversation:", conversationId);
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: newMessage.trim(),
          media_type: newMessage.startsWith('[Image]') ? 'image' : 'text'
        });

      if (error) {
        console.error("Error sending message:", error);
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
    }
  };

  return { sendMessage };
};