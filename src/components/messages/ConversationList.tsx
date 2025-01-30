import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useConversations } from "./hooks/useConversations";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { AlertTriangle } from "lucide-react";

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
  selectedConversationId: string | null;
}

export function ConversationList({ onSelectConversation, selectedConversationId }: ConversationListProps) {
  const [currentUserProfileId, setCurrentUserProfileId] = useState<string | null>(null);
  const { conversations, isLoading, error, refetch } = useConversations();

  useEffect(() => {
    getCurrentUserProfile();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('conversation-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          console.log("Message change detected, refreshing conversations");
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const getCurrentUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setCurrentUserProfileId(profile.id);
      }
    } catch (error) {
      console.error("Error fetching current user profile:", error);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose" />
        <h3 className="text-lg font-medium text-burgundy">Erreur de chargement</h3>
        <p className="text-sm text-gray-500">{error}</p>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 text-sm font-medium text-white bg-rose rounded-md hover:bg-rose/90 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-rose/20">
        <h2 className="text-lg font-semibold text-burgundy">Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => {
          const otherUser = conversation.user1.id === currentUserProfileId 
            ? conversation.user2 
            : conversation.user1;
          const lastMessage = conversation.messages?.[0];

          return (
            <div
              key={conversation.id}
              className={`p-4 border-b border-rose/20 cursor-pointer hover:bg-rose/5 transition-colors ${
                selectedConversationId === conversation.id ? 'bg-rose/10' : ''
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={otherUser.avatar_url} />
                  <AvatarFallback>{otherUser.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium text-burgundy truncate">
                      {otherUser.full_name}
                    </h3>
                    {lastMessage && (
                      <span className="text-xs text-gray-500">
                        {format(new Date(lastMessage.created_at), 'HH:mm', { locale: fr })}
                      </span>
                    )}
                  </div>
                  {lastMessage && (
                    <p className="text-sm text-gray-600 truncate">
                      {lastMessage.content}
                    </p>
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