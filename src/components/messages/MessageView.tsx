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
    getCurrentUser();
    fetchMessages();
    subscribeToNewMessages();
    markMessagesAsRead();

    // Cleanup subscription on unmount
    return () => {
      const channel = supabase.channel('messages-changes');
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    // Fetch the conversation to get the other user's profile
    const { data: conversation } = await supabase
      .from('conversations')
      .select(`
        *,
        user1:profiles!conversations_user1_id_fkey(*),
        user2:profiles!conversations_user2_id_fkey(*)
      `)
      .eq('id', conversationId)
      .single();

    if (conversation) {
      // Get the current user's profile ID
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (currentUserProfile) {
        // Set the other user based on which user in the conversation is not the current user
        const otherUserData = conversation.user1_id === currentUserProfile.id 
          ? conversation.user2 
          : conversation.user1;
        setOtherUser(otherUserData);
      }
    }
  };

  const fetchMessages = async () => {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      console.log("Fetched messages:", messages); // Debug log
      setMessages(messages || []);
      scrollToBottom();
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les messages",
      });
    }
  };

  const subscribeToNewMessages = () => {
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
          console.log("New message received:", payload); // Debug log
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
    if (!currentUserId) return;

    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', currentUserId)
      .is('read_at', null);

    if (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: newMessage.trim(),
          media_type: newMessage.startsWith('[Image]') ? 'image' : 'text'
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
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