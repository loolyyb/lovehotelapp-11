import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageHeader } from "./MessageHeader";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

interface MessageViewProps {
  conversationId: string;
  onBack: () => void;
}

export function MessageView({ conversationId, onBack }: MessageViewProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log("Initializing MessageView with conversationId:", conversationId);
    getCurrentUser().then(() => {
      fetchMessages();
      subscribeToNewMessages();
    });

    return () => {
      console.log("Cleaning up MessageView");
      const channel = supabase.channel('messages-changes');
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return;
      }
      console.log("Current user ID:", user.id);
      setCurrentUserId(user.id);

      // Get current user's profile
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching current user profile:", profileError);
        return;
      }

      // Fetch conversation with related profiles
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:profiles!conversations_user1_id_fkey(*),
          user2:profiles!conversations_user2_id_fkey(*)
        `)
        .eq('id', conversationId)
        .single();

      if (convError) {
        console.error("Error fetching conversation:", convError);
        return;
      }

      if (conversation) {
        console.log("Fetched conversation:", conversation);
        const otherUserData = conversation.user1.id === currentUserProfile.id 
          ? conversation.user2 
          : conversation.user1;
        console.log("Other user data:", otherUserData);
        setOtherUser(otherUserData);
      }
    } catch (error) {
      console.error("Error in getCurrentUser:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      console.log("Fetching messages for conversation:", conversationId);
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }
      
      console.log("Fetched messages:", messages);
      setMessages(messages || []);
      scrollToBottom();
      if (messages?.length > 0) {
        markMessagesAsRead();
      }
    } catch (error: any) {
      console.error("Error in fetchMessages:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les messages",
      });
    }
  };

  const subscribeToNewMessages = () => {
    console.log("Setting up real-time subscription for conversation:", conversationId);
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log("New message received:", payload);
          setMessages(current => [...current, payload.new]);
          scrollToBottom();
          if (payload.new.sender_id !== currentUserId) {
            markMessagesAsRead();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markMessagesAsRead = async () => {
    if (!currentUserId) {
      console.log("No current user ID, skipping mark as read");
      return;
    }

    try {
      console.log("Marking messages as read for user:", currentUserId);
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUserId)
        .is('read_at', null);

      if (error) {
        console.error("Error marking messages as read:", error);
      }
    } catch (error) {
      console.error("Error in markMessagesAsRead:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    try {
      console.log("Sending message:", newMessage);
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

  return (
    <div className="h-full flex flex-col bg-cream">
      <MessageHeader 
        otherUser={otherUser} 
        onBack={onBack} 
        conversationId={conversationId}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isCurrentUser={message.sender_id === currentUserId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSend={sendMessage}
        conversationId={conversationId}
      />
    </div>
  );
}