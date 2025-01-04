import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
  selectedConversationId: string | null;
}

export function ConversationList({ onSelectConversation, selectedConversationId }: ConversationListProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserProfileId, setCurrentUserProfileId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
    fetchConversations();
    subscribeToNewMessages();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchCurrentUserProfile();
    }
  }, [currentUserId]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error("Error getting current user:", error);
    }
  };

  const fetchCurrentUserProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', currentUserId)
        .single();

      if (error) throw error;
      if (profile) {
        setCurrentUserProfileId(profile.id);
      }
    } catch (error) {
      console.error("Error fetching current user profile:", error);
    }
  };

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:profiles!conversations_user1_profile_fkey(
            avatar_url,
            full_name
          ),
          user2:profiles!conversations_user2_profile_fkey(
            avatar_url,
            full_name
          ),
          messages:messages(
            id,
            content,
            created_at,
            sender_id,
            read_at
          )
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'active')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      console.log("Fetched conversations:", data);
      setConversations(data || []);
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les conversations",
      });
    }
  };

  const subscribeToNewMessages = () => {
    console.log("Setting up real-time subscription for messages");
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-rose/20">
        <h2 className="text-lg font-semibold text-burgundy">Messages</h2>
      </div>

      {/* Advertisement Section */}
      <div className="p-4 border-b border-rose/20 bg-cream hover:bg-rose/5 transition-colors">
        <a 
          href="https://lovehotel.io" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
            alt="Love Hotel Advertisement"
            className="w-full h-32 object-cover rounded-lg mb-2"
          />
          <p className="text-sm text-burgundy text-center">
            Découvrez Love Hotel - Votre destination romantique
          </p>
        </a>
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