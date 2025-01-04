import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface MessageListProps {
  conversations: any[];
  onSelectConversation: (id: string) => void;
  selectedConversationId: string | null;
}

export function MessageList({ conversations, onSelectConversation, selectedConversationId }: MessageListProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const getOtherUser = (conversation: any) => {
    if (!currentUserId) return null;
    return conversation.user1_id === currentUserId ? conversation.user2 : conversation.user1;
  };

  const getLastMessage = (conversation: any) => {
    if (!conversation.messages || conversation.messages.length === 0) return null;
    return conversation.messages[conversation.messages.length - 1];
  };

  const getUnreadCount = (conversation: any) => {
    if (!currentUserId || !conversation.messages) return 0;
    return conversation.messages.filter(
      (m: any) => m.sender_id !== currentUserId && !m.read_at
    ).length;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-rose/20">
        <h1 className="text-2xl font-cormorant text-burgundy font-bold">Messages</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => {
          const otherUser = getOtherUser(conversation);
          const lastMessage = getLastMessage(conversation);
          const unreadCount = getUnreadCount(conversation);

          return (
            <div
              key={conversation.id}
              className={`p-4 flex items-center space-x-4 hover:bg-rose/10 cursor-pointer transition-colors
                ${selectedConversationId === conversation.id ? 'bg-rose/20' : ''}`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={otherUser?.avatar_url} />
                <AvatarFallback>{otherUser?.full_name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold truncate">{otherUser?.full_name}</h3>
                  {lastMessage && (
                    <span className="text-xs text-gray-500">
                      {format(new Date(lastMessage.created_at), 'HH:mm', { locale: fr })}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600 truncate">
                    {lastMessage?.content || 'Aucun message'}
                  </p>
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-burgundy text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}