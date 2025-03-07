
import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";

interface UseMessageHandlersProps {
  currentProfileId: string | null;
  conversationId: string;
  newMessage: string;
  setNewMessage: (message: string) => void;
  toast: any;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
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
  const logger = useLogger("useMessageHandlers");
  const [isSending, setIsSending] = useState(false);
  const lastMessageIdRef = useRef<string | null>(null);
  const sendTimeoutRef = useRef<number | null>(null);
  const lastSendTimeRef = useRef<number>(0);

  // Send message function with debounce protection
  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't proceed if currently sending, no profile, empty message, or too recent
    const now = Date.now();
    if (
      isSending || 
      !currentProfileId || 
      !newMessage.trim() || 
      now - lastSendTimeRef.current < 1000
    ) {
      logger.info("Send message blocked", {
        isSending,
        hasProfile: !!currentProfileId,
        hasMessage: !!newMessage.trim(),
        timeSinceLastSend: now - lastSendTimeRef.current
      });
      return;
    }
    
    // Update timestamps to prevent duplicate sends
    lastSendTimeRef.current = now;
    setIsSending(true);
    
    // Clear any existing timeout
    if (sendTimeoutRef.current) {
      window.clearTimeout(sendTimeoutRef.current);
    }
    
    const messageContent = newMessage.trim();
    const optimisticId = `temp-${Date.now()}`;
    
    try {
      logger.info("Sending message", {
        conversationId,
        messageLength: messageContent.length,
        optimisticId
      });
      
      // Create optimistic message for immediate UI update
      const optimisticMessage = {
        id: optimisticId,
        content: messageContent,
        created_at: new Date().toISOString(),
        sender_id: currentProfileId,
        conversation_id: conversationId,
        read_at: null,
        optimistic: true,
        sender: {
          id: currentProfileId
        }
      };
      
      // Add to local state immediately
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Clear input field right away for better UX
      setNewMessage("");
      
      // Send message to server
      const { data: message, error } = await supabase
        .from('messages')
        .insert([
          {
            content: messageContent,
            sender_id: currentProfileId,
            conversation_id: conversationId
          }
        ])
        .select('*, sender:profiles!messages_sender_id_fkey(id, username, full_name, avatar_url)')
        .single();
      
      if (error) {
        logger.error("Error sending message", { error });
        throw error;
      }
      
      // Record real message ID to prevent duplicates
      if (message && message.id) {
        lastMessageIdRef.current = message.id;
        
        // Replace optimistic message with real one
        setMessages(prev => 
          prev.map(m => (m.id === optimisticId ? message : m))
        );
        
        // Add to cache if available
        if (addMessageToCache) {
          addMessageToCache(message);
        }
        
        logger.info("Message sent successfully", { 
          messageId: message.id,
          optimisticId
        });
      }
    } catch (error: any) {
      logger.error("Failed to send message", {
        error: error.message,
        stack: error.stack
      });
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Erreur d'envoi",
        description: "Impossible d'envoyer votre message. Veuillez réessayer."
      });
      
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
      
      // Return the message to the input field
      setNewMessage(messageContent);
    } finally {
      // Add a small delay before allowing new sends
      sendTimeoutRef.current = window.setTimeout(() => {
        setIsSending(false);
        sendTimeoutRef.current = null;
      }, 1000) as unknown as number;
    }
  }, [
    conversationId,
    currentProfileId,
    newMessage,
    isSending,
    setNewMessage,
    setMessages,
    toast,
    addMessageToCache,
    logger
  ]);

  // Clean up timeouts on unmount
  useCallback(() => {
    return () => {
      if (sendTimeoutRef.current) {
        window.clearTimeout(sendTimeoutRef.current);
      }
    };
  }, []);

  return { sendMessage, isSending };
};
