import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Home, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header({ userProfile }: { userProfile?: any }) {
  const [isOpen, setIsOpen] = useState(false);
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
          // Only count messages where the current user is the recipient
          const conversation = payload.new.conversation_id;
          checkIfUserIsRecipient(conversation, payload.new);
        }
      )
      .subscribe();

    // Initial fetch of unread messages
    fetchUnreadMessages();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile]);

  const fetchUnreadMessages = async () => {
    try {
      // Get all conversations where the user is a participant
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`user1_id.eq.${userProfile?.user_id},user2_id.eq.${userProfile?.user_id}`)
        .eq('status', 'active');

      if (!conversations) return;

      // Get unread messages count from these conversations
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

      // If the message is for the current user and they didn't send it
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
      setIsOpen(false);
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
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-rose/10">
                <Menu className="h-5 w-5 text-burgundy" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-white/95 backdrop-blur-sm">
              <img 
                src="https://lovehotelaparis.fr/wp-content/uploads/2024/09/logo-web-love-hotel.png"
                alt="Love Hotel Logo"
                className="h-24 mx-auto mb-6 object-contain"
              />
              <nav className="flex flex-col gap-4">
                <Link 
                  to="/" 
                  className="flex items-center gap-3 px-4 py-2 text-burgundy hover:bg-rose/10 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  <span>Accueil</span>
                </Link>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-3 px-4 py-2 text-burgundy hover:bg-rose/10 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>Mon Profil</span>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-4">
            <Link 
              to="/messages" 
              className="relative hover:opacity-80 transition-opacity"
            >
              <MessageCircle className="h-6 w-6 text-burgundy" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 hover:bg-transparent">
                  <Avatar className="h-10 w-10 cursor-pointer">
                    <AvatarImage src={avatarUrl} alt={userProfile?.full_name} />
                    <AvatarFallback>{userProfile?.full_name?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>Mon Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-burgundy cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}