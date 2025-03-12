
import { useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useMessagesPagination } from "./useMessagesPagination";
import { 
  fetchMessages, 
  fetchConversationMessages, 
  markMessageAsRead 
} from "../utils/messageFetchers";

export const MESSAGES_PER_PAGE = 10;

export function useMessagesManagement() {
  const { 
    currentPage, 
    setCurrentPage, 
    searchTerm, 
    debouncedSearchTerm, 
    setSearchTerm, 
    clearSearch 
  } = useMessagesPagination();
  
  const { toast } = useToast();
  const fetchAttemptsRef = useRef(0);
  const maxRetryAttempts = 3;

  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ["admin-messages", currentPage, debouncedSearchTerm],
    queryFn: async () => {
      fetchAttemptsRef.current += 1;
      console.log(`Attempting to fetch messages (attempt ${fetchAttemptsRef.current})`);
      
      try {
        const result = await fetchMessages(currentPage, debouncedSearchTerm, MESSAGES_PER_PAGE);
        
        // Reset retry counter on success
        fetchAttemptsRef.current = 0;
        console.log(`Successfully fetched ${result.messages.length} messages`);
        
        return result;
      } catch (error) {
        console.error("Error in fetchMessages query function:", error);
        
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
      await markMessageAsRead(messageId);
      
      toast({
        title: "Message marqué comme lu",
        description: "Le statut du message a été mis à jour"
      });
      
      refetch();
    } catch (error) {
      console.error("Error in markAsRead:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de marquer le message comme lu"
      });
    }
  }, [refetch, toast]);

  const getConversationMessages = useCallback(async (conversationId: string) => {
    try {
      return await fetchConversationMessages(conversationId);
    } catch (error) {
      console.error("Error in getConversationMessages:", error);
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
    setSearchTerm,
    clearSearch,
    refetch
  };
}
