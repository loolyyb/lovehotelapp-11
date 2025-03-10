
import { useState, useCallback, useRef } from "react";
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
  const fetchAttemptsRef = useRef(0);
  const maxRetryAttempts = 3;

  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ["admin-messages", currentPage, debouncedSearchTerm],
    queryFn: async () => {
      console.log("Fetching messages for page:", currentPage, "search:", debouncedSearchTerm);
      fetchAttemptsRef.current += 1;
      
      try {
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
          throw new Error(`Error fetching message count: ${countError.message}`);
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

        const { data: messages, error: messagesError } = await messagesQuery;

        if (messagesError) {
          console.error("Error fetching messages:", messagesError);
          throw messagesError;
        }

        // Reset retry counter on success
        fetchAttemptsRef.current = 0;

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
      } catch (error) {
        console.error("Error in fetchMessages:", error);
        
        // Implement retry logic
        if (fetchAttemptsRef.current < maxRetryAttempts) {
          console.log(`Retry attempt ${fetchAttemptsRef.current} of ${maxRetryAttempts}`);
          return refetch();
        }
        
        throw error;
      }
    },
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
    retry: 2, // Additional retries beyond our manual ones
  });

  const markAsRead = useCallback(async (messageId: string) => {
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
  }, [refetch, toast]);

  const getConversationMessages = useCallback(async (conversationId: string) => {
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
  }, [toast]);

  const messages = data?.messages || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / MESSAGES_PER_PAGE);
  const isError = !!error;

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  return {
    messages,
    totalCount,
    totalPages,
    currentPage,
    setCurrentPage,
    isLoading,
    isError,
    markAsRead,
    getConversationMessages,
    searchTerm,
    setSearchTerm: handleSearchChange,
    clearSearch
  };
}
