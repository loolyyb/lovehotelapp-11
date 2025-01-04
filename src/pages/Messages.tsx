import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageList } from "@/components/messages/MessageList";
import { MessageView } from "@/components/messages/MessageView";
import { useToast } from "@/hooks/use-toast";

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const { toast } = useToast();
  const user = supabase.auth.getUser();

  useEffect(() => {
    fetchConversations();
    subscribeToNewMessages();
  }, []);

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:profiles!conversations_user1_id_fkey(
            avatar_url,
            full_name
          ),
          user2:profiles!conversations_user2_id_fkey(
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
      setConversations(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les conversations",
      });
    }
  };

  const subscribeToNewMessages = () => {
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
    <div className="flex h-[calc(100vh-4rem)] bg-cream">
      <div className={`w-full md:w-[380px] border-r border-rose/20 ${selectedConversation ? 'hidden md:block' : ''}`}>
        <MessageList
          conversations={conversations}
          onSelectConversation={setSelectedConversation}
          selectedConversationId={selectedConversation}
        />
      </div>
      
      <div className={`flex-1 ${!selectedConversation ? 'hidden md:flex' : ''}`}>
        {selectedConversation ? (
          <MessageView
            conversationId={selectedConversation}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Sélectionnez une conversation pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
}