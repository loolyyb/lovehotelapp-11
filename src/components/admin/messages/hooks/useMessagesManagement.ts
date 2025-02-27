
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";

export const MESSAGES_PER_PAGE = 10;

export function useMessagesManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-messages", currentPage, debouncedSearchTerm],
    queryFn: async () => {
      console.log("Fetching messages for page:", currentPage, "search:", debouncedSearchTerm);
      
      // Build the base query to get total count
      let countQuery = supabase
        .from("messages")
        .select("*", { count: "exact", head: true });
        
      // Apply search filter if provided
      if (debouncedSearchTerm) {
        countQuery = countQuery.ilike('content', `%${debouncedSearchTerm}%`);
      }
      
      const { count } = await countQuery;

      // Build the main query
      let messagesQuery = supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(username, full_name, avatar_url),
          conversation:conversations!messages_conversation_id_fkey(
            user1_id,
            user2_id,
            receiver1:profiles!conversations_user1_id_fkey(username, full_name),
            receiver2:profiles!conversations_user2_id_fkey(username, full_name)
          )
        `)
        .order("created_at", { ascending: false });
      
      // Apply search filter if provided
      if (debouncedSearchTerm) {
        messagesQuery = messagesQuery.ilike('content', `%${debouncedSearchTerm}%`);
      }
      
      // Apply pagination
      messagesQuery = messagesQuery.range(
        (currentPage - 1) * MESSAGES_PER_PAGE, 
        currentPage * MESSAGES_PER_PAGE - 1
      );

      const { data: messages, error } = await messagesQuery;

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }

      const processedMessages = messages?.map(message => {
        const conversation = message.conversation;
        let recipient;

        if (message.sender_id === conversation.user1_id) {
          recipient = conversation.receiver2;
        } else {
          recipient = conversation.receiver1;
        }

        return {
          ...message,
          recipient
        };
      });
      
      return { messages: processedMessages, totalCount: count };
    },
  });

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);
      
      if (error) throw error;
      
      toast({
        title: "Message marqué comme lu",
        description: "Le statut du message a été mis à jour"
      });
      
      refetch();
    } catch (error) {
      console.error("Error marking message as read:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de marquer le message comme lu"
      });
    }
  };

  const getConversationMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, username, full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer la conversation complète"
      });
      return [];
    }
  };

  const messages = data?.messages || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / MESSAGES_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  return {
    messages,
    totalCount,
    totalPages,
    currentPage,
    setCurrentPage,
    isLoading,
    markAsRead,
    getConversationMessages,
    searchTerm,
    setSearchTerm: handleSearchChange,
    clearSearch
  };
}
