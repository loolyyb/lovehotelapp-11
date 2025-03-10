
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { useLogger } from "@/hooks/useLogger";

export const MESSAGES_PER_PAGE = 10;

export function useMessagesManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { toast } = useToast();
  const logger = useLogger("useMessagesManagement");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-messages", currentPage, debouncedSearchTerm],
    queryFn: async () => {
      logger.info("Fetching messages for page:", { 
        page: currentPage, 
        search: debouncedSearchTerm 
      });
      
      // Build the base query to get total count
      let countQuery = supabase
        .from("messages")
        .select("*", { count: "exact", head: true });
        
      // Apply search filter if provided
      if (debouncedSearchTerm) {
        countQuery = countQuery.ilike('content', `%${debouncedSearchTerm}%`);
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) {
        logger.error("Error counting messages:", { error: countError });
        throw countError;
      }

      // Build the main query
      let messagesQuery = supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, username, full_name, avatar_url),
          conversation:conversations!messages_conversation_id_fkey(
            id,
            user1_id,
            user2_id,
            receiver1:profiles!conversations_user1_id_fkey(id, username, full_name),
            receiver2:profiles!conversations_user2_id_fkey(id, username, full_name)
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
        logger.error("Error fetching messages:", { error });
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
      
      logger.info(`Processed ${processedMessages?.length || 0} messages`, {
        totalCount: count
      });
      
      return { messages: processedMessages || [], totalCount: count || 0 };
    },
    refetchOnWindowFocus: false,
  });

  const markAsRead = async (messageId: string) => {
    try {
      logger.info("Marking message as read:", { messageId });
      
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);
      
      if (error) {
        logger.error("Error marking message as read:", { error });
        throw error;
      }
      
      toast({
        title: "Message marqué comme lu",
        description: "Le statut du message a été mis à jour"
      });
      
      refetch();
    } catch (error) {
      logger.error("Error marking message as read:", { error });
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de marquer le message comme lu"
      });
    }
  };

  const getConversationMessages = useCallback(async (conversationId: string) => {
    try {
      logger.info("Fetching conversation messages:", { conversationId });
      
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, username, full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) {
        logger.error("Error fetching conversation messages:", { error });
        throw error;
      }
      
      logger.info(`Retrieved ${data?.length || 0} conversation messages`);
      return data || [];
    } catch (error) {
      logger.error("Error in getConversationMessages:", { error });
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer la conversation complète"
      });
      return [];
    }
  }, [toast, logger]);

  const messages = data?.messages || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / MESSAGES_PER_PAGE));

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
