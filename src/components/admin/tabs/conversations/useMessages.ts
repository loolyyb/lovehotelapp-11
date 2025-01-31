import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageWithProfiles } from "./types";

export function useMessages() {
  return useQuery<MessageWithProfiles[]>({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      console.log("Fetching messages for admin view");
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read_at,
          sender_id,
          conversation_id,
          sender:profiles!messages_sender_id_fkey(full_name, username),
          conversation:conversations(
            user1:profiles!conversations_user1_profile_fkey(full_name, username),
            user2:profiles!conversations_user2_profile_fkey(full_name, username)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }
      console.log("Fetched messages:", data);
      return data as MessageWithProfiles[];
    }
  });
}