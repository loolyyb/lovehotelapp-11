
import { useMessageFetcher } from "./useMessageFetcher";
import { useMessageMarker } from "./useMessageMarker";

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

  // Add delay before marking messages as read after fetching
  const fetchMessagesAndMarkAsRead = async () => {
    await fetchMessages();
    
    // Add delay before marking messages as read
    setTimeout(() => markMessagesAsRead(), 1000);
  };

  return { 
    fetchMessages: fetchMessagesAndMarkAsRead,
    markMessagesAsRead
  };
};
