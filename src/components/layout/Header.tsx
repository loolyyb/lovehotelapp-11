import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessagesSquare, Percent } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SideMenu } from "./header/SideMenu";
import { UserMenu } from "./header/UserMenu";
import { NotificationsMenu } from "./header/NotificationsMenu";

export function Header({ userProfile }: { userProfile?: any }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile?.avatar_url) {
      setAvatarUrl(userProfile.avatar_url);
    }
  }, [userProfile?.avatar_url]);

  useEffect(() => {
    if (!userProfile?.user_id) return;

    // Subscribe to new messages
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload: any) => {
          const conversation = payload.new.conversation_id;
          checkIfUserIsRecipient(conversation, payload.new);
        }
      )
      .subscribe();

    fetchUnreadMessages();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile]);

  const fetchUnreadMessages = async () => {
    try {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`user1_id.eq.${userProfile?.user_id},user2_id.eq.${userProfile?.user_id}`)
        .eq('status', 'active');

      if (!conversations) return;

      const { data: messages, error } = await supabase
        .from('messages')
        .select('id')
        .in('conversation_id', conversations.map(c => c.id))
        .is('read_at', null)
        .neq('sender_id', userProfile?.user_id);

      if (error) throw error;
      
      setUnreadCount(messages?.length || 0);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  const checkIfUserIsRecipient = async (conversationId: string, message: any) => {
    try {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (!conversation) return;

      if (
        (conversation.user1_id === userProfile?.user_id || 
         conversation.user2_id === userProfile?.user_id) && 
        message.sender_id !== userProfile?.user_id
      ) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error checking message recipient:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion.",
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <div className="w-full h-16 flex items-center justify-between">
          <SideMenu />
          
          <div className="flex items-center gap-4">
            <Link 
              to="/messages" 
              className="relative hover:opacity-80 transition-opacity"
            >
              <MessagesSquare className="h-5 w-5 text-burgundy stroke-[1.5]" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link 
              to="/matching-scores" 
              className="hover:opacity-80 transition-opacity"
              title="Scores de compatibilité"
            >
              <Percent className="h-5 w-5 text-burgundy stroke-[1.5]" />
            </Link>
            
            <NotificationsMenu />
            
            <UserMenu 
              avatarUrl={avatarUrl}
              fullName={userProfile?.full_name}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>
    </header>
  );
}