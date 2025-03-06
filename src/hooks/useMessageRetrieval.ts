
import { useMessageFetcher } from "./messages/useMessageFetcher";
import { useMessageMarker } from "./messages/useMessageMarker";

interface UseMessageRetrievalProps {
  conversationId: string;
  currentProfileId: string | null;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  toast: any;
}

export const useMessageRetrieval = ({ 
  conversationId, 
  currentProfileId, 
  setMessages, 
  toast 
}: UseMessageRetrievalProps) => {
  const { fetchMessages } = useMessageFetcher({
    conversationId,
    currentProfileId,
    setMessages,
    toast
  });

  const { markMessagesAsRead } = useMessageMarker({
    conversationId,
    currentProfileId
  });

  // Enhanced message fetching with additional debugging info
  const enhancedFetchMessages = async () => {
    console.log("⌛ Starting fetch messages operation", { conversationId, currentProfileId });
    const result = await fetchMessages();
    console.log("✅ Fetch messages complete", { 
      conversationId, 
      messagesCount: result?.length || 0,
      hasMessages: result && result.length > 0,
      firstMessage: result && result.length > 0 ? result[0] : null,
      lastMessage: result && result.length > 0 ? result[result.length - 1] : null
    });
    return result;
  };

  // Add delay before marking messages as read after fetching
  const fetchMessagesAndMarkAsRead = async () => {
    const messages = await enhancedFetchMessages();
    
    // Add delay before marking messages as read
    if (messages && messages.length > 0) {
      console.log("🔔 Will mark messages as read after delay", { 
        conversationId, 
        messagesCount: messages.length 
      });
      setTimeout(() => markMessagesAsRead(), 1000);
    }
    
    return messages;
  };

  return { 
    fetchMessages: fetchMessagesAndMarkAsRead,
    markMessagesAsRead
  };
};
