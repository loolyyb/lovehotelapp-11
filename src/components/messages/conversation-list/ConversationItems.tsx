
import { memo, useEffect } from "react";
import { ConversationItem } from "./ConversationItem";
import { useLogger } from "@/hooks/useLogger";

interface ConversationItemsProps {
  conversations: any[];
  selectedConversationId: string | null;
  currentProfileId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

// Using memo to prevent unnecessary re-renders
export const ConversationItems = memo(function ConversationItems({
  conversations,
  selectedConversationId,
  currentProfileId,
  onSelectConversation
}: ConversationItemsProps) {
  const logger = useLogger("ConversationItems");
  
  // Log conversation details on render, including sorting information
  useEffect(() => {
    logger.info("Rendering conversation items with data", { 
      count: conversations.length, 
      selectedId: selectedConversationId,
      conversationIds: conversations.map(c => c.id),
      // Log the latest message times to verify sorting
      latest_message_times: conversations.length > 0 
        ? conversations.map(c => ({
            id: c.id,
            time: c.latest_message_time || c.updated_at || c.created_at
          }))
        : []
    });
  }, [conversations, selectedConversationId, logger]);
  
  if (!conversations || conversations.length === 0) {
    logger.info("No conversations to render");
    return null;
  }
  
  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map(conversation => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={selectedConversationId === conversation.id}
          currentProfileId={currentProfileId}
          onSelect={() => onSelectConversation(conversation.id)}
        />
      ))}
    </div>
  );
});
