import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageHeader } from "./MessageHeader";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { useMessageHandlers } from "@/hooks/useMessageHandlers";
import { useMessageSubscription } from "@/hooks/useMessageSubscription";
import { useMessageRetrieval } from "@/hooks/useMessageRetrieval";

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

  // Custom hooks for message functionality
  const { sendMessage } = useMessageHandlers({ currentUserId, conversationId, setNewMessage, toast });
  const { subscribeToNewMessages } = useMessageSubscription({ conversationId, setMessages });
  const { fetchMessages, markMessagesAsRead } = useMessageRetrieval({ 
    conversationId, 
    currentUserId, 
    setMessages, 
    toast 
  });

  useEffect(() => {
    console.log("Initializing MessageView with conversationId:", conversationId);
    getCurrentUser();

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
        
        // Now that we have the current user, fetch messages
        await fetchMessages();
        subscribeToNewMessages();
      }
    } catch (error) {
      console.error("Error in getCurrentUser:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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