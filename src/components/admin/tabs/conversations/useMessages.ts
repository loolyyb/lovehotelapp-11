import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageWithProfiles } from "./types";

export function useMessages() {
  return useQuery<MessageWithProfiles[]>({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      console.log("Starting messages fetch for admin view");
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read_at,
          sender_id,
          conversation_id,
          sender:profiles!sender_id(full_name, username),
          conversation:conversations(
            user1:profiles!conversations_user1_profile_fkey(full_name, username),
            user2:profiles!conversations_user2_profile_fkey(full_name, username)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error("Error fetching messages:", error);
        throw new Error(`Failed to fetch messages: ${error.message}`);
      }

      if (!data) {
        console.log("No messages found");
        return [];
      }

      console.log(`Successfully fetched ${data.length} messages`);

      // Transform the data to match MessageWithProfiles interface
      const messages: MessageWithProfiles[] = data.map((message: any) => {
        console.log(`Processing message ${message.id}`);
        return {
          id: message.id,
          content: message.content,
          created_at: message.created_at,
          read_at: message.read_at,
          sender_id: message.sender_id,
          conversation_id: message.conversation_id,
          sender: message.sender ? {
            full_name: message.sender.full_name,
            username: message.sender.username
          } : null,
          conversation: message.conversation ? {
            user1: message.conversation.user1 ? {
              full_name: message.conversation.user1.full_name,
              username: message.conversation.user1.username
            } : null,
            user2: message.conversation.user2 ? {
              full_name: message.conversation.user2.full_name,
              username: message.conversation.user2.username
            } : null,
          } : null
        };
      });

      return messages;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 1000, // Consider data stale after 1 second
    retry: 3, // Retry failed requests 3 times
    meta: {
      errorMessage: "Impossible de charger les messages"
    }
  });
}