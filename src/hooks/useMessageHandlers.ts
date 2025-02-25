
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

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
    if (!currentUserId || !newMessage.trim()) {
      console.error("No current user ID or empty message");
      return;
    }

    try {
      // First, get the profile id for the current user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', currentUserId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      if (!profile) {
        console.error("No profile found for user:", currentUserId);
        throw new Error("No profile found");
      }

      console.log("Sending message in conversation:", conversationId);
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: profile.id, // Using profile.id instead of currentUserId
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
