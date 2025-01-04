import { useEffect, useRef, useState } from "react";
import { MessageHeader } from "./MessageHeader";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  // Initialize conversation and fetch current user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        setCurrentUserId(user.id);

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
          const { data: currentUserProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

          const otherUserData = conversation.user1.id === currentUserProfile?.id 
            ? conversation.user2 
            : conversation.user1;
            
          setOtherUser(otherUserData);
        }
      } catch (error) {
        console.error("Error in getCurrentUser:", error);
      }
    };

    getCurrentUser();
  }, [conversationId]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data: messages, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(messages || []);
        
        // Mark messages as read
        if (currentUserId && messages?.length > 0) {
          await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('conversation_id', conversationId)
            .neq('sender_id', currentUserId)
            .is('read_at', null);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les messages",
        });
      }
    };

    if (currentUserId) {
      fetchMessages();
    }
  }, [conversationId, currentUserId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;

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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message handler
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !newMessage.trim()) return;

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